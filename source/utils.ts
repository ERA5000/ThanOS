/* --------
   Utils.ts

   Utility functions.
   -------- */

module TSOS {

    export class Utils {

        public static trim(str): string {
            // Use a regular expression to remove leading and trailing spaces.
            return str.replace(/^\s+ | \s+$/g, "");
            /*
            Huh? WTF? Okay... take a breath. Here we go:
            - The "|" separates this into two expressions, as in A or B.
            - "^\s+" matches a sequence of one or more whitespace characters at the beginning of a string.
            - "\s+$" is the same thing, but at the end of the string.
            - "g" makes is global, so we get all the whitespace.
            - "" is nothing, which is what we replace the whitespace with.
            */
        }

        public static rot13(str: string): string {
            /*
               This is an easy-to understand implementation of the famous and common Rot13 obfuscator.
               You can do this in three lines with a complex regular expression, but I'd have
               trouble explaining it in the future.  There's a lot to be said for obvious code.
            */
            var retVal: string = "";
            for (var i in <any>str) {    // We need to cast the string to any for use in the for...in construct.
                var ch: string = str[i];
                var code: number = 0;
                if ("abcedfghijklmABCDEFGHIJKLM".indexOf(ch) >= 0) {
                    code = str.charCodeAt(Number(i)) + 13;  // It's okay to use 13.  It's not a magic number, it's called rot13.
                    retVal = retVal + String.fromCharCode(code);
                } else if ("nopqrstuvwxyzNOPQRSTUVWXYZ".indexOf(ch) >= 0) {
                    code = str.charCodeAt(Number(i)) - 13;  // It's okay to use 13.  See above.
                    retVal = retVal + String.fromCharCode(code);
                } else {
                    retVal = retVal + ch;
                }
            }
            return retVal;
        }

        /*This is executed when the crash command is typed.
        A boolean hasCrashed was created to stop other behaviors (like the Host Log output) to make it more unsettling.
        */
        public static crash(): void {
            let crash = new Audio("../../distrib/resources/audio/crash.mp3");
            crash.play();
            let img = (<CanvasImageSource>document.getElementById("bsod"));
            (<HTMLCanvasElement>document.getElementById("display")).getContext("2d").drawImage(img, 0, 0, 500, 510);
            _HasCrashed = true;
            _CPU.isExecuting = false;
            _CPU.hasExecutionStarted = false;
            _Kernel.krnTrapError("User invoked crash.");
            (<HTMLTextAreaElement>document.getElementById("taProgramInput")).value = "";
            (<HTMLTextAreaElement>document.getElementById("taProgramInput")).disabled = true;
            (<HTMLTextAreaElement>document.getElementById("taHostLog")).value = "";
            (<HTMLTextAreaElement>document.getElementById("taHostLog")).disabled = true;
            this.disableSS();
            _MemoryManager.setAvailableSegmentByID();
        }

        /*A simple method to verify hex input data using RegEx
        I think this turned into one of the those logical 'proofs' where finding the negation is easier, 
            which is why I look for *anything* that is NOT a-f, 0-9, space, newline and carriage return*/
        public static verifyInput(): boolean {
            let text = (<HTMLInputElement>document.getElementById("taProgramInput")).value.trim();
            let validHex = /[^a-f0-9 \r\n]+/img;
            if (validHex.test(text)) {
                _StdOut.putText("Hex input is NOT valid! Illegal characters found.");
                return false;
            }
            else if(text == "") {
                _StdOut.putText("Hex input is NOT valid! No code found.");
                return false;
            }
            else if(this.standardizeInput(text).length > 512){
                _StdOut.putText("Hex input is NOT valid! Program too large.");
            }
            else if (this.standardizeInput().length % 2 != 0) {
                _StdOut.putText("Hex input is NOT valid! Odd number of characters found.");
                return false;
            }
            else return true;

        }

        /*A method to grab and standardized input. Removes all spaces and capitalizes all letters so that the code is one contiguous string.
        */
        public static standardizeInput(text?: string): string {
            let input: string;
            if(text) input = text;
            else input = (<HTMLInputElement>document.getElementById("taProgramInput")).value.trim().toUpperCase();
            input = input.replace(/\s/g, "");
            return input;
        }

        /*A simple clock function
        toLocaleDateString formats the date and time
        */
        public static clock () {
            var dateObject = new Date();
            var date = dateObject.toLocaleDateString("en-US");
            var time = dateObject.toLocaleTimeString("en-US");
            document.getElementById("date").innerHTML = date + "";
            document.getElementById("time").innerHTML = time + "";
            window.setTimeout(Utils.clock, 1000);
        };


        /* The Crème de la crème of ThanOS, the snap function.
        This introduced me to the setTimeout and setInterval functions which are really useful for timing events very precisely and in a quantifiable manner.
        Both the overlay and the progress bar needed 'real-time updating,' so being able to call them using setInterval made things significantly easier.
            I could have functionally defined the behavior (ex: setInterval({}, 1000)), but creating them as separate methods helped to keep me organized... 
            plus, we're using typescript so it's also in spirit of.
        The function was a lot of fun to build, and I am so glad it all came together.
        Also, I loaded the audio here, as opposed to being an HTML element, because I just could not get those to work.
            As an object, I know they will function properly.

        NEW: 10/11/19
        We now have an event listener to prevent right-clicking when the video is playing so it cannot be paused. There are definitely ways around this,
            but now at least I can say I tried...
        Pausing the video otherwise does not (thankfully) blow up everything, but it does diminish the energy from its greatest effect.
        */
        public static snap() {
            _Kernel.krnDisableInterrupts();
            var overlay = document.getElementById("overlay");
            overlay.style.display = "initial";
            var video = (<HTMLVideoElement>document.getElementById("video"));
            video.style.display = "initial";
            video.addEventListener("contextmenu", event => event.preventDefault()); //Prevents right-clicking to pause the video
            video.play();
            var dimTimerID = setInterval(this.dimDisplay, 100, overlay, video);
            setTimeout(this.pauseVideo, 11500, video, dimTimerID);
        }

        //This method pauses the video because when HTML videos end, they kinda just keep going... so to prevent anything funky, I just stop it manually.
        //The clearInterval function also stops any setInterval timers... the goal is to prevent any memory leaks or other weird behavior.
        private static pauseVideo(videoElem, dimTimerID) {
            videoElem.pause();
            videoElem.style.display = "none";
            clearInterval(dimTimerID);
            setTimeout(Utils.reboot, 1750);
        }

        //Dims the overlay as the video plays
        private static dimDisplay(overlay, video) {
            if (overlay.style.opacity >= 1) return;
            else overlay.style.opacity = (video.currentTime / video.duration) * 2;
        }

        //This starts the 'reboot' process
        //It first loads the progress bar and the AOL dial-up noise for a nice throwback
        //It then calls the other two methods with timed delays
        private static reboot() {
            var progressBar = (<HTMLProgressElement>document.getElementById("progress"));
            var rebootAudio = new Audio("distrib/resources/audio/reboot.mp3");

            progressBar.style.display = "initial";
            rebootAudio.play();
            var progressTimeID = setInterval(Utils.loadBar, 100, progressBar, rebootAudio, progressTimeID);
            setTimeout(Utils.loadLogo, 12000);
        }

        //Fills the progress bar gradually
        //It uses the audio feedback duration as a means of timing how long it should load for, so they'll finish at the same time
        private static loadBar(progressBar, rebootAudio, progressTimeID) {
            progressBar.value = Math.round(rebootAudio.currentTime / rebootAudio.duration * 100);
            if (progressBar.value >= 100) clearInterval(progressTimeID);
        }

        //Places the logo on the screen and plays the traditional Mac startup noise
        private static loadLogo() {
            var logo = document.getElementById("logo");
            var startupAudio = new Audio("distrib/resources/audio/startup.mp3");
            logo.style.display = "initial";
            startupAudio.play();
            setTimeout(Utils.refresh, 4500);
        }

        //Refreshes the page to complete the process
        private static refresh() {
            location.reload(true);
        }
        //# sourceMappingURL=customFunctions.js.map

        //Adds a new PCB row to the display whenever a new process is created
        //The blank row of '00' represents the IR table cell. Read the comment for 'updatePCIR()' on why it is this way.
        public static addPCBRow(pcb: ProcessControlBlock) {
            if(pcb === null) return; //Appropriate action needs to be defined -- should never actually happen though... (famous last words)
            else {
                let newRow = `<tr id='pcb${pcb.pid}'> <td>${pcb.pid}</td> <td>${pcb.priority}</td>
                <td>${pcb.state}</td> <td>${pcb.PC}</td> 
                <td>00</td>
                <td>${pcb.Acc}</td> <td>${pcb.Xreg}</td>
                <td>${pcb.Yreg}</td> <td>${pcb.Zflag}</td>
                <td>${pcb.location}</td></tr>`;
                document.getElementById("PCBTable").innerHTML += newRow;
            }
        }

        //Updates the appropriate PCB row when its respective process is in execution
        public static updatePCBRow(pcbInUse: ProcessControlBlock){
            let rowToUpdate = <HTMLTableRowElement>document.getElementById("pcb" + pcbInUse.pid);
            rowToUpdate.cells[3].innerHTML = pcbInUse.PC.toString(16).toUpperCase().padStart(2, "0");
            rowToUpdate.cells[2].innerHTML = pcbInUse.state + "";
            rowToUpdate.cells[5].innerHTML = pcbInUse.Acc.toString(16).toUpperCase().padStart(2, "0");
            rowToUpdate.cells[6].innerHTML = pcbInUse.Xreg.toString(16).toUpperCase().padStart(2, "0");
            rowToUpdate.cells[7].innerHTML = pcbInUse.Yreg.toString(16).toUpperCase().padStart(2, "0");
            rowToUpdate.cells[8].innerHTML = pcbInUse.Zflag.toString(16).toUpperCase().padStart(2, "0");
        }

        /*Independently updates the IR table cell in the PCB display.
            The reason I had to do it this way is because we want to see the current CPU's PC's values. However, because the displays update
            after the CPU has completed a cycle, we're really seeing *what it just did.* Therefore, if I kept these together, the PCB would update, then
            the PCB display would update, and we would see what the CPU was going to do next. This was a discontinuity that looked bad, so I separated them.
            They're called at effectively the same time so it's the same difference, but this nuanced nonesense bothers me to no end.
        */
        public static updatePCBIR(pcbInUse: ProcessControlBlock){
            let rowToUpdate = <HTMLTableRowElement>document.getElementById("pcb" + pcbInUse.pid);
            rowToUpdate.cells[4].innerHTML = _MemoryAccessor.read(_CurrentPCB.segment, _CurrentPCB.PC).toUpperCase().padStart(2, "0");
        }

        //Updates the CPU display as it is executing a program
        public static updateCPUDisplay(){
            document.getElementById("CPUPC").innerHTML = _CPU.PC.toString(16).toUpperCase().padStart(2, "0");
            if(_CurrentPCB == null){}
            else document.getElementById("CPUIR").innerHTML = _MemoryAccessor.read(_CurrentPCB.segment, _CurrentPCB.PC).toUpperCase().padStart(2, "0");
            document.getElementById("CPUAcc").innerHTML = _CPU.Acc.toString(16).toUpperCase().padStart(2, "0");
            document.getElementById("CPUX").innerHTML = _CPU.Xreg.toString(16).toUpperCase().padStart(2, "0");
            document.getElementById("CPUY").innerHTML = _CPU.Yreg.toString(16).toUpperCase().padStart(2, "0");
            document.getElementById("CPUZ").innerHTML = _CPU.Zflag.toString(16).toUpperCase().padStart(2, "0");
        }

        
        /*Dynamically populates the <table> with the contents of memory.
            The 'justCreated' boolean determines whether a new row was, well, justCreated. If so, create a new row and decrement the counter since it 'wasted a turn'
                populating the row's Hex label (ie 0x028) -- See next comment.
            The padStart() method, introduced in ES2017 (which I A. just discovered does exactly what I need and B. Is what you made the target for the project
                to be so #Bless) buffers a string with some text to a set length. Since all displayed Hex should be '0x1234', this works beautifully.
                The 256 * i acts as an offset for the segments so it keeps adding rather than restarting at 0x000.
            I also recognize that it is redundant to have the back-to-back if statements as they are, but when I changed them it broke... so I'll come back to that*
                *I probably... might... not.
        */
        public static drawMemory(): void{
            let table = "<table id='memory'>";
            let justCreated = false;
            for(let i = 0; i < _Memory.memoryContainer.length; i++){
                for(let j = 0; j < _Memory.memoryContainer[i].length; j++){
                    if(j == 0){
                        table += "<tr><td><b>" + "0x" + ((j + (256 * i)).toString(16).toUpperCase()).padStart(3, "0") + "</b></td>";
                    }
                    if(j % 8 == 0 && j != 0){
                        table += "</tr><tr><td><b>" + "0x" + (j + (256 * i)).toString(16).toUpperCase().padStart(3, "0") + "</b></td>";
                        justCreated = true;
                    }
                    else{
                        if(justCreated) {
                            justCreated = false;
                            j--;
                        }
                        table += "<td " + `id=mem${j + 256 * i}>` + _Memory.memoryContainer[i][j].padStart(2, 0) + "</td>";
                    }
                }
            }
            table += "</table>";
            document.getElementById("MemoryTable").innerHTML = table;
        }

        /*As a program is executing, it highlights the command in red. Then, as part of the command's execution, it also tells how many
            instructions it has. It will then iterate through the table and highlight all instructions to be blue.
        To now account for each segment, I created an offset of (segment * 255 + segment). This ensures that it starts highlighting at the correct cell.
        */
        public static highlightMemory(segment: number, pc: number, instrucAmount?: number){
            if(segment == 0){
                document.getElementById("mem"+(pc + (255 * segment))).style.backgroundColor = "red";
                for(let i = 1; i <= instrucAmount; i++) {
                    document.getElementById("mem"+((pc + (255 * segment)) + i)).style.backgroundColor = "#05aefc";
                }
            }
            else {
                document.getElementById("mem"+(pc + ((255 * segment) + segment))).style.backgroundColor = "red";
                for(let i = 1; i <= instrucAmount; i++) {
                    document.getElementById("mem"+((pc + ((255 * segment) + segment)) + i)).style.backgroundColor = "#05aefc";
                }
            }
            this.scrollTable(_CurrentPCB);
        }

        /*Disables single step. Useful for when things can go awry so the best way to deal with it is
            to prevent users from clicking the buttons entirely.
        */
        public static disableSS(){
            _SingleStep = false;
            (<HTMLButtonElement>document.getElementById("btnSingleStep")).disabled = true;
            (<HTMLButtonElement>document.getElementById("btnNextStep")).disabled = true;
        }

        /*Because of the quirk with the discrepancy between the CPU's IR and PCB's IR, it has to be reset graphically.
            Again, the CPU does not have control over this, so for now, this is how it has to be done.
        */
        public static resetCPUIR(){
            document.getElementById("CPUIR").innerHTML = "00";
        }

        /*Auto scrolls the table to the highlighted section of memory.
            My display has a height of 7 rows, and each row is 22 pixels tall.
            If a row is either of the first three, or last three, it cannot be centered, so don't do anything.
            If a row is the fourth from the top or bottom, it already is centered, so don't do anything.
            Otherwise, scroll down to that row, then SUBTRACT the height of three rows from the top of the display -- this centers it.
        */
        private static scrollTable(pcb: ProcessControlBlock){
            let segmentOffset = 704 * pcb.segment;
            let rowToScroll = (22 * Math.floor(pcb.PC / 8)) + segmentOffset;
            if(rowToScroll <= 88 || rowToScroll >= 2725) document.getElementById("MemoryTable").scrollTop = rowToScroll;
            else document.getElementById("MemoryTable").scrollTop = rowToScroll - 66;
        }

        /* Prints the wait time and turnaround time of a process. I made a new method for it because I wanted to format what was printed and it was taking up
            too much space. I was conflicted about where to put this method: I knew I had to get it out of CPU, and have since moved it here, to Utils...
        */
       public static printTime(pcb: ProcessControlBlock){
            _StdOut.advanceLine();
            _StdOut.putText(`Stats for process with PID: ${pcb.pid}`);
            _StdOut.advanceLine();
            _StdOut.putText(`Turn Around Time: ${pcb.turnaroundTime} cycles.`);
            _StdOut.advanceLine();
            _StdOut.putText(`Wait Time: ${pcb.waitTime} cycles.`);
            _StdOut.advanceLine();
            _StdOut.putText(_OsShell.promptStr);
        }

        public static updateGUI(pcb: ProcessControlBlock, instrucAmount: number){
            this.updateCPUDisplay();
            this.drawMemory();
            this.highlightMemory(pcb.segment, pcb.PC, instrucAmount);
            this.updatePCBIR(pcb);
            _Dispatcher.snapshot(pcb);
            this.updatePCBRow(pcb);
        }
    }
}
