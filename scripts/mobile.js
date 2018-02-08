// Mobile Debugger
var MobileDebugger = /** @class */ (function () {
    function MobileDebugger() {
        this.connectToDebugger = window.location.search.indexOf('?ws://') === 0;
    }
    MobileDebugger.prototype.start = function () {
        if (this.connectToDebugger) {
            var wsServices = decodeURIComponent(window.location.search.substring(1)).split("|||");
            var found_1 = false;
            wsServices.filter(function (it) { return it.trim().length > 0 && it.indexOf("ws://") >= 0; }).forEach(function (wsServer) {
                var wsHostname = wsServer.substring(5).split(':')[0];
                var wsPort = parseInt(wsServer.substring(5).split(':')[1]);
                var xmlRequest = new XMLHttpRequest();
                xmlRequest.timeout = 5000;
                xmlRequest.open("GET", "http://" + wsHostname + ":" + (wsPort + 1) + "/status", true);
                xmlRequest.onloadend = function () {
                    if (found_1 === true) {
                        return;
                    }
                    if (xmlRequest.responseText === "continue") {
                        found_1 = true;
                        XT.Debug.worker = new Worker('libs/Core/xt.debugWorker.web.min.js');
                        XT.Debug.connect(wsHostname, wsPort);
                        XT.Debug.reloadHandler = function (source, force) {
                            if (force === true) {
                                window.location.reload();
                            }
                            else {
                                window.eval(source);
                            }
                        };
                    }
                };
                xmlRequest.send();
            });
        }
        else {
        }
    };
    return MobileDebugger;
}());
var mobileDebugger = new MobileDebugger();
mobileDebugger.start();
