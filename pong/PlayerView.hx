package;

import bedrock.View;

class PlayerView extends View {
    // Class properties
    private var stageWidth:Int;
    private var stageHeight:Int;

    private var width:Int = 15;
    private var height:Int = 80;
    private var margin:Int = 10;

    private var velY:Int = 15;
    private var x:Float;
    private var y:Float;

    private var upKey:String;
    private var downKey:String;

    private var isUpKey:Bool = false;
    private var isDownKey:Bool = false;

    private var nrPlayer:Int;

    private var isInit:Bool = false;

    /**
     * Constructor
     */
    public function new(nr:Int) {
        super('PlayerView');

        // Set number player
        nrPlayer = nr;

        // Create the rect
        sprite.graphics.beginFill(0xFFFFFF);
        sprite.graphics.drawRect(0, 0, width, height);
        sprite.graphics.endFill();

        // Listen for events
        on('stageSize', setStageSize);
        on('loopLogic', loopLogic);
        on('loopRender', loopRender);
    }

    /**
    * Returns body
    */
    public function getBody():Array<Array<Array<Float>>> {
        var leftTop:Array<Float> = [x, y];
        var bottomRight:Array<Float> = [x + width, y + height];

        var body:Array<Array<Array<Float>>> = [
            [leftTop, bottomRight]
        ];

        return body;
    }

    /**
     * Sets keys for the actions
     */
    public function setKeys(keys:Map<String, String>):Void {
        var newKey:String = keys.get('up');
        upKey = (newKey != null) ? newKey : upKey;

        newKey = keys.get('down');
        downKey = (newKey != null) ? newKey : downKey;
    }

    /**
     * Sets the state down of the key
     */
    public function keyDown(key:String):Void {
        isUpKey = (key == upKey) ? true : isUpKey;
        isDownKey = (key == downKey) ? true : isDownKey;
    }

    /**
     * Sets the state up of the key
     */
    public function keyUp(key:String):Void {
        isUpKey = (key == upKey) ? false : isUpKey;
        isDownKey = (key == downKey) ? false : isDownKey;
    }

    // ------------------------------------------------

    /**
     * Loop logic method
     */
    private function loopLogic():Void {
        if (isUpKey == true && y > margin) {
            y -= velY;
        } else if (isDownKey == true && y < stageHeight - margin - height) {
            y += velY;
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

        // Initialize X and Y
        if (x == null) {
            if (nrPlayer == 1) {
                x = margin;
            } else if (nrPlayer == 2) {
                x = stageWidth - margin - width;
            }
        }
        y = (y == null) ? ((stageHeight / 2) - (height / 2)) : y;

        // Render the first time
        if (isInit == false) {
            loopRender();
            isInit = true;
        }
    }
}
