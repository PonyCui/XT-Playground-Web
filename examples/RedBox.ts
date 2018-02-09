// Sample By Pony

class HelloViewController extends UI.ViewController {

    viewDidLoad() {
        super.viewDidLoad()
        const redBox = new UI.View()
        redBox.frame = UI.RectMake(100, 100, 44, 44)
        redBox.backgroundColor = UI.Color.redColor
        redBox.onTap = () => {
            UI.View.animationWithBouncinessAndSpeed(8.0, 40.0, () => {
                redBox.backgroundColor = UI.Color.yellowColor
                redBox.frame = UI.RectMake(100, 100, 88, 88)
            })
        }
        this.view.addSubview(redBox)
    }

}

class AppDelegate extends UI.ApplicationDelegate {

    applicationDidFinishLaunchingWithOptions() {
        this.window = new UI.Window()
        this.window.rootViewController = new UI.NavigationController(new HelloViewController())
        this.window.makeKeyAndVisible()
    }

}

const application = new UI.Application(undefined, new AppDelegate())