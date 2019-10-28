/* ------------
     Console.ts

     The OS Console - stdIn and stdOut by default.
     Note: This is not the Shell. The Shell is the "command line interface" (CLI) or interpreter for this console.

     Useful Links regarding Canvas behavior
     ======================================
     1. https://www.w3schools.com/tags/ref_canvas.asp - General overview
     2. https://jim.studt.net/canvastext/ - niche functions like fontAscent, fontDescent
     ------------ */

module TSOS {

    export class Console {

        private cmdHistory = [];
        private cmdPointer = this.cmdHistory.length-1;
        private tabList = [];
        private tabPointer = 0;
        private previousLinePosition = [];

        constructor(public currentFont = _DefaultFontFamily,
                    public currentFontSize = _DefaultFontSize,
                    public currentXPosition = 0,
                    public currentYPosition = _DefaultFontSize,
                    public buffer = "") {
        }

        public init(): void {
            this.clearScreen();
            this.resetXY();
        }

        public clearScreen(): void {
            _DrawingContext.clearRect(0, 0, _Canvas.width, _Canvas.height);
        }

        public resetXY(): void {
            this.currentXPosition = 0;
            this.currentYPosition = this.currentFontSize;
        }

        public handleInput(): void {
            while (_KernelInputQueue.getSize() > 0) {
                // Get the next character from the kernel input queue.
                var chr = _KernelInputQueue.dequeue();
                if(chr === String.fromCharCode(9)) { //Tab Key
                    this.complete();
                }
                else if(chr === "↑") { //Up Arrow
                    this.recall(chr);
                    this.generateTabList(this.buffer);
                }
                else if(chr === "↓") { //Down Arrow
                    this.recall(chr);
                    this.generateTabList(this.buffer);
                }
                else if(chr === String.fromCharCode(8)) { //Delete Key
                    this.eraseText(this.buffer);
                    this.generateTabList(this.buffer);
                }
                // Check to see if it's "special" (enter or ctrl-c) or "normal" (anything else that the keyboard device driver gave us).
                else if (chr === String.fromCharCode(13)) { // the Enter key
                    // The enter key marks the end of a console command, so ...
                    // ... tell the shell ...
                    _OsShell.handleInput(this.buffer);
                    
                    /*As long as the line is not empty, add it to the command history
                        and set the pointer to the bottom of the list, i.e. the most
                        recent command.
                    */
                    if(this.buffer.length != 0 && this.previousLinePosition.length == 0) {
                        this.cmdHistory[this.cmdHistory.length] = this.buffer;
                        this.cmdPointer = 0;
                    }

                    this.tabList = [];
                    this.tabPointer = 0;

                    // ... and reset our buffer.
                    this.buffer = "";
                } else {
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

        /* How my implementation of Line Wrap works
            I first wanted to just be like "if the cursor >= 500 (canvas width), copy image data of whatever went over, advance the line, 
                draw that info there, and continue..."
            Unfortunately, I could not get this work.

            Now at first glance, you see a while loop inside of a for loop and think... Doesn't that break the Geneva Convention or something?
            Yes yes, I know, but allow me to explain how it still miraculously manages to work (or at least the idea behind it because,
                as you said, "i CaN sEe YoUr CoDe, I kNoW hOw It WoRkS" (Where I am from, we call these 'famous last words.')!

            Anyway,
                1. Measure the width of the text
                2. If it is >= canvas.width (500 in this case. I use 495 to ensure no clipping), then start looping
                    a. The for loop's upper limit is the amount of lines needed to be drawn (x / 495)
                    b. The while loop then incrementally calculates how many words can fit on a line before jumping to the next one
                    c. If there are no more words left, (i.e. counter >= words.length) we're done "early" (but draw the final word)
                3. Otherwise, if the x position >= 495, then just advance the line and reset the X position

            Now this begs the question, why separate these? Is this not redundant? To answer this, I have to explain the use-cases I thought of:
            There are essentially two forms of input: manual (typing character-by-character) and automatic (Glados or large strings stuck together given at once)
                a. Manual input is really straight-forward. If X position >= canvas width, advance the line and continue on.
                b. Automatic input, however, was significantly more involved. Because not all letters are the same width, you don't know when to draw the new line.
                    Therefore, it has to be done this tediously. Again, the thought-process is pretty intuitive, 
                    but the implementation is a nightmare (I was considering recursion at one point (⊙＿⊙') )
        */
        public putText(text): void {
            if (text !== "") {

                //Line Wrap (Automatic)
                if(_DrawingContext.measureText(this.currentFont, this.currentFontSize, text) >= 495) {
                    let words = text.split(" ");
                    let newLine = "";
                    let counter = 0;
                    let done = false;
                    for(let i = 0; i < Math.ceil(_DrawingContext.measureText(this.currentFont, this.currentFontSize, text)) / 495; i++) {
                        while(_DrawingContext.measureText(this.currentFont, this.currentFontSize, newLine) + 
                            _DrawingContext.measureText(this.currentFont, this.currentFontSize, words[counter]) <= 495) {
                            newLine += words[counter] + " ";
                            counter++;
                            if(counter >= words.length){ 
                                done = true;
                                break;
                            }
                        }
                        _DrawingContext.drawText(this.currentFont, this.currentFontSize, this.currentXPosition, this.currentYPosition, newLine);
                        if(done) return;
                        this.advanceLine();
                        newLine = "";
                    }
                }
                //Line Wrap (Manual)
                else if(this.currentXPosition >= 495) {
                    this.previousLinePosition[this.previousLinePosition.length] = this.currentXPosition;
                    this.advanceLine();
                    _DrawingContext.drawText(this.currentFont, this.currentFontSize, this.currentXPosition, this.currentYPosition, text);
                    var offset = _DrawingContext.measureText(this.currentFont, this.currentFontSize, text);
                    this.currentXPosition = this.currentXPosition + offset;
                }
                //Normal typing
                else {
                    // Draw the text at the current X and Y coordinates.
                    _DrawingContext.drawText(this.currentFont, this.currentFontSize, this.currentXPosition, this.currentYPosition, text);
                    // Move the current X position.
                    var offset = _DrawingContext.measureText(this.currentFont, this.currentFontSize, text);
                    this.currentXPosition = this.currentXPosition + offset;
                }
            }
         }

         /* This method erases text
            By default, it deletes character-by-character. However, if specified, it can delete an entire word/phrase
            I hard-coded the color because when I try to pull the canvas' background color, it claimed there was not one, even though there is :/
         */
        public eraseText(char: String, isPhrase?: boolean): void {
            if(this.currentXPosition < 5) {
                this.currentXPosition = this.previousLinePosition.pop();
                this.currentYPosition = this.currentYPosition - (_DefaultFontSize + 
                _DrawingContext.fontDescent(this.currentFont, this.currentFontSize) +
                _FontHeightMargin);
            }
            let width;
            if(isPhrase) { 
                width = _DrawingContext.measureText(this.currentFont, this.currentFontSize, char);
                this.buffer = "";
            }
            else { 
                let letterToDelete = char.substring(char.length-1);
                this.buffer = this.buffer.substring(0, char.length-1);
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
        public eraseLine(resetBuffer?: boolean): void{
            _DrawingContext.fillStyle = "black";
            let height = this.currentFontSize + _DrawingContext.fontDescent(this.currentFont, this.currentFontSize) + 5;
            _DrawingContext.fillRect(12, this.currentYPosition - _DrawingContext.fontAscent(this.currentFont, this.currentFontSize) - 2, 488, height);
            this.currentXPosition = 12;
            if(resetBuffer === false) return;
            else this.buffer = "";
        }

        public advanceLine(): void {
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
            if(this.currentYPosition >= _Canvas.height && !_HasCrashed){
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
        public recall(arrow) {
            if(this.cmdHistory.length <= 0) return;
            this.eraseLine();
            if(arrow === "↑") {
                this.cmdPointer--;
                if(this.cmdPointer < 0) this.cmdPointer = this.cmdHistory.length-1;
                this.buffer = this.cmdHistory[this.cmdPointer];
                this.currentXPosition = 12;
                _StdOut.putText(this.buffer);
            }
            else if(arrow === "↓") {
                this.cmdPointer++;
                if(this.cmdPointer >= this.cmdHistory.length) this.cmdPointer = 0;
                this.buffer = this.cmdHistory[this.cmdPointer];
                this.currentXPosition = 12;
                _StdOut.putText(this.buffer);
            }
            else return;
        }

        /*Regenerates the tab list every time a new input, anything but the tab key, is entered.
            1. Compare text to list of commands
            2. Create a new list based on the input
        */
        public generateTabList(text){
            if(text.length === 0 || text == null || text === String.fromCharCode(9)) return;
            this.tabList = [];
            for(let i = 0; i < _OsShell.commandList.length; i++) {
                if(_OsShell.commandList[i].command.substr(0, text.length) === text) {
                this.tabList[this.tabList.length] = _OsShell.commandList[i].command;
               }
           }
        }

        /*Actually draws the tab auto fill to the screen.
        The complete() and generateTabList(String) methods are separate because they always happen mutually exclusively.
            Reading the tab list should never update the buffer itself, otherwise the generated tab list would not work properly.*/
        public complete(){
            if(this.tabList.length <= 0) return;
           this.eraseLine(false);
           this.currentXPosition = 12;
           this.buffer = this.tabList[this.tabPointer]
           _StdOut.putText(this.buffer);
           this.tabPointer++;
           if(this.tabPointer >= this.tabList.length) this.tabPointer = 0;
        }
    }
 }
