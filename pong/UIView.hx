package;

import bedrock.View;
import openfl.text.TextField;
import openfl.text.TextFormat;
import openfl.text.TextFormatAlign;

class UIView extends View {
    // Class properties
    private var scorePlayer1:Int = 0;
    private var scorePlayer2:Int = 0;
    private var scoreField:TextField;

    /**
     * Constructor
     */
    public function new() {
        super('UIView');

        // Set score field
        // TODO: Font not working!
        var scoreFormat:TextFormat = new TextFormat('Arial', 24, 0xbbbbbb, true);
        scoreFormat.align = TextFormatAlign.CENTER;

        scoreField = new TextField();
        sprite.addChild(scoreField);
        scoreField.width = 800;
        scoreField.y = 30;
        scoreField.defaultTextFormat = scoreFormat;
        scoreField.selectable = false;

        // Finally update the score
        updateScore();

        // Listen for the events
        on('player1Score', addToPlayer1);
        on('player2Score', addToPlayer2);
    }

    // ------------------------------------------------

    /**
     * Adds one to player score
     */
    private function addToPlayer1():Void {
        scorePlayer1 += 1;
        updateScore();
    }

    /**
     * Adds one to player score
     */
    private function addToPlayer2():Void {
        scorePlayer2 += 1;
        updateScore();
    }

    /**
     * Updates all the scores
     */
    private function updateScore():Void {
        scoreField.text = Std.string(scorePlayer1) + ' | ' + Std.string(scorePlayer2);
    }
}
