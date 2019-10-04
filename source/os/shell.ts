/* ------------
   Shell.ts

   The OS Shell - The "command line interface" (CLI) for the console.

    Note: While fun and learning are the primary goals of all enrichment center activities,
          serious injuries may occur when trying to write your own Operating System.
   ------------ */

// TODO: Write a base class / prototype for system services and let Shell inherit from it.

module TSOS {
    export class Shell {
        // Properties
        public promptStr = ">";
        public commandList = [];
        public curses = "[fuvg],[cvff],[shpx],[phag],[pbpxfhpxre],[zbgureshpxre],[gvgf]";
        public apologies = "[sorry]";
        public status = "";

        constructor() {
        }

        public init() {
            var sc: ShellCommand;
            //
            // Load the command list.
            // The list is alphabetized for a. the user, b. the programmer, and c. Tab indexing

            // cls
            sc = new ShellCommand(this.shellCls,
                                  "cls",
                                  "- Clears the screen and resets the cursor position.");
            this.commandList[this.commandList.length] = sc;

            //crash
            sc = new ShellCommand(this.shellBSOD,
                                  "crash",
                                  " - Crashes the system.");
            this.commandList[this.commandList.length] = sc;

            //date
            sc = new ShellCommand(this.shellDate, 
                                  "date",
                                  "- Displays the current date and time.");
            this.commandList[this.commandList.length] = sc;
            
            // help
            sc = new ShellCommand(this.shellHelp,
                                  "help",
                                  "- Displays the list of available commands.");
            this.commandList[this.commandList.length] = sc;

            //load
            sc = new ShellCommand(this.shellLoad,
                                    "load",
                                    "- Loads user program into memory for execution.");
            this.commandList[this.commandList.length] = sc;

            // man <topic>
            sc = new ShellCommand(this.shellMan,
                                  "man",
                                  "<topic> - Displays the MANual page for <topic>.");
            this.commandList[this.commandList.length] = sc;

            // prompt <string>
            sc = new ShellCommand(this.shellPrompt,
                                  "prompt",
                                  "<string> - Sets the prompt.");
            this.commandList[this.commandList.length] = sc;

            // rot13 <string>
            sc = new ShellCommand(this.shellRot13,
                                  "rot13",
                                  "<string> - Does rot13 obfuscation on <string>.");
            this.commandList[this.commandList.length] = sc;

            // run <pid>
            sc = new ShellCommand(this.shellRun,
                                  "run",
                                  "<pid> - Executes a program in memory.");
            this.commandList[this.commandList.length] = sc;

            // shutdown
            sc = new ShellCommand(this.shellShutdown,
                                  "shutdown",
                                  "- Shuts down the virtual OS but leaves the underlying host / hardware simulation running.");
            this.commandList[this.commandList.length] = sc;

            //snap
            sc = new ShellCommand(this.shellSnap,
                                    "snap",
                                    "- Reality is often disappointing. That is, it was.");
            this.commandList[this.commandList.length] = sc;

            //status
            sc = new ShellCommand(this.shellStatus,
                                    "status",
                                    " - Sets a new status.");
            this.commandList[this.commandList.length] = sc;

            // trace <on | off>
            sc = new ShellCommand(this.shellTrace,
                                  "trace",
                                  "<on | off> - Turns the OS trace on or off.");
            this.commandList[this.commandList.length] = sc;

            // ver
            sc = new ShellCommand(this.shellVer,
                                  "ver",
                                  "- Displays the current version of the OS.");
            this.commandList[this.commandList.length] = sc;

            //whereami
            sc = new ShellCommand(this.shellWhereAmI,
                                    "whereami",
                                    "- Displays your current location.");
            this.commandList[this.commandList.length] = sc;
            
            // ps  - list the running processes and their IDs
            // kill <id> - kills the specified process id.

            // Display the initial prompt.
            this.putPrompt();
        }

        public printStatus(){
            return "Status: " + this.status;
        }

        public putPrompt() {
            _StdOut.putText(this.promptStr);
        }

        public handleInput(buffer) {
            _Kernel.krnTrace("Shell Command~" + buffer);
            //
            // Parse the input...
            //
            var userCommand = this.parseInput(buffer);
            // ... and assign the command and args to local variables.
            var cmd = userCommand.command;
            var args = userCommand.args;
            //
            // Determine the command and execute it.
            //
            // TypeScript/JavaScript may not support associative arrays in all browsers so we have to iterate over the
            // command list in attempt to find a match. 
            // TODO: Is there a better way? Probably. Someone work it out and tell me in class.
            var index: number = 0;
            var found: boolean = false;
            var fn = undefined;
            while (!found && index < this.commandList.length) {
                if (this.commandList[index].command === cmd) {
                    found = true;
                    fn = this.commandList[index].func;
                } else {
                    ++index;
                }
            }
            if (found) {
                this.execute(fn, args);  // Note that args is always supplied, though it might be empty.
            } else {
                // It's not found, so check for curses and apologies before declaring the command invalid.
                if (this.curses.indexOf("[" + Utils.rot13(cmd) + "]") >= 0) {     // Check for curses.
                    this.execute(this.shellCurse);
                } else if (this.apologies.indexOf("[" + cmd + "]") >= 0) {        // Check for apologies.
                    this.execute(this.shellApology);
                } else { // It's just a bad command. {
                    this.execute(this.shellInvalidCommand);
                }
            }
        }

        // Note: args is an optional parameter, ergo the ? which allows TypeScript to understand that.
        public execute(fn, args?) {
            // We just got a command, so advance the line...
            _StdOut.advanceLine();
            // ... call the command function passing in the args ...
            fn(args);
            // Check to see if we need to advance the line again
            if (_StdOut.currentXPosition > 0) {
                _StdOut.advanceLine();
            }
            // ... and finally write the prompt again if the shell has not crashed.
            if(_HasCrashed) return;
            this.putPrompt();
        }

        public parseInput(buffer: string): UserCommand {
            var retVal = new UserCommand();

            // 1. Remove leading and trailing spaces.
            buffer = Utils.trim(buffer);


            //2. Split up the input by spaces
            var tempList = buffer.split(" ");

            //2.1 Lowercase the command as an added measure
            tempList[0] = tempList[0].toLowerCase();

            //2.2 If the command is status, make an exception so the status itself can contain caps
            if(tempList[0] === "status") {
                retVal.command = Utils.trim(tempList.shift()).toLowerCase();
            }
            else {

                // 3. Separate on spaces so we can determine the command and command-line args, if any.

                // 4. Take the first (zeroth) element and use that as the command.
                var cmd = tempList.shift();  // Yes, you can do that to an array in JavaScript. See the Queue class.

                // 4.1 Remove any left-over spaces.
                cmd = Utils.trim(cmd);

                // 4.2 Record it in the return value.
                retVal.command = cmd;
            }

            // 5. Make another exception for the Status command so it can contain spaces
            if(retVal.command === "status") {
                retVal.args[0] = buffer.substr(7, buffer.length);
            }

            // 6. Now create the args array from what's left.
            else {
                for (var i in tempList) {
                var arg = Utils.trim(tempList[i]);
                    if (arg != "") {
                        retVal.args[retVal.args.length] = tempList[i];
                    }
                }
            }
            return retVal;
        }

        //
        // Shell Command Functions. Kinda not part of Shell() class exactly, but
        // called from here, so kept here to avoid violating the law of least astonishment.
        //
        public shellInvalidCommand() {
            _StdOut.putText("Invalid Command. ");
            if (_SarcasticMode) {
                _StdOut.putText("Unbelievable. You, [subject name here],");
                _StdOut.advanceLine();
                _StdOut.putText("must be the pride of [subject hometown here].");
            } else {
                _StdOut.putText("Type 'help' for a list of commands.");
            }
        }

        public shellCurse() {
            _StdOut.putText("Oh, so that's how it's going to be, eh? Fine.");
            _StdOut.advanceLine();
            _StdOut.putText("Bitch.");
            _SarcasticMode = true;
        }

        public shellApology() {
           if (_SarcasticMode) {
              _StdOut.putText("I think we can put our differences behind us.");
              _StdOut.advanceLine();
              _StdOut.putText("For science . . . You monster.");
              _SarcasticMode = false;
           } else {
              _StdOut.putText("For what?");
           }
        }

        // Although args is unused in some of these functions, it is always provided in the 
        // actual parameter list when this function is called, so I feel like we need it.

        public shellVer(args: string[]) {
            _StdOut.putText(APP_NAME + " v" + APP_VERSION);
        }

        public shellHelp(args: string[]) {
            _StdOut.putText("Commands:");
            for (var i in _OsShell.commandList) {
                _StdOut.advanceLine();
                _StdOut.putText("  " + _OsShell.commandList[i].command + " " + _OsShell.commandList[i].description);
            }
        }

        public shellShutdown(args: string[]) {
             _StdOut.putText("Shutting down...");
             // Call Kernel shutdown routine.
            _Kernel.krnShutdown();
        }

        public shellCls(args: string[]) {         
            _StdOut.clearScreen();     
            _StdOut.resetXY();
        }

        public shellMan(args: string[]) {
            if (args.length > 0) {
                var topic = args[0];
                switch (topic) {
                    case "ver":
                        _StdOut.putText("Lists the running version of the OS.");
                        break;
                    case "help":
                        _StdOut.putText("Displays a list of valid commands.");
                        break;
                    case "shutdown":
                        _StdOut.putText("Disables user input but keeps the underlying software running.");
                        break;
                    case "cls":
                        _StdOut.putText("Clears the screen of all text and resets the cursor's position back to the beginning.");
                        break;
                    case "man":
                        _StdOut.putText("Given a topic, the relevant description will be displayed."); //Make recursive?
                        break;
                    case "trace":
                        _StdOut.putText("Disable/Enable tracing. Tracing is the act of outputting the OS's activities to the Host Log.");
                        break;
                    case "rot13":
                        _StdOut.putText("Obfuscate text using the ROTation13 cipher. Take a letter's position in the alphabet, add 13 to it, "
                        + "and that becomes the new letter.");
                        break;
                    case "prompt":
                        _StdOut.putText("Sets a default prompt to the CLI for the session.");
                        break;
                    case "date":
                        _StdOut.putText("Displays the current date and time.");
                        break;
                    case "whereami":
                        _StdOut.putText("Displays the user's current location.");
                        break;
                    case "snap":
                        _StdOut.putText("Now, reality can be whatever I want.");
                        break;
                    case "status":
                        _StdOut.putText("Sets a new status to the status bar.");
                        break;
                    case "load":
                        _StdOut.putText("Validates user input and loads it into memory for execution. Code is written in Hex.");
                        break;
                    case "crash":
                        _StdOut.putText("Creates a user-generated crash for the Kernel.");
                        break;
                    case "run":
                        _StdOut.putText("Executes a user-input program from the load command specified by the PID.");
                        break;
                    default:
                        _StdOut.putText("No manual entry for " + args[0] + ".");
                }
            } else {
                _StdOut.putText("Usage: man <topic>. Please supply a topic.");
            }
        }

        public shellTrace(args: string[]) {
            if (args.length > 0) {
                var setting = args[0];
                switch (setting) {
                    case "on":
                        if (_Trace && _SarcasticMode) {
                            _StdOut.putText("Trace is already on, doofus.");
                        } else {
                            _Trace = true;
                            _StdOut.putText("Trace ON");
                        }
                        break;
                    case "off":
                        _Trace = false;
                        _StdOut.putText("Trace OFF");
                        break;
                    default:
                        _StdOut.putText("Invalid arguement. Usage: trace <on | off>.");
                }
            } else {
                _StdOut.putText("Usage: trace <on | off>");
            }
        }

        public shellRot13(args: string[]) {
            if (args.length > 0) {
                // Requires Utils.ts for rot13() function.
                _StdOut.putText(args.join(' ') + " = '" + Utils.rot13(args.join(' ')) +"'");
            } else {
                _StdOut.putText("Usage: rot13 <string>. Please supply a string.");
            }
        }

        public shellPrompt(args: string[]) {
            if (args.length > 0) {
                _OsShell.promptStr = args[0];
            } else {
                _StdOut.putText("Usage: prompt <string>. Please supply a string.");
            }
        }

        public shellDate(args: string[]){
            //_StdOut.putText("Going on half past a quarter of.");
            let temp = new Date();
            _StdOut.putText(temp.getTime() + " aka " + temp.toLocaleDateString("en-US"))
        }

        public shellWhereAmI(args: string[]){
            _StdOut.putText("Titan");
        }

        public shellSnap(args: string[]){
            //Requires Utils.snap() for optimal functionality
            if(!document.getElementById("video")) {
                _StdOut.putText("I am ... inevitable.");
            }
            else {
                _StdOut.putText("Universe ending. Please hold...");
                Utils.snap();
            }
        }

        //I limited the length of the status message just as a way to try and inhibit weird behaviors.
        public shellStatus(args: string[]){
            if(args.length > 0){
                status = args[0];
                if(status.length > 100){
                    _StdOut.putText("Status messages cannot be longer than 100 chars.");
                    return;
                }
                _StdOut.putText("New status: " + status);
                document.getElementById("status").innerHTML = "Status: " + status;
            }
            else{
                _StdOut.putText("Usage: status: <string>. Please supply a string.");
            }
        }

        //The command is crash because it is more intuitive for an end-user, but is interally referenced as BSOD for the assignment
        public shellBSOD(args: string[]){
            Utils.crash();
        }

        //Loads a program into memory for execution
        public shellLoad(args: string[]) {
            if(Utils.verifyInput()){
                let availableMemory = _MemoryManager.getMemoryStatus();
                if(!availableMemory) {
                    _Kernel.krnTrapError("Segmentation Fault. No available memory.");
                    _HasCrashed = true;
                }
                else {
                    let overritten = false;
                    let pcb = new ProcessControlBlock();
                    pcb.segment = _MemoryManager.getAvailableMemory(availableMemory);
                    if(pcb.segment > 0) {  //For now it only writes to memory segment 0 (the first segment) for iProject2
                        _Kernel.krnTrapError("Segmentation Fault. Only segment 0 for iProject2.");
                        return;
                    }
                    pcb.location = "Memory"; //Will be set more dynamically when more segments/HDD come online
                    //_MemoryManager.setMemoryStatus(pcb.segment); - Ignored to always write to memory segment 0
                    _MemoryAccessor.write(pcb.segment, Utils.standardizeInput());
                    _CurrentPCB = pcb;
                    //Make an attempt to clean old/unused PCBs
                    if(_PCBManager.length > 0) {
                        for(let i = 0; i < _PCBManager.length; i++){
                            if(_PCBManager[i].state === "Resident" || _PCBManager[i].state === "Terminated"){
                                _PCBManager[i] = _CurrentPCB;
                                overritten = true;
                                break;
                            }
                        }
                    }
                    if(!overritten) _PCBManager[_PCBManager.length] = pcb;
                    _StdOut.putText(`Program successfully loaded! PID ${pcb.pid}`);
                    //_MemoryAccessor.print();
                    Utils.drawMemory();
                    Utils.addPCBRow();
                    _CurrentPCB.reinstate();
                }
            }
        }

        public shellRun(args: string[]){
            if(args.length > 0){
                for(let i = 0; i < _PCBManager.length; i++){
                    if(parseInt(args[i]) == _PCBManager[i].pid){
                        _CurrentPCB = _PCBManager[i];
                        if(_CurrentPCB.state === "Terminated") _StdOut.putText("Execution of that program has since completed.");
                        else if(_CurrentPCB.state === "Running")  _StdOut.putText("The specified program is currently running.");
                        else {
                            _CPU.isExecuting = true;
                            _MemoryManager.setMemoryStatus(_CurrentPCB.segment);
                            _StdOut.putText(`Execution of Program ${_CurrentPCB.pid} has begun.`);
                        }
                        return;
                    }
                }
                if(parseInt(args[0]) < _PID) _StdOut.putText("Execution of that program has since completed.");
                else _StdOut.putText(`No Program with PID ${args[0]} exists.`);
            }
            else _StdOut.putText("Usage: run <pid>. Specify a program by its PID.");
        }
    }
}
