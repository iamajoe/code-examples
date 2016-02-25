package;

import haxe.Timer;
import openfl.Lib;
import bedrock.Controller;
import bedrock.input.KeyboardInput;
import bedrock.utils.HitTest;

class GameController extends Controller {
    public static function main():Void {
        // Static entry point
        Lib.current.stage.align = openfl.display.StageAlign.TOP_LEFT;
        Lib.current.stage.scaleMode = openfl.display.StageScaleMode.NO_SCALE;

        // Finally create the game
        var game = new GameController();
    }

    // -------------------------------
    // Game module

    // Class properties
    private var secondsPerFrame:Float;
    private var lastLoop:Float;
    private var lagLoop:Float;

    private var hitTest:HitTest;
    private var uiView:UIView;
    private var player1View:PlayerView;
    private var player2View:PlayerView;
    private var ballView:BallView;

    /**
     * Constructor
     */
    public function new() {
        super('GameController');

        // Set states
        states = ['index' => indexState];

        // Set the initial state
        setState('index');
    }

    // --------------------------------------

    /**
     * Index state handler
     */
    private function indexState():Void {
        // Set ui
        uiView = adopt(new UIView());

        // Set player and ball
        player1View = adopt(new PlayerView(1));
        player2View = adopt(new PlayerView(2));
        ballView = adopt(new BallView());

        // Set stage size
        announce('stageSize', 'down', [
            'width' => Lib.current.stage.stageWidth,
            'height' => Lib.current.stage.stageHeight
        ]);

        // Set inputs
        var kbInput:KeyboardInput = new KeyboardInput();
        kbInput.on('keyDown', onKeyDown);
        kbInput.on('keyUp', onKeyUp);
        player1View.setKeys([ 'up' => 'w', 'down' => 's' ]);
        player2View.setKeys([ 'up' => 'up-arrow', 'down' => 'down-arrow' ]);

        // Append views
        uiView.appendTo(Lib.current);
        player1View.appendTo(Lib.current);
        player2View.appendTo(Lib.current);
        ballView.appendTo(Lib.current);

        // Set hit tests
        setHitTester();

        // Set loop
        secondsPerFrame = 1000 / Lib.current.stage.frameRate;
        lastLoop = Sys.time() * 1000;
        lagLoop = 0.0;
        loop();
    }

    /**
    * Loop method
    */
    private function loop():Void {
        var currentTime:Float = Sys.time() * 1000;
        var elapsedTime:Float = currentTime - lastLoop;
        lastLoop = currentTime;
        lagLoop += elapsedTime  - secondsPerFrame;

        // Process logic
        loopLogic();

        // Check if the loop was processed without lag
        if (lagLoop <= secondsPerFrame) {
            // Process render
            loopRender();

            // Run the delay loop
            haxe.Timer.delay(loop, Std.int(secondsPerFrame));
        } else {
            // Go for the loop again and try to compensate lag
            loop();
        }
    }

    /**
    * Loop logic
    */
    private function loopLogic():Void {
        announce('loopLogic', 'down');
        hitTest.check();
    }

    /**
    * Loop render
    */
    private function loopRender():Void {
        announce('loopRender', 'down');
    }

    /**
    * Set hit tester
    */
    private function setHitTester():Void {
        // Set hit tests
        hitTest = new HitTest();
        hitTest.addBody([
            'id' => player1View.getId(),
            'name' => player1View.name
        ], player1View.getBody);
        hitTest.addBody([
            'id' => player2View.getId(),
            'name' => player2View.name
        ], player2View.getBody);
        hitTest.addBody([
            'id' => ballView.getId(),
            'name' => ballView.name
        ], ballView.getBody, ballView.setHits);
    }

    /**
     * Input keyboard down handler
     */
    private function onKeyDown(key:String):Void {
        // Start game
        if (key == 'space') {
            // TODO: This should set an init!
            // TODO: Loop shouldn't start right away
            ballView.start();
        }

        // Control players
        player1View.keyDown(key);
        player2View.keyDown(key);
    }

    /**
     * Input keyboard up handler
     */
    private function onKeyUp(key:String):Void {
        // Control players
        player1View.keyUp(key);
        player2View.keyUp(key);
    }
}
