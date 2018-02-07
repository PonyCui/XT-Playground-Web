/// <reference path="../libs/xt.d.ts" />
var XTPlayground = /** @class */ (function () {
    function XTPlayground() {
        this.debuggerAddress = this.findDebuggerAddress();
        this.connectToDebugger = this.checkDebuggerOnline();
        this.repl = "";
        this.device = "iPhone 7";
        this.screen = { width: 375, height: 667 };
    }
    XTPlayground.prototype.onConnecting = function () {
        document.querySelector('#actionButton').innerHTML = "Connecting...";
    };
    XTPlayground.prototype.onConnected = function () {
        document.querySelector('#actionButton').innerHTML = "Connected";
    };
    XTPlayground.prototype.findDebuggerAddress = function () {
        if (window.location.hostname.indexOf(".com") > 0) {
            return "127.0.0.1:8081";
        }
        try {
            var xmlRequest = new XMLHttpRequest();
            xmlRequest.open("GET", "http://" + window.location.hostname + ":8082/status", false);
            xmlRequest.send();
            return xmlRequest.responseText === "continue" ? window.location.hostname + ":8081" : "127.0.0.1:8081";
        }
        catch (error) {
            return "127.0.0.1:8081";
        }
    };
    XTPlayground.prototype.checkDebuggerOnline = function () {
        try {
            var xmlRequest = new XMLHttpRequest();
            xmlRequest.open("GET", "http://" + this.debuggerAddress.split(":")[0] + ":8082/status", false);
            xmlRequest.send();
            return xmlRequest.responseText === "continue";
        }
        catch (error) {
            return false;
        }
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
        var menu = new mdc.menu.MDCMenu(document.querySelector('#more-menu'));
        var toggle = document.querySelector('.toggle');
        toggle.addEventListener('click', function () {
            document.querySelector('#connectToDebuggerToggleButton').innerHTML = this.connectToDebugger === true ? "Disconnect From Debugger" : "Connect To Debugger";
            menu.open = !menu.open;
        });
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
        if (this.connectToDebugger) {
            this.openPreviewer();
        }
        else {
            this.openEditor();
        }
        this.setupMenu();
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
