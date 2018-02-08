/// <reference path="../libs/xt.d.ts" />
var XTPlayground = /** @class */ (function () {
    function XTPlayground() {
        this.debuggerAddress = "127.0.0.1:8081";
        this.connectToDebugger = false;
        this.repl = "";
        this.device = "iPhone 7";
        this.screen = { width: 375, height: 667 };
        this.currentTmpFile = undefined;
    }
    XTPlayground.prototype.onConnecting = function () {
        document.querySelector('#actionButton').innerHTML = "Connecting...";
    };
    XTPlayground.prototype.onConnected = function () {
        document.querySelector('#actionButton').innerHTML = "Connected";
    };
    XTPlayground.prototype.tryToConnectDebugger = function () {
        var _this = this;
        this.findDebuggerAddress(function (addr) {
            _this.debuggerAddress = addr;
            _this.checkDebuggerOnline(function (online) {
                if (online) {
                    _this.connectToDebugger = true;
                    _this.openPreviewer();
                }
            });
        });
    };
    XTPlayground.prototype.findDebuggerAddress = function (callback) {
        if (window.location.hostname.indexOf(".com") > 0) {
            callback("127.0.0.1:8081");
            return;
        }
        var xmlRequest = new XMLHttpRequest();
        xmlRequest.timeout = 5000;
        xmlRequest.onloadend = function () {
            callback(xmlRequest.responseText === "continue" ? window.location.hostname + ":8081" : "127.0.0.1:8081");
        };
        xmlRequest.onerror = function () {
            callback("127.0.0.1:8081");
        };
        xmlRequest.open("GET", "http://" + window.location.hostname + ":8082/status", true);
        xmlRequest.send();
    };
    XTPlayground.prototype.checkDebuggerOnline = function (callback) {
        var xmlRequest = new XMLHttpRequest();
        xmlRequest.timeout = 5000;
        xmlRequest.open("GET", "http://" + this.debuggerAddress.split(":")[0] + ":8082/status", true);
        xmlRequest.onloadend = function () {
            callback(xmlRequest.responseText === "continue");
        };
        xmlRequest.onerror = function () {
            callback(false);
        };
        xmlRequest.send();
    };
    XTPlayground.prototype.resetDebuggerAddress = function () {
        var newValue = prompt("Enter Debugger IP & Port", this.debuggerAddress);
        if (newValue) {
            this.debuggerAddress = newValue;
            this.resetPreviewer();
        }
    };
    XTPlayground.prototype.resetPreviewer = function () {
        document.querySelector('#actionButton').innerHTML = "Open Editor";
        document.querySelector('#runner').style.width = this.screen.width.toString() + "px";
        document.querySelector('#runner').style.height = this.screen.height.toString() + "px";
        document.querySelector('#runner').setAttribute('src', "runner.html?" + new Date().getTime());
    };
    XTPlayground.prototype.openEditor = function () {
        var _this = this;
        document.querySelector('#editor').style.display = '';
        document.querySelector('#editor').style.visibility = '';
        document.querySelector('#previewer').style.display = 'none';
        document.querySelector('#actionButton').innerHTML = "Run";
        document.querySelector('#actionButton').onclick = function () {
            _this.repl = EditorFrame.getValue();
            _this.openPreviewer();
        };
    };
    XTPlayground.prototype.openPreviewer = function () {
        var _this = this;
        document.querySelector('#editor').style.display = 'none';
        document.querySelector('#previewer').style.display = '';
        document.querySelector('#actionButton').innerHTML = "Open Editor";
        document.querySelector('#actionButton').onclick = function () {
            _this.openEditor();
        };
        this.resetPreviewer();
    };
    XTPlayground.prototype.setupMenu = function () {
        var _this = this;
        var menu = new mdc.menu.MDCMenu(document.querySelector('#more-menu'));
        var toggle = document.querySelector('.toggle');
        toggle.addEventListener('click', function () {
            document.querySelector('#connectToDebuggerToggleButton').innerHTML = _this.connectToDebugger === true ? "Disconnect From Debugger" : "Connect To Debugger";
            menu.open = !menu.open;
        });
    };
    XTPlayground.prototype.setupQRCode = function () {
        var _this = this;
        var MDCDialog = mdc.dialog.MDCDialog;
        var MDCDialogFoundation = mdc.dialog.MDCDialogFoundation;
        var util = mdc.dialog.util;
        var dialog = mdc.dialog.MDCDialog.attachTo(document.querySelector('#qrcode-mdc-dialog'));
        document.querySelector('#showQRCode').addEventListener('click', function () {
            document.getElementById("qrcode_area").innerHTML = '';
            if (_this.connectToDebugger === true) {
                var xmlRequest_1 = new XMLHttpRequest();
                xmlRequest_1.timeout = 5000;
                xmlRequest_1.onloadend = function () {
                    try {
                        var addresses = JSON.parse(xmlRequest_1.responseText);
                        if (addresses instanceof Array) {
                            new QRCode(document.getElementById("qrcode_area"), {
                                text: "http://" + window.location.host + window.location.pathname + "/mobile.html?" + addresses.map(function (it) { return "ws://" + it; }).join("%7C%7C%7C"),
                                width: 320,
                                height: 320,
                                colorDark: "#0e4ead",
                                colorLight: "#ffffff",
                                correctLevel: QRCode.CorrectLevel.L
                            });
                        }
                    }
                    catch (error) { }
                };
                xmlRequest_1.open("GET", "http://" + _this.debuggerAddress.split(":")[0] + ":8082/addr", true);
                xmlRequest_1.send();
            }
            else if ((_this.repl = EditorFrame.getValue()) && typeof _this.repl === "string") {
                var repl = UglifyJS.minify(_this.repl).code;
                var createQRCode = function (deflateString, utf8) {
                    if (deflateString.length < 1024) {
                        new QRCode(document.getElementById("qrcode_area"), {
                            text: "http://" + window.location.host + window.location.pathname + "/mobile.html?eval=" + deflateString + "&utf8=" + (utf8 ? "true" : "false") + "&",
                            width: 320,
                            height: 320,
                            colorDark: "#0e4ead",
                            colorLight: "#ffffff",
                            correctLevel: QRCode.CorrectLevel.L
                        });
                    }
                    else {
                        var uploadRequest_1 = new XMLHttpRequest();
                        _this.currentTmpFile = "tmp_" + performance.now() + "_" + Math.random().toString() + ".min.js";
                        uploadRequest_1.onloadend = function () {
                            new QRCode(document.getElementById("qrcode_area"), {
                                text: "http://" + window.location.host + window.location.pathname + "/mobile.html?url=" + uploadRequest_1.responseURL + "&utf8=" + (utf8 ? "true" : "false") + "&",
                                width: 320,
                                height: 320,
                                colorDark: "#0e4ead",
                                colorLight: "#ffffff",
                                correctLevel: QRCode.CorrectLevel.L
                            });
                        };
                        uploadRequest_1.open("PUT", "http://xt-playground.oss-cn-shenzhen.aliyuncs.com/" + _this.currentTmpFile, true);
                        uploadRequest_1.setRequestHeader("Content-Type", "text/plain");
                        uploadRequest_1.send(deflateString);
                    }
                };
                if (/[^\u0000-\u007f]/.test(repl)) {
                    var arrayBuffer = new ArrayBuffer(repl.length * 2);
                    var bufferView = new Uint16Array(arrayBuffer);
                    for (var i = 0, count = repl.length; i < count; i++) {
                        bufferView[i] = repl.charCodeAt(i);
                    }
                    var deflateString = btoa(pako.deflate(new Uint8Array(bufferView.buffer), { to: 'string' }));
                    createQRCode(deflateString, true);
                }
                else {
                    var arrayBuffer = new ArrayBuffer(repl.length);
                    var bufferView = new Uint8Array(arrayBuffer);
                    for (var i = 0, count = repl.length; i < count; i++) {
                        bufferView[i] = repl.charCodeAt(i);
                    }
                    var deflateString = btoa(pako.deflate(bufferView.buffer, { to: 'string' }));
                    createQRCode(deflateString, false);
                }
            }
            dialog.show();
        });
        dialog.listen('MDCDialog:cancel', function () { _this.deleteTmpFile(); });
        document.querySelector('#qrcode-ok-button').addEventListener('click', function () { _this.deleteTmpFile(); });
    };
    XTPlayground.prototype.deleteTmpFile = function () {
        if (this.currentTmpFile) {
            var deleteRequest = new XMLHttpRequest();
            deleteRequest.open("DELETE", "http://xt-playground.oss-cn-shenzhen.aliyuncs.com/" + this.currentTmpFile, true);
            deleteRequest.send();
            this.currentTmpFile = undefined;
        }
    };
    XTPlayground.prototype.setupDeviceChooser = function () {
        var _this = this;
        var screens = {
            "iPhone 7": { width: 375, height: 667 },
            "iPhone 7 Plus": { width: 414, height: 736 },
            "iPhone X": { width: 375, height: 812 },
            "iPhone 5": { width: 320, height: 568 },
            "iPhone 4": { width: 320, height: 480 },
            "iPad": { width: 768, height: 1024 },
            "iPad Pro": { width: 1024, height: 1336 },
            "Galaxy S5": { width: 360, height: 640 },
            "Nexus 5X": { width: 412, height: 732 }
        };
        var select = new mdc.select.MDCSelect(document.querySelector('#device-chooser'));
        select.listen('MDCSelect:change', function () {
            _this.device = select.selectedOptions[0].textContent.trim();
            _this.screen = screens[_this.device] || screens["iPhone 7"];
            _this.resetPreviewer();
        });
    };
    XTPlayground.prototype.autoInit = function () {
        var _this = this;
        this.openEditor();
        this.tryToConnectDebugger();
        this.setupMenu();
        this.setupQRCode();
        this.setupDeviceChooser();
        document.querySelector('#connectToDebuggerToggleButton').addEventListener('click', function () {
            _this.connectToDebugger = !_this.connectToDebugger;
            _this.resetPreviewer();
            if (_this.connectToDebugger === true) {
                _this.openPreviewer();
            }
            else {
                _this.openEditor();
            }
        });
        document.querySelector("#resetDebugger").addEventListener('click', function () {
            _this.resetDebuggerAddress();
        });
    };
    return XTPlayground;
}());
