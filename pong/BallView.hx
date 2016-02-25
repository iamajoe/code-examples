package;

import haxe.Timer;
import bedrock.View;

class BallView extends View {
    // Class properties
    private var stageWidth:Int;
    private var stageHeight:Int;

    private var radius:Int = 10;

    private var x:Float;
    private var y:Float;

    private var velX:Float = 0;
    private var velY:Float = 0;
    private var speed:Int = 10;

    private var wasHit:Bool = false;
    private var changedY:Bool = false;

    /**
     * Constructor
     */
    public function new() {
        super('BallView');

        // Create the ball
        sprite.graphics.beginFill(0xFFFFFF);
        sprite.graphics.drawCircle(0, 0, radius);
        sprite.graphics.endFill();

        // Listen for events
        on('stageSize', setStageSize);
        on('loopLogic', loopLogic);
        on('loopRender', loopRender);
    }

    /**
    * Ball start handler
    */
    public function start():Void {
        calcVector();
    }

    /**
    * Reset ball
    */
    public function reset():Void {
        // Reset vars
        x = (stageWidth / 2);
        y = (stageHeight / 2);
        velX = 0;
        velY = 0;

        // Set initial render
        loopRender();
    }

    /**
    * Returns body
    */
    public function getBody():Array<Array<Array<Float>>> {
        // Need to count the radius!
        var leftTop:Array<Float> = [x - radius, y - radius];
        var bottomRight:Array<Float> = [x + radius, y + radius];

        var body:Array<Array<Array<Float>>> = [
            [leftTop, bottomRight]
        ];

        return body;
    }

    /**
    * Set hits
    */
    public function setHits(hits:Array<String>):Void {
        // Don't want to set after being hit
        if (!wasHit) {
            for (val in hits) {
                if (val == 'PlayerView') {
                    velX *= -1;

                    var direction:Int = (velX > 0) ? 1 : (-1);
                    calcVector(direction);

                    // Delay the next set
                    wasHit = true;
                    haxe.Timer.delay(function ():Void {
                        wasHit = false;
                    }, 500);
                    break;
                }
            }
        }
    }

    // ------------------------------------------------

    /**
     * Loop logic method
     */
    private function loopLogic():Void {
        if (stageWidth != null && stageHeight != null) {
            x += velX;
            y += velY;

            // Verify if it's going out vertically
            if (changedY == false) {
                if (y - radius <= 0 || y + radius >= stageHeight) {
                    velY *= -1;
                    y += velY;

                    changedY = true;
                    // Delay the next change
                    haxe.Timer.delay(function ():Void {
                        changedY = false;
                    }, 500);
                }

            }

            // Verify if any player scored
            if (x - radius >= stageWidth) {
                announce('player1Score');
                reset();
            } else if (x + radius <= 0) {
                announce('player2Score');
                reset();
            }
        }
    }

    /**
     * Takes care of the render update
     */
    private function loopRender():Void {
        sprite.x = x;
        sprite.y = y;
    }

    /**
     * Sets stage size
     */
    private function setStageSize(size:Map<String, Int>):Void {
        stageWidth = size.get('width');
        stageHeight = size.get('height');

        // Reset
        reset();
    }

    /**
    * Calcs vector of the ball
    */
    private function calcVector(?realDirection:Int):Void {
        var direction:Int = realDirection;

        if (direction == null) {
            direction = (Math.random() > 0.5) ? 1 : (-1);
        }

        var randomAngle:Float = (Math.random() * Math.PI / 2) - 45;
        velX = direction * Math.cos(randomAngle) * speed;
        velY = Math.sin(randomAngle) * speed;
    }
}
