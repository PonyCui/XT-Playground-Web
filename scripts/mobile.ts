// Mobile Debugger

class MobileDebugger {

    private connectToDebugger = window.location.search.indexOf('?ws://') === 0

    start() {
        if (this.connectToDebugger) {
            const wsServices = decodeURIComponent(window.location.search.substring(1)).split("|||")
            let found = false
            wsServices.filter(it => it.trim().length > 0 && it.indexOf("ws://") >= 0).forEach(wsServer => {
                const wsHostname = wsServer.substring(5).split(':')[0]
                const wsPort = parseInt(wsServer.substring(5).split(':')[1]);
                const xmlRequest = new XMLHttpRequest();
                xmlRequest.timeout = 5000;
                xmlRequest.open("GET", "http://" + wsHostname + ":" + (wsPort + 1) + "/status", true);
                xmlRequest.onloadend = () => {
                    if (found === true) { return }
                    if (xmlRequest.responseText === "continue") {
                        found = true;
                        (XT.Debug as any).worker = new Worker('libs/Core/xt.debugWorker.web.min.js');
                        (XT.Debug as any).connect(wsHostname, wsPort);
                        (XT.Debug as any).reloadHandler = function (source, force) {
                            if (force === true) {
                                window.location.reload()
                            }
                            else {
                                (window as any).eval(source);
                            }
                        }
                    }
                }
                xmlRequest.send();
            })
        }
        else {

        }
    }

}

var mobileDebugger = new MobileDebugger()
mobileDebugger.start()