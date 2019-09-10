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
            this.tabList = [];
            this.tabPointer = 0;
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
                if (chr === String.fromCharCode(9)) { //Tab Key
                    this.complete();
                }
                else if (chr === String.fromCharCode(38)) { //Up Arrow
                    this.recall(chr);
                    this.generateTabList(this.buffer);
                }
                else if (chr === String.fromCharCode(40)) { //Down Arrow
                    this.recall(chr);
                    this.generateTabList(this.buffer);
                }
                else if (chr === String.fromCharCode(8)) { //Delete Key
                    this.eraseText(this.buffer);
                    this.generateTabList(this.buffer);
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
                    this.generateTabList(this.buffer);
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
        /* This method erases text
           Depending on the parameter, it either erases character-by-character, or it erases entire words/phrases.
           I hard-coded the color because when I try to pull the canvas' background color, it claimed there was not one, even though there is :/
        */
        eraseText(char, phrase) {
            let width;
            if (phrase) {
                width = _DrawingContext.measureText(this.currentFont, this.currentFontSize, char);
                this.buffer = "";
            }
            else {
                let letterToDelete = char.substring(char.length - 1);
                this.buffer = this.buffer.substring(0, char.length - 1);
                width = _DrawingContext.measureText(this.currentFont, this.currentFontSize, letterToDelete);
            }
            this.currentXPosition -= width;
            let height = this.currentFontSize + _DrawingContext.fontDescent(this.currentFont, this.currentFontSize) + 5;
            _DrawingContext.fillStyle = "black";
            _DrawingContext.fillRect(this.currentXPosition, this.currentYPosition - _DrawingContext.fontAscent(this.currentFont, this.currentFontSize) - 2, width, height);
        }
        /* This method brute-forces a line deletion
            Depending on the parameter, it can reset the buffer (as would usually be ideal), but I created this specifically for the Tab auto-complete,
                which would want the line erased, but the buffer to stay the same.
        */
        eraseLine(resetBuffer) {
            _DrawingContext.fillStyle = "black";
            let height = this.currentFontSize + _DrawingContext.fontDescent(this.currentFont, this.currentFontSize) + 5;
            _DrawingContext.fillRect(12, this.currentYPosition - _DrawingContext.fontAscent(this.currentFont, this.currentFontSize) - 2, 488, height);
            this.currentXPosition = 12;
            if (resetBuffer === false)
                return;
            if (!resetBuffer || resetBuffer === true)
                this.buffer = "";
        }
        advanceLine() {
            this.currentXPosition = 1;
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
            if (this.currentYPosition >= _Canvas.height && !hasCrashed) {
                let canvas = _Canvas.getContext("2d");
                let pixelData = canvas.getImageData(0, 0, _Canvas.width, this.currentYPosition);
                this.clearScreen();
                let topLine = this.currentYPosition - _Canvas.height + _FontHeightMargin;
                let bottomLine = topLine * -1;
                canvas.putImageData(pixelData, 0, bottomLine);
                this.currentYPosition += bottomLine;
            }
        }
        // Allows the user to traverse command history.
        recall(arrow) {
            this.eraseLine();
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
        /*Regenerates the tab list every time a new input, anything but the tab key, is entered.
            1. Compare text to list of commands
            2. Create a new list based on the input
        */
        generateTabList(text) {
            if (text.length === 0 || text == null || text === String.fromCharCode(9))
                return;
            this.tabList = [];
            for (let i = 0; i < _OsShell.commandList.length; i++) {
                if (_OsShell.commandList[i].command.substr(0, text.length) === text) {
                    this.tabList[this.tabList.length] = _OsShell.commandList[i].command;
                }
            }
        }
        /*Actually draws the tab auto fill to the screen.
        The complete() and generateTabList(String) methods are separate because they always happen mutually exclusively.
            Reading the tab list should never update the buffer itself, otherwise the generated tab list would not work properly.*/
        complete() {
            if (this.tabList.length <= 0)
                return;
            this.eraseLine(false);
            this.currentXPosition = 12;
            this.buffer = this.tabList[this.tabPointer];
            _StdOut.putText(this.buffer);
            this.tabPointer++;
            if (this.tabPointer >= this.tabList.length)
                this.tabPointer = 0;
        }
    }
    TSOS.Console = Console;
})(TSOS || (TSOS = {}));
//# sourceMappingURL=console.js.map