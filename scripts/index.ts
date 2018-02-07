/// <reference path="../libs/xt.d.ts" />
declare var mdc: any
declare var EditorFrame: any

class XTPlayground {

    debuggerAddress: string = this.findDebuggerAddress()
    connectToDebugger: boolean = this.checkDebuggerOnline()
    repl = "";
    device = "iPhone 7";
    screen = { width: 375, height: 667 };

    onConnecting() {
        document.querySelector('#actionButton').innerHTML = "Connecting..."
    }

    onConnected() {
        document.querySelector('#actionButton').innerHTML = "Connected"
    }

    findDebuggerAddress() {
        if (window.location.hostname.indexOf(".com") > 0) {
            return "127.0.0.1:8081"
        }
        try {
            var xmlRequest = new XMLHttpRequest()
            xmlRequest.open("GET", "http://" + window.location.hostname + ":8082/status", false)
            xmlRequest.send()
            return xmlRequest.responseText === "continue" ? window.location.hostname + ":8081" : "127.0.0.1:8081"
        } catch (error) {
            return "127.0.0.1:8081"
        }
    }

    checkDebuggerOnline() {
        try {
            var xmlRequest = new XMLHttpRequest()
            xmlRequest.open("GET", "http://" + this.debuggerAddress.split(":")[0] + ":8082/status", false)
            xmlRequest.send()
            return xmlRequest.responseText === "continue"
        } catch (error) {
            return false
        }
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
            this.openEditor()
        }
        this.resetPreviewer()
    }

    setupMenu() {
        var menu = new mdc.menu.MDCMenu(document.querySelector('#more-menu'));
        var toggle = document.querySelector('.toggle');
        toggle.addEventListener('click', function () {
            document.querySelector('#connectToDebuggerToggleButton').innerHTML = this.connectToDebugger === true ? "Disconnect From Debugger" : "Connect To Debugger"
            menu.open = !menu.open;
        });
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
        if (this.connectToDebugger) {
            this.openPreviewer()
        }
        else {
            this.openEditor()
        }
        this.setupMenu()
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

