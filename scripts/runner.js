/// <reference path="../libs/xt.d.ts" />
/// <reference path="./index.ts" />
var kStatuBarBasics = {
    "iPhone 7": "statusbar_ios_w375_",
    "iPhone 7 Plus": "statusbar_ios_w414_",
    "iPhone X": "statusbar_ios_w375_",
    "iPhone 5": "statusbar_ios_w320_",
    "iPhone 4": "statusbar_ios_w320_"
};
var kNavigationBarHeights = {
    "iPhone 7": 64,
    "iPhone 7 Plus": 64,
    "iPhone X": 64,
    "iPhone 5": 64,
    "iPhone 4": 64
};
var xtPlayground = parent.xtPlayground;
var statusBar = document.querySelector('#status-bar');
var naviBar = document.querySelector('#navigation-bar');
var is_iOS = xtPlayground.device.indexOf("iPhone") >= 0 || xtPlayground.device.indexOf("iPad") >= 0;
var iOSBackButtonImage = UI.Image.fromBase64('iVBORw0KGgoAAAANSUhEUgAAACcAAAA/CAMAAABU+CHxAAAABGdBTUEAALGPC/xhBQAAAAFzUkdCAK7OHOkAAAD2UExURUdwTIyMjI2NjZKSkoyMjJOTk////5CQkJmZmZGRkZ+fn4yMjI2NjYyMjP///42NjYyMjIyMjIyMjIyMjIyMjKqqqoyMjL+/v42NjYyMjIyMjI2NjY2NjYyMjJCQkJCQkIyMjI2NjYyMjIyMjIyMjIyMjI2NjY+Pj4yMjJSUlI+Pj42NjYyMjIyMjIyMjI2NjYyMjIyMjI2NjYyMjKKiooyMjI2NjYyMjIyMjI2NjYyMjIyMjIyMjIyMjI2NjY2NjY2NjYyMjI2NjYyMjIyMjIyMjIyMjI2NjY2NjYyMjIyMjI2NjZCQkI2NjYyMjI+Pj4yMjIyMjJc1wu0AAABRdFJOUwDMpiH7EwEXDxwI8EHsAsX5077o3gb+BJ0z49kJ8yw1rkgmf/aKdTn9DElR2DrSlLZrSrcLiGxQYs7hxlmTgLyvRy0U2s2jJBJ29IklONsn9ywRh4UAAAF4SURBVEjHrdZnTwJBEAbgpd5x9N57kw6CoCJi723//5/RoDhzJjNMIvv5ySZ7t++7o9R+VqF8792trCO31qeHu5i51JvV5Znn9pvpN5YZUb1d1wzz5X+ZfqCZKwHshGbvOWDuMsmu4sAiC5Jlg8AaVZIN/MCKAZIFnoD52yTrfgALZknWiwCLl0h25gaWq5Hs+ABYwkWyeQpY30eyFig9NEhWR8zhIVkTsbBJKe8IsdiMYqEMYmOLYmknYpUkxZIVxJxpMqVTxDIhinViiK3IXJthxJp0TB2I1SUx1bolimlqQgdwjXa742LfR/vNuRoZoh0fuVqSnVf8/ZSa4f8xYnrWGov+r/i+/Ll/F0ka2u7ztEBD7wrno8Mc+xnBpcnAc1l+7X0QNRg4Qf2S9zFQ2Ffi/lNqIetTpaoNUT9/9X0R9f2AgW3Z+yF+j5Qq4fetx8Aafi9f1b/fX3tRmML5wODnjW2wb3bNLz/BvtzTPLSZr14E8xWsT1TC0VxUxJVlAAAAAElFTkSuQmCC', 3.0, 39, 63).retain();
var Runner = /** @class */ (function () {
    function Runner() {
        this.setupNavigationBar();
        this.run();
    }
    Runner.prototype.setupNavigationBar = function () {
        var _this = this;
        UI.NavigationBar.onResetNavigationBar(function (navigationBar, viewController) {
            _this.resetStatusBar(navigationBar);
            _this.resetBarHeight(navigationBar);
            _this.addNavigationContents(navigationBar);
            viewController.view.frame = { x: 0, y: navigationBar.frame.height - 1.0, width: UI.Screen.mainScreen().width, height: UI.Screen.mainScreen().height - navigationBar.frame.height };
        });
    };
    Runner.prototype.resetStatusBar = function (navigationBar) {
        var basic = kStatuBarBasics[xtPlayground.device];
        var style = navigationBar.lightContent ? 'light' : 'default';
        statusBar.innerHTML = '<img width="' + UI.Screen.mainScreen().width.toString() + 'px" height="20px" src="resources/' + basic + style + '.png" />';
    };
    Runner.prototype.resetBarHeight = function (navigationBar) {
        var barHeight = navigationBar.show ? kNavigationBarHeights[xtPlayground.device] : 0;
        naviBar.style.height = barHeight;
        naviBar.style.display = barHeight > 0 ? "" : "hidden";
        if (naviBar.childNodes[0] !== navigationBar.nativeObject.nativeObject) {
            naviBar.innerHTML = '';
            naviBar.appendChild(navigationBar.nativeObject.nativeObject);
        }
        navigationBar.frame = { x: 0, y: 0, width: UI.Screen.mainScreen().width, height: barHeight };
    };
    Runner.prototype.addNavigationContents = function (navigationBar) {
        navigationBar.subviews.forEach(function (it) { it.removeFromSuperview(); });
        if (is_iOS) {
            this.add_iOSNavigationContents(navigationBar);
        }
    };
    Runner.prototype.add_iOSNavigationContents = function (navigationBar) {
        navigationBar.tintColor = navigationBar.lightContent ? UI.Color.whiteColor : UI.Color.blackColor;
        var titleView = new UI.Label();
        titleView.frame = { x: 0, y: 20, width: navigationBar.bounds.width, height: 44 };
        titleView.font = new UI.Font(17, "500", "bold");
        titleView.textColor = navigationBar.tintColor;
        titleView.textAlignment = UI.TextAlignment.Center;
        titleView.text = navigationBar.title;
        navigationBar.addSubview(titleView);
        if (navigationBar._viewController &&
            navigationBar._viewController.parentViewController &&
            navigationBar._viewController.parentViewController instanceof UI.NavigationController &&
            navigationBar._viewController.parentViewController.childViewControllers.indexOf(navigationBar._viewController) > 0) {
            var iOSBackButton = new UI.Button();
            iOSBackButton.frame = UI.RectMake(0, 20, 44, 44);
            iOSBackButton.image = iOSBackButtonImage.imageWithImageRenderingMode(UI.ImageRenderingMode.Template);
            iOSBackButton.tintColor = navigationBar.lightContent ? UI.Color.whiteColor : UI.Color.blackColor;
            iOSBackButton.onTouchUpInside = function () {
                navigationBar._viewController.parentViewController.popViewController(false);
            };
            navigationBar.addSubview(iOSBackButton);
        }
    };
    Runner.prototype.run = function () {
        if (xtPlayground.connectToDebugger === true) {
            XT.Debug.worker = new Worker('libs/Core/xt.debugWorker.web.min.js');
            XT.Debug.connect(xtPlayground.debuggerAddress.split(":")[0], parseInt(xtPlayground.debuggerAddress.split(":")[1]));
            xtPlayground.onConnecting();
            XT.Debug.reloadHandler = function (source, force) {
                if (force === true) {
                    window.location.reload();
                }
                else {
                    xtPlayground.onConnected();
                    window.eval(source);
                }
            };
        }
        else {
            try {
                eval(xtPlayground.repl);
            }
            catch (error) {
                console.error(error);
                alert("Runtime Error: " + error.message);
            }
        }
    };
    return Runner;
}());
new Runner();
