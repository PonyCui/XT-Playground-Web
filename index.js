var XTPlayground = function () {

    var findDebuggerAddress = function () {
        try {
            var xmlRequest = new XMLHttpRequest()
            xmlRequest.open("GET", "http://" + window.location.hostname + ":8082/status", false)
            xmlRequest.send()
            return xmlRequest.responseText === "continue" ? window.location.hostname + ":8081" : "127.0.0.1:8081"
        } catch (error) {
            return "127.0.0.1:8081"
        }
    }

    var checkDebuggerOnline = function () {
        try {
            var xmlRequest = new XMLHttpRequest()
            xmlRequest.open("GET", "http://" + window.location.hostname + ":8082/status", false)
            xmlRequest.send()
            return xmlRequest.responseText === "continue"
        } catch (error) {
            return false
        }
    }

    var config = {
        repl: "",
        debuggerAddress: findDebuggerAddress(),
        connectToDebugger: checkDebuggerOnline(),
        connecting: function () {
            document.querySelector('#actionButton').innerHTML = "Connecting..."
        },
        connected: function () {
            document.querySelector('#actionButton').innerHTML = "Connected"
        },
    };

    var resetDebuggerAddress = function () {
        var newValue = prompt("Enter Debugger IP & Port", config.debuggerAddress)
        if (newValue) {
            config.debuggerAddress = newValue;
            resetPreviewer()
        }
    }

    var resetPreviewer = function () {
        document.querySelector('#actionButton').innerHTML = "Open Editor"
        document.querySelector('#runner').setAttribute('src', "runner.html?" + new Date().getTime())
    }

    var openEditor = function () {
        document.querySelector('#editor').style.display = ''
        document.querySelector('#previewer').style.display = 'none'
        document.querySelector('#actionButton').innerHTML = "Run"
        document.querySelector('#actionButton').onclick = function () {
            config.repl = _editor.getValue()
            openPreviewer()
        }
    }

    var openPreviewer = function () {
        document.querySelector('#editor').style.display = 'none'
        document.querySelector('#previewer').style.display = ''
        document.querySelector('#actionButton').innerHTML = "Open Editor"
        document.querySelector('#actionButton').onclick = function () {
            openEditor()
        }
        resetPreviewer()
    }

    var autoInit = function () {
        if (config.connectToDebugger) {
            openPreviewer()
        }
        else {
            openEditor()
        }
        var menuEl = document.querySelector('#more-menu');
        var menu = new mdc.menu.MDCMenu(menuEl);
        var toggle = document.querySelector('.toggle');
        toggle.addEventListener('click', function () {
            document.querySelector('#connectToDebuggerToggleButton').innerHTML = config.connectToDebugger === true ? "Disconnect From Debugger" : "Connect To Debugger"
            menu.open = !menu.open;
        });
        document.querySelector('#connectToDebuggerToggleButton').addEventListener('click', function () {
            config.connectToDebugger = !config.connectToDebugger
            resetPreviewer()
            if (config.connectToDebugger === true) {
                openPreviewer()
            }
            else {
                openEditor()
            }
        })
    }

    return {
        config: config,
        autoInit: autoInit,
    }

}

