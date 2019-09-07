/* ------------
     Console.ts

     The OS Console - stdIn and stdOut by default.
     Note: This is not the Shell. The Shell is the "command line interface" (CLI) or interpreter for this console.

     Useful Links regarding Canvas behavior
     ======================================
     1. https://www.w3schools.com/tags/ref_canvas.asp - General overview
     2. https://jim.studt.net/canvastext/ - niche functions like fontAscent, fontDescent
     ------------ */
var TSOS;
(function (TSOS) {
    class Console {
        constructor(currentFont = _DefaultFontFamily, currentFontSize = _DefaultFontSize, currentXPosition = 0, currentYPosition = _DefaultFontSize, buffer = "") {
            this.currentFont = currentFont;
            this.currentFontSize = currentFontSize;
            this.currentXPosition = currentXPosition;
            this.currentYPosition = currentYPosition;
            this.buffer = buffer;
            this.cmdHistory = [];
            this.cmdPointer = this.cmdHistory.length - 1;
        }
        init() {
            this.clearScreen();
            this.resetXY();
        }
        clearScreen() {
            _DrawingContext.clearRect(0, 0, _Canvas.width, _Canvas.height);
        }
        resetXY() {
            this.currentXPosition = 0;
            this.currentYPosition = this.currentFontSize;
        }
        handleInput() {
            while (_KernelInputQueue.getSize() > 0) {
                // Get the next character from the kernel input queue.
                var chr = _KernelInputQueue.dequeue();
                if (chr === String.fromCharCode(9)) {
                    console.log("The tab key was pressed!");
                }
                else if (chr === String.fromCharCode(38)) {
                    this.recall(chr);
                }
                else if (chr === String.fromCharCode(40)) {
                    this.recall(chr);
                }
                else if (chr === String.fromCharCode(8)) {
                    this.eraseText(this.buffer);
                }
                // Check to see if it's "special" (enter or ctrl-c) or "normal" (anything else that the keyboard device driver gave us).
                else if (chr === String.fromCharCode(13)) { // the Enter key
                    // The enter key marks the end of a console command, so ...
                    // ... tell the shell ...
                    _OsShell.handleInput(this.buffer);
                    //As long as the line is not empty, add it to the command history
                    if (this.buffer.length != 0) {
                        this.cmdHistory[this.cmdHistory.length] = this.buffer;
                    }
                    // ... and reset our buffer.
                    this.buffer = "";
                }
                else {
                    // This is a "normal" character, so ...
                    // ... draw it on the screen...
                    this.putText(chr);
                    // ... and add it to our buffer.
                    this.buffer += chr;
                }
                // TODO: Add a case for Ctrl-C that would allow the user to break the current program.
            }
        }
        putText(text) {
            /*  My first inclination here was to write two functions: putChar() and putString().
                Then I remembered that JavaScript is (sadly) untyped and it won't differentiate
                between the two. (Although TypeScript would. But we're compiling to JavaScipt anyway.)
                So rather than be like PHP and write two (or more) functions that
                do the same thing, thereby encouraging confusion and decreasing readability, I
                decided to write one function and use the term "text" to connote string or char.
            */
            if (text !== "") {
                // Draw the text at the current X and Y coordinates.
                _DrawingContext.drawText(this.currentFont, this.currentFontSize, this.currentXPosition, this.currentYPosition, text);
                // Move the current X position.
                var offset = _DrawingContext.measureText(this.currentFont, this.currentFontSize, text);
                this.currentXPosition = this.currentXPosition + offset;
            }
        }
        /* This function erases text
           Its default behavior is to do so character-by-character
           However, if the second parameter is specified to be true, it will erase a specified string

           Thankfully the canvas does have built-in functions to determine width, height, and offsets of fonts, which makes this possible at all
           All that needs to be done is to measure the width, height, and offset (vertical and horizontal + some arbitrary visual feedback) for a letter,
               and I decided to cover it with a rectangle of the same color as the background.
           I hard-coded the color because when I try to pull the canvas' background color, it claimed there was not one, even though there is :/
        */
        eraseText(text, eraseLine) {
            let width;
            if (eraseLine === true) {
                width = _DrawingContext.measureText(this.currentFont, this.currentFontSize, text);
                this.buffer = "";
            }
            else {
                let letterToDelete = text.substring(text.length - 1);
                this.buffer = this.buffer.substring(0, text.length - 1);
                width = _DrawingContext.measureText(this.currentFont, this.currentFontSize, letterToDelete);
            }
            this.currentXPosition -= width;
            let height = this.currentFontSize + _DrawingContext.fontDescent(this.currentFont, this.currentFontSize) + 5;
            _DrawingContext.fillStyle = "black";
            _DrawingContext.fillRect(this.currentXPosition, this.currentYPosition - _DrawingContext.fontAscent(this.currentFont, this.currentFontSize) - 2, width, height);
        }
        advanceLine() {
            this.currentXPosition = 0;
            /*
             * Font size measures from the baseline to the highest point in the font.
             * Font descent measures from the baseline to the lowest point in the font.
             * Font height margin is extra spacing between the lines.
             */
            this.currentYPosition += _DefaultFontSize +
                _DrawingContext.fontDescent(this.currentFont, this.currentFontSize) +
                _FontHeightMargin;
            /* If text goes below the canvas view,
                1. Grab the raw pixel data (including the command that generated text below the canvas)
                2. Clear the screen
                3. Create the line where the user will continue to type
                4. Put the raw pixel data back onto the canvas, accounting for the user line to type
            */
            if (this.currentYPosition >= _Canvas.height) {
                let canvas = _Canvas.getContext("2d");
                let pixelData = canvas.getImageData(0, 0, _Canvas.width, this.currentYPosition);
                this.clearScreen();
                let topLine = this.currentYPosition - _Canvas.height + _FontHeightMargin;
                let bottomLine = topLine * -1;
                canvas.putImageData(pixelData, 0, bottomLine);
                this.currentYPosition += bottomLine;
            }
        }
        recall(arrow) {
            this.eraseText(this.buffer, true);
            if (arrow === String.fromCharCode(38)) {
                this.cmdPointer--;
                if (this.cmdPointer < 0) {
                    this.cmdPointer = this.cmdHistory.length - 1;
                }
                this.buffer = this.cmdHistory[this.cmdPointer];
                this.currentXPosition = 12;
                _StdOut.putText(this.buffer);
            }
            else if (arrow === String.fromCharCode(40)) {
                this.cmdPointer++;
                if (this.cmdPointer >= this.cmdHistory.length) {
                    this.cmdPointer = 0;
                }
                this.buffer = this.cmdHistory[this.cmdPointer];
                this.currentXPosition = 12;
                _StdOut.putText(this.buffer);
            }
            else {
                return;
            }
        }
    }
    TSOS.Console = Console;
})(TSOS || (TSOS = {}));
//# sourceMappingURL=console.js.map