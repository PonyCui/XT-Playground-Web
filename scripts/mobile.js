/// <reference path="../libs/xt.d.ts" />
var MobileDebugger = /** @class */ (function () {
    function MobileDebugger() {
    }
    MobileDebugger.prototype.start = function () {
        if (window.location.search.indexOf('?ws://') === 0) {
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
                                var url = URL.createObjectURL(new Blob([source], { type: "text/plain" }));
                                var context_1 = UI.Context.startWithURL(url, {}, function () {
                                    context_1.attachTo();
                                }, function (e) { alert(e.message); });
                            }
                        };
                    }
                };
                xmlRequest.send();
            });
        }
        else if (window.location.search.indexOf('?eval=') === 0) {
            var base64Encoded = window.location.search.substring(6).split("&")[0];
            var source = decodeURIComponent(escape(String.fromCharCode.apply(null, pako.inflate(atob(base64Encoded)))));
            var url = URL.createObjectURL(new Blob([source], { type: "text/plain" }));
            var context_2 = UI.Context.startWithURL(url, {}, function () {
                context_2.attachTo();
            }, function (e) { alert(e.message); });
        }
        else if (window.location.search.indexOf('?url=') === 0) {
            var downloadRequest_1 = new XMLHttpRequest();
            downloadRequest_1.onloadend = function () {
                var source = downloadRequest_1.responseText;
                var url = URL.createObjectURL(new Blob([source], { type: "text/plain" }));
                var context = UI.Context.startWithURL(url, {}, function () {
                    context.attachTo();
                }, function (e) { alert(e.message); });
            };
            downloadRequest_1.open("GET", atob(window.location.search.substring(5).split("&")[0]), true);
            downloadRequest_1.send();
        }
    };
    return MobileDebugger;
}());
var mobileDebugger = new MobileDebugger();
mobileDebugger.start();
