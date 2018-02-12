/// <reference path="../libs/xt.d.ts" />
declare var mdc: any
declare var EditorFrame: any
declare var QRCode: any
declare var pako: any
declare var UglifyJS: any
declare var unescape: any;
declare var escape: any;

class XTPlayground {

    debuggerAddress: string = "127.0.0.1:8081"
    connectToDebugger: boolean = false
    repl = "";
    device = "iPhone 7";
    screen = { width: 375, height: 667 };

    onConnecting() {
        document.querySelector('#actionButton').innerHTML = "Connecting..."
    }

    onConnected() {
        document.querySelector('#actionButton').innerHTML = "Connected"
    }

    tryToConnectDebugger() {
        this.findDebuggerAddress((addr) => {
            this.debuggerAddress = addr
            this.checkDebuggerOnline((online) => {
                if (online) {
                    this.connectToDebugger = true
                    this.openPreviewer()
                }
            })
        })
    }

    findDebuggerAddress(callback: (addr: string) => void) {
        if (window.location.hostname.indexOf(".com") > 0) {
            callback("127.0.0.1:8081")
            return
        }
        var xmlRequest = new XMLHttpRequest()
        xmlRequest.timeout = 5000
        xmlRequest.onloadend = () => {
            callback(xmlRequest.responseText === "continue" ? window.location.hostname + ":8081" : "127.0.0.1:8081")
        }
        xmlRequest.onerror = () => {
            callback("127.0.0.1:8081")
        }
        xmlRequest.open("GET", "http://" + window.location.hostname + ":8082/status", true)
        xmlRequest.send()
    }

    checkDebuggerOnline(callback: (online: boolean) => void) {
        var xmlRequest = new XMLHttpRequest()
        xmlRequest.timeout = 5000
        xmlRequest.open("GET", "http://" + this.debuggerAddress.split(":")[0] + ":8082/status", true)
        xmlRequest.onloadend = () => {
            callback(xmlRequest.responseText === "continue")
        }
        xmlRequest.onerror = () => {
            callback(false)
        }
        xmlRequest.send()
    }

    resetDebuggerAddress() {
        var newValue = prompt("Enter Debugger IP & Port", this.debuggerAddress)
        if (newValue) {
            this.debuggerAddress = newValue;
            this.resetPreviewer()
        }
    }

    resetPreviewer() {
        document.querySelector('#actionButton').innerHTML = "Open Editor";
        (document.querySelector('#runner') as HTMLElement).style.width = this.screen.width.toString() + "px";
        (document.querySelector('#runner') as HTMLElement).style.height = this.screen.height.toString() + "px";
        document.querySelector('#runner').setAttribute('src', "runner.html?" + new Date().getTime());
    }

    openEditor() {
        (document.querySelector('#editor') as HTMLElement).style.display = '';
        (document.querySelector('#editor') as HTMLElement).style.visibility = '';
        (document.querySelector('#previewer') as HTMLElement).style.display = 'none';
        document.querySelector('#actionButton').innerHTML = "Run";
        (document.querySelector('#actionButton') as HTMLElement).onclick = () => {
            this.repl = EditorFrame.getValue()
            this.openPreviewer()
        }
    }

    openPreviewer() {
        (document.querySelector('#editor') as HTMLElement).style.display = 'none';
        (document.querySelector('#previewer') as HTMLElement).style.display = '';
        document.querySelector('#actionButton').innerHTML = "Open Editor";
        (document.querySelector('#actionButton') as HTMLElement).onclick = () => {
            if (this.connectToDebugger) { return }
            this.openEditor()
        }
        this.resetPreviewer()
    }

    setupMenu() {
        var menu = new mdc.menu.MDCMenu(document.querySelector('#more-menu'));
        var toggle = document.querySelector('.toggle');
        toggle.addEventListener('click', () => {
            document.querySelector('#connectToDebuggerToggleButton').innerHTML = this.connectToDebugger === true ? "Disconnect From Debugger" : "Connect To Debugger"
            menu.open = !menu.open;
        });
    }

    private currentTmpFile: string | undefined = undefined

    setupQRCode() {
        const MDCDialog = mdc.dialog.MDCDialog;
        const MDCDialogFoundation = mdc.dialog.MDCDialogFoundation;
        const util = mdc.dialog.util;
        const dialog = mdc.dialog.MDCDialog.attachTo(document.querySelector('#qrcode-mdc-dialog'));
        document.querySelector('#showQRCode').addEventListener('click', () => {
            document.getElementById("qrcode_area").innerHTML = '';
            if (this.connectToDebugger === true) {
                const xmlRequest = new XMLHttpRequest();
                xmlRequest.timeout = 5000
                xmlRequest.onloadend = () => {
                    try {
                        const addresses = JSON.parse(xmlRequest.responseText)
                        if (addresses instanceof Array) {
                            new QRCode(document.getElementById("qrcode_area"), {
                                text: "http://" + window.location.host + window.location.pathname + "/mobile.html?" + addresses.map(it => "ws://" + it).join("%7C%7C%7C"),
                                width: 320,
                                height: 320,
                                colorDark: "#0e4ead",
                                colorLight: "#ffffff",
                                correctLevel: QRCode.CorrectLevel.L
                            });
                        }
                    } catch (error) { }
                }
                xmlRequest.open("GET", "http://" + this.debuggerAddress.split(":")[0] + ":8082/addr", true)
                xmlRequest.send()
            }
            else if ((this.repl = EditorFrame.getValue()) && typeof this.repl === "string") {
                const repl = UglifyJS.minify(this.repl).code
                const createQRCode = (repl: string, deflateString: string) => {
                    if (deflateString.length < 1024) {
                        new QRCode(document.getElementById("qrcode_area"), {
                            text: "http://" + window.location.host + window.location.pathname + "/mobile.html?eval=" + deflateString + "&",
                            width: 320,
                            height: 320,
                            colorDark: "#0e4ead",
                            colorLight: "#ffffff",
                            correctLevel: QRCode.CorrectLevel.L
                        });
                    }
                    else {
                        const uploadRequest = new XMLHttpRequest()
                        this.currentTmpFile = "tmp_" + performance.now() + "_" + Math.random().toString() + ".min.js"
                        uploadRequest.onloadend = () => {
                            new QRCode(document.getElementById("qrcode_area"), {
                                text: "http://" + window.location.host + window.location.pathname + "/mobile.html?url=" + btoa(uploadRequest.responseURL) + "&",
                                width: 320,
                                height: 320,
                                colorDark: "#0e4ead",
                                colorLight: "#ffffff",
                                correctLevel: QRCode.CorrectLevel.L
                            });
                        }
                        uploadRequest.open("PUT", "http://xt-playground.oss-cn-shenzhen.aliyuncs.com/" + this.currentTmpFile, true)
                        uploadRequest.setRequestHeader("Content-Type", "text/plain")
                        uploadRequest.send(repl)
                    }
                }
                const trimRepl = unescape(encodeURIComponent(repl))
                const arrayBuffer = new ArrayBuffer(trimRepl.length);
                let bufferView = new Uint8Array(arrayBuffer);
                for (let i = 0, count = trimRepl.length; i < count; i++) {
                    bufferView[i] = trimRepl.charCodeAt(i);
                }
                const deflateString = btoa(pako.deflate(bufferView.buffer, { to: 'string' }))
                createQRCode(repl, deflateString)
            }
            dialog.show()
        });
        dialog.listen('MDCDialog:cancel', () => { this.deleteTmpFile() })
        document.querySelector('#qrcode-ok-button').addEventListener('click', () => { this.deleteTmpFile() })
    }

    deleteTmpFile() {
        if (this.currentTmpFile) {
            const deleteRequest = new XMLHttpRequest()
            deleteRequest.open("DELETE", "http://xt-playground.oss-cn-shenzhen.aliyuncs.com/" + this.currentTmpFile, true)
            deleteRequest.send()
            this.currentTmpFile = undefined
        }
    }

    setupDeviceChooser() {
        var screens = {
            "iPhone 7": { width: 375, height: 667 },
            "iPhone 7 Plus": { width: 414, height: 736 },
            "iPhone X": { width: 375, height: 812 },
            "iPhone 5": { width: 320, height: 568 },
            "iPhone 4": { width: 320, height: 480 },
            "iPad": { width: 768, height: 1024 },
            "iPad Pro": { width: 1024, height: 1336 },
            "Galaxy S5": { width: 360, height: 640 },
            "Nexus 5X": { width: 412, height: 732 },
        };
        var select = new mdc.select.MDCSelect(document.querySelector('#device-chooser'));
        select.listen('MDCSelect:change', () => {
            this.device = select.selectedOptions[0].textContent.trim()
            this.screen = screens[this.device] || screens["iPhone 7"]
            this.resetPreviewer()
        });
    }

    autoInit() {
        this.openEditor()
        this.tryToConnectDebugger()
        this.setupMenu()
        this.setupQRCode()
        this.setupDeviceChooser()
        document.querySelector('#connectToDebuggerToggleButton').addEventListener('click', () => {
            this.connectToDebugger = !this.connectToDebugger
            this.resetPreviewer()
            if (this.connectToDebugger === true) {
                this.openPreviewer()
            }
            else {
                this.openEditor()
            }
        })
        document.querySelector("#resetDebugger").addEventListener('click', () => {
            this.resetDebuggerAddress()
        })
    }

}

