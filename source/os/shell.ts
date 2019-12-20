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

            // clearMem
            sc = new ShellCommand(this.shellClearMem,
                                "clearmem",
                                "- Clears memory of all Resident programs.");
            this.commandList[this.commandList.length] = sc;

            // crash
            sc = new ShellCommand(this.shellBSOD,
                                  "crash",
                                  " - Crashes the system.");
            this.commandList[this.commandList.length] = sc;

            // create
            sc = new ShellCommand(this.shellCreateFile,
                                  "create",
                                   "<filename> - Creates a file with the designated name.");
            this.commandList[this.commandList.length] = sc;

            // date
            sc = new ShellCommand(this.shellDate, 
                                  "date",
                                  "- Displays the current date and time.");
            this.commandList[this.commandList.length] = sc;

            // delete
            sc = new ShellCommand(this.shellDelete,
                                  "delete",
                                   "<filename> - Deletes the specified from disk.");
            this.commandList[this.commandList.length] = sc;

            // dog
            sc = new ShellCommand(this.shellDog,
                                  "dog",
                                   "- Make a heckin' floofer do an appear.");
            this.commandList[this.commandList.length] = sc;
            
            // format
            sc = new ShellCommand(this.shellFormat,
                                  "format",
                                   "- Formats the disk drive.");
            this.commandList[this.commandList.length] = sc;

            // getschedule
            sc = new ShellCommand(this.shellGetSchedule,
                                  "getsch",
                                   "- See the current CPU schedule.");
            this.commandList[this.commandList.length] = sc;

            // help
            sc = new ShellCommand(this.shellHelp,
                                  "help",
                                  "<page?> - Displays a list of available commands.");
            this.commandList[this.commandList.length] = sc;

            // kill
            sc = new ShellCommand(this.shellKill,
                                 "kill",
                                 "<pid> - Kills the specified process.");
            this.commandList[this.commandList.length] = sc;

            // killall
            sc = new ShellCommand(this.shellKillAll,
                                  "killall",
                                  "- Kills all programs.");
            this.commandList[this.commandList.length] = sc;

            // list
            sc = new ShellCommand(this.shellList,
                                  "ls",
                                  "- Lists the files on disk.");
            this.commandList[this.commandList.length] = sc;

            // load
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

            // ps
            sc = new ShellCommand(this.shellPS,
                                 "ps",
                                 "- Lists the PID and State of all available processes.");
            this.commandList[this.commandList.length] = sc;

            // quantum <number>
            sc = new ShellCommand(this.shellQuantum,
                                  "quantum",
                                  "<flag> or <integer> - Set the quantum for RR scheduling.");
            this.commandList[this.commandList.length] = sc;

            // read <file>
            sc = new ShellCommand(this.shellReadFile,
                                  "read",
                                  "<filename> - Read the contents of a file.");
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

            // runall
            sc = new ShellCommand(this.shellRunAll,
                                  "runall",
                                  "- Runs all programs in memory.");
            this.commandList[this.commandList.length] = sc;

            // set schedule
            sc = new ShellCommand(this.shellSetSchedule,
                                  "setsch",
                                  "- Sets the scheduling algorithm.");
            this.commandList[this.commandList.length] = sc;

            // shutdown
            sc = new ShellCommand(this.shellShutdown,
                                  "shutdown",
                                  "- Shuts down the virtual OS but leaves the underlying host / hardware simulation running.");
            this.commandList[this.commandList.length] = sc;

            // snap
            sc = new ShellCommand(this.shellSnap,
                                  "snap",
                                  "- Reality is often disappointing. That is, it was.");
            this.commandList[this.commandList.length] = sc;

            // status
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

            // whereami
            sc = new ShellCommand(this.shellWhereAmI,
                                  "whereami",
                                "- Let me guess, your home?");
            this.commandList[this.commandList.length] = sc;

            // write 
            sc = new ShellCommand(this.shellWriteToFile,
                                  "write",
                                  "<filename> <data> - Writes data to the specified file.");
            this.commandList[this.commandList.length] = sc;

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
                } else if(cmd == "") {
                    _StdOut.advanceLine();
                    _StdOut.putText(this.promptStr);
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

            // 1.5 Make an exception for the write command to manage the command, fileName, and data
            if(buffer.substring(0, 6) == "write "){
                let command = buffer.substring(0, 5);
                buffer = buffer.substring(6).trim();
                let fileName;
                let data;

                //If spaces exist, there is data -> parse for it.
                    //This needs to be done because if substring tries to make a string using an index of a char that does not exist (-1), it freaks out.
                if(buffer.indexOf(" ") != -1) {
                    fileName = buffer.substring(0, buffer.indexOf(" ")).trim();
                    data = buffer.substring(buffer.indexOf(" ") + 1).trim();
                }
                else fileName = buffer.trim(); //Otherwise, there is only a filename

                retVal.command = Utils.trim(command);
                retVal.args[0] = fileName;
                retVal.args[1] = data;
                return retVal;
            }

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

        /**
         * Since the command list is growing beyond the size of the CLI, I've turned the help command into one that recommends an argument.
         * Each 'page' holds up to 15 commands.
         */
        public shellHelp(args: string[]) {
            const PAGE = parseInt(args[0]);
            const COMMAND_LIMIT = 15;
            
            if(args.length <= 0){
                for (var i in _OsShell.commandList) {
                    _StdOut.advanceLine();
                    _StdOut.putText("  " + _OsShell.commandList[i].command + " " + _OsShell.commandList[i].description);
                }
            }
            else if(COMMAND_LIMIT * PAGE - _OsShell.commandList.length >= COMMAND_LIMIT || PAGE <= 0) _StdOut.putText("There are no commands on that page.");
            else if(isNaN(PAGE)) _StdOut.putText("Usage: help <page?>. Please specify a page.");
            else{ 
                _StdOut.putText("Commands:");
                if(PAGE == 1) {
                    for(let i = 0; i < 15; i++){
                        _StdOut.advanceLine();
                        _StdOut.putText("  " + _OsShell.commandList[i].command + " " + _OsShell.commandList[i].description);
                    }
                    _StdOut.advanceLine();
                    _StdOut.putText("Page 1");
                }
                else if(PAGE > 1){
                    const PAGE_START = COMMAND_LIMIT * (PAGE - 1);
                    const PAGE_END = COMMAND_LIMIT * (PAGE - 1) + COMMAND_LIMIT;
                    for(let i = PAGE_START; i < PAGE_END; i++){
                        if(i >= _OsShell.commandList.length) {
                            _StdOut.advanceLine();
                            _StdOut.putText("Page " + PAGE);
                            return;
                        }
                        else {
                            _StdOut.advanceLine();
                            _StdOut.putText("  " + _OsShell.commandList[i].command + " " + _OsShell.commandList[i].description);
                        }
                    }
                    _StdOut.advanceLine();
                    _StdOut.putText("Page " + PAGE);
                }
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
                        _StdOut.putText("Displays the entire list of available commands. Or, given a page number, displays 15 commands."
                        + " Commands are organized alphabetically.");
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
                    case "quantum":
                        _StdOut.putText("Specifies how many cycles a program receives in the Round Robin Scheduling scheme."
                            + " Usable Flags: 'v' and 'd'. v: Display current value. d: Reset to default (6).");
                        break;
                    case "clearmem":
                        _StdOut.putText("Clears all memory of programs with a State of 'Resident,' resetting values to 0.");
                        _StdOut.advanceLine()
                        _StdOut.putText("Processes in the State of 'Terminated' are unaffected because they are A) automatically removed"
                            + " from the queue and B) exist in a different queue entirely.");
                        _StdOut.advanceLine();
                        _StdOut.putText("The GUI will update only when new programs are written to memory. This is for debugging purposes.");
                        break;
                    case "runall":
                        _StdOut.putText("Runs any 'Resident' programs in memory.");
                        break;
                    case "ps":
                        _StdOut.putText("Lists the state and PID of all available processes. Only processes listed as 'Resident,' 'Ready,' or 'Running'" + 
                            " are considered available.");
                        break;
                    case "kill":
                        _StdOut.putText("Terminates execution of the specified program. Only processes listed as 'Ready' or 'Running'" +
                            " can be terminated.");
                        break;
                    case "killall":
                        _StdOut.putText("Terminates execution of all programs. Only processes listed as 'Ready' or 'Running' can be terminated.");
                        break;
                    case "dog":
                        _StdOut.putText("Bork");
                        _StdOut.advanceLine();
                        _StdOut.putText("-A very good boi");
                        break;
                    case "setsch":
                        _StdOut.putText("Defines the order in which the programs will execute.");
                        _StdOut.advanceLine();
                        _StdOut.putText("Valid inputs: fcfs, priority, rr, or d.");
                        _StdOut.advanceLine();
                        _StdOut.putText("FCFS: First Come First Serve.");
                        _StdOut.advanceLine();
                        _StdOut.putText("Priority: Defined by importance, Non preemptive.");
                        _StdOut.advanceLine();
                        _StdOut.putText("Round Robin: All programs get x turns, x = quantum.");
                        _StdOut.advanceLine();
                        _StdOut.putText("d: The default scheduling algorithm, Round Robin.");
                        break;
                    case "getsch":
                        _StdOut.putText("Returns the current scheduling algorithm for CPU execution.");
                        break;
                    case "format":
                        _StdOut.putText("Formats the disk drive. Available flag: q.");
                        _StdOut.advanceLine();
                        _StdOut.putText("Full Format: Default Operation. Complete wipe of drive and meta data.");
                        _StdOut.advanceLine();
                        _StdOut.putText("Quick Format (q): Wipe only meta data.");
                        break;
                    case "create":
                        _StdOut.putText("If the disk is formatted and there is available space, ");
                        _StdOut.advanceLine();
                        _StdOut.putText("creates a file with the specified name.");
                        break;
                    case "write":
                        _StdOut.putText("When given a file name and some data, ");
                        _StdOut.advanceLine();
                        _StdOut.putText("the data is written to the specified file.");
                        break;
                    case "read":
                        _StdOut.putText("Given a file name, outputs file's contents.");
                        break;
                    case "ls":
                        _StdOut.putText("Lists the files on disk. Available flag: l.");
                        _StdOut.advanceLine();
                        _StdOut.putText("Hidden Files (l): List hidden files as well.");
                        break;
                    case "delete":
                        _StdOut.putText("Deletes the specified file from disk.");
                        _StdOut.advanceLine();
                        _StdOut.putText("This action is not reversible.");
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
            _StdOut.putText("It was. And it was beautiful. Titan was like most planets: too many mouths, not enough to go around.");
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
        public shellBSOD(){
            Utils.crash();
        }

        //Loads a program into the OS for execution
        public shellLoad(args: string[]) {
            let memoryWrite = false;
            let diskWrite = false;
            if(Utils.verifyInput()){
                let availableMemory = _MemoryManager.getMemoryStatus();
                let pcb: ProcessControlBlock;
                if(availableMemory){
                    pcb = new ProcessControlBlock(_MemoryManager.getNextAvailableSegment());
                    if(args.length > 0 && Number.isInteger(parseInt(args[0])) && parseInt(args[0]) <= 10 && parseInt(args[0]) >= 1) pcb.priority = parseInt(args[0]);
                    else {
                        _StdOut.putText(`Defaulting to priority ${PRIORITY_DEFAULT}.`);
                        _StdOut.advanceLine();
                        pcb.priority = PRIORITY_DEFAULT;
                    }
                    _MemoryManager.toggleMemoryStatus(pcb.segment);
                    pcb.location = "Memory";
                    if(_CPU.isExecuting) _CPU.init();
                    _MemoryManager.wipeSegmentByID(pcb.segment);
                    _MemoryAccessor.write(pcb.segment, Utils.standardizeInput());
                    _StdOut.putText(`Program successfully loaded! PID ${pcb.pid}`);
                    Utils.drawMemory();
                    memoryWrite = true;
                }
                else if(!_Disk.isFormatted){
                    _StdOut.putText("There is no available memory.");
                    _StdOut.advanceLine();
                    _StdOut.putText("Try formatting the disk to input more programs.");
                    return;
                }
                else if(!_fsDD.isDiskFull()){
                    pcb = new ProcessControlBlock(-1);
                    let isCreated = _fsDD.createFile(`@swap${pcb.pid}`);
                    let isWritten = _fsDD.writeToFile(`@swap${pcb.pid}`, Utils.standardizeInput());
                    if(isCreated && isWritten){
                        if(args.length > 0 && Number.isInteger(parseInt(args[0])) && parseInt(args[0]) <= 10 && parseInt(args[0]) >= 1) pcb.priority = parseInt(args[0]);
                        else {
                            _StdOut.putText(`Defaulting to priority ${PRIORITY_DEFAULT}.`);
                            _StdOut.advanceLine();
                            pcb.priority = PRIORITY_DEFAULT;
                        }
                        pcb.location = "Disk";
                        _StdOut.putText(`Program successfully loaded! PID ${pcb.pid}`);
                        Utils.drawDisk();
                        diskWrite = true;
                    }
                    else{
                        _StdOut.putText("There was not enough space available on disk to create the new program.");
                        _fsDD.deleteFile(`@swap${pcb.pid}`);
                        _PID--;
                    }
                    Utils.drawDisk();
                }
                if(diskWrite || memoryWrite){
                    _ResidentPCB[_ResidentPCB.length] = pcb;
                    Utils.addPCBRow(pcb);
                    Utils.updatePCBRow(pcb);
                }
            }
        }

        //Runs a program stored in memory when given a corresponding PID
        public shellRun(args: string[]){
            if(args.length > 0){
                for(let i = 0; i < _ResidentPCB.length; i++){
                    if(parseInt(args[0]) == _ResidentPCB[i].pid){
                        let temp = _ResidentPCB[i];
                        if(temp.state === "Terminated") _StdOut.putText("Execution of that program has since completed.");
                        else if(temp.state === "Running") _StdOut.putText("The specified program is currently running.");
                        else {

                            //If the CPU is not executing AND Single Step is NOT enabled, then it is okay to brute-force a start of execution
                            if(!_CPU.isExecuting && !_CPU.hasExecutionStarted) {
                                _CPU.init();
                                _CurrentPCB = null;
                                _CPU.isExecuting = true;
                                if(temp.segment == -1){
                                    if(_MemoryManager.getNextAvailableSegment() != -1){
                                        //Brute-force swap
                                        _Swapper.swapFor(temp);
                                        Utils.updatePCBRow(temp);
                                    }
                                    else{
                                        //Standard swap
                                        _Swapper.swapWith(temp, _ResidentPCB[0]);
                                        Utils.updatePCBRow(_ResidentPCB[0]);
                                    }
                                }
                            }

                            //If Single Step is enabled, make sure to update the new program's state and display immediately
                            if(_CPU.hasExecutionStarted) {
                                temp.state = "Ready";
                                Utils.updatePCBRow(temp);
                            }
                            _ReadyPCB[_ReadyPCB.length] = temp;
                            _ResidentPCB.splice(_ResidentPCB.indexOf(temp), 1);
                            if(_CurrentPCB == null) _CurrentPCB = temp;
                            _StdOut.putText(`Execution of Program ${temp.pid} has begun.`);
                        }
                        return;
                    }
                }
                if(parseInt(args[0]) < 0) {
                    _StdOut.putText("It is not possible to have negative PIDs. Shutting down for OS' safety.");
                    _HasCrashed = true;
                }
                else _StdOut.putText(`No Program with PID ${args[0]} exists.`);
            }
            else _StdOut.putText("Usage: run <pid>. Specify a program by its PID.");
        }

        /*Specifies a quantum for the Round Robin Scheduling scheme
            I added two flags:
                a. The 'd' flag sets the quantum to its default of 6.
                b. The 'v' flag displays the current value.
            Also, if the user tries to do a quantum that is not a whole number (7.8), it gets rounded to the closest number.
            The regex prevents negative numbers since '-' is parsed as a non-digit.
        Also, quantua cannot be set to 0... (I know the regex should cover -- it does -- but I wanted to be extra sure)
        */
        public shellQuantum(args: string[]){
            let valid = /^[0-9.]+$/gm;
            if(args.length > 0){

                if(args[0] == 'd' || args[0] == '0') {
                    _StdOut.putText(`The quantum has been reset to its default value of ${QUANTUM_DEFAULT}.`);
                    _Quantum = QUANTUM_DEFAULT;
                    return;
                }
                else if(args[0] == 'v') {
                    _StdOut.putText(`The current quantum is ${_Quantum}.`);
                    return;
                }

                else if(!valid.test(args[0]) || parseInt(args[0]) < 0) {
                    _StdOut.putText("Invalid argument. Quanta can only be integers greater than 0.");
                    return;
                }
                else if(parseFloat(args[0]) % 1 != 0) _StdOut.putText("Input has been rounded. The new quantum is " + Math.round(parseFloat(args[0])) + ".");
                else _StdOut.putText("The new quantum is " + Math.round(parseInt(args[0])));

                _Quantum = Math.round(parseFloat(args[0]));
            }
            else _StdOut.putText("Usage: quantum <flag> or <integer>. Specify an appropriate quantum.");
        }

        /*Clears memory of any programs with the State of 'Resident' and currently in memory.
          It ignores the disk entirely. There's that weird i+=0 because again, splicing (not slicing)
            changes the physical size of the array.
          However, since we need to go through the whole Resident array to find which programs
            were occupying the memory to update status and remove it, i is incremented when one isn't found,
            otherwise it'd be stuck in an infinite loop.
        */
        public shellClearMem(){
            if(_ResidentPCB.length <= 0) {
                _StdOut.putText("There are no programs to clear.");
            }
            else if(_CPU.hasExecutionStarted) _StdOut.putText("Memory cannot be cleared during execution.");
            else{
                _MemoryManager.wipeSegmentByID();
                _MemoryManager.setAllAvailable();
                for(let i = 0; i < _ResidentPCB.length; i+=0){
                    let temp = _ResidentPCB[i];
                    if(temp.segment >= 0 && temp.segment <= 2){
                        temp.state = "Terminated";
                        Utils.updatePCBRow(temp);
                        _ResidentPCB.splice(_ResidentPCB.indexOf(temp), 1);
                    }
                    else i++;
                }
                _StdOut.putText("Memory successfully cleared.");
            }
        }

        /*Runs all programs sitting in the Resident Queue. The Scheduler (is supposed to) ensure(s) that any new programs will be executed if added after
            this command is run.
        */
        public shellRunAll(){
            if(_ResidentPCB.length == 0){
                _StdOut.putText("There are currently no programs to run.");
                return;
            }
            else{
                if(_ResidentPCB.length == 0 && _ReadyPCB.length > 0) {
                    _StdOut.putText("Everything is already running.");
                    return;
                }
                /*So this gave me a headache and a half...
                  The Resident and Ready Queues are mutually exclusive. So, when I move it to Ready, I remove it from Resident.
                  Since this **changes the size of the array,** the for loop always ended early.
                  Because I need to remove it, I use this as the for loop counter, which is why i itself does not actually change.
                */
                for(let i = 0; i < _ResidentPCB.length; i+=0) {
                    let temp = _ResidentPCB[i];
                    if(temp.segment == -1){
                        if(_MemoryManager.getNextAvailableSegment() != -1){
                            //Brute-force swap
                            _Swapper.swapFor(temp);
                            temp.location = "Memory";
                            Utils.updatePCBRow(temp);
                        }
                    }
                    temp.state = "Ready";
                    Utils.updatePCBRow(temp);
                    _ReadyPCB[_ReadyPCB.length] = temp;
                    _ResidentPCB.splice(i, 1);
                }

                if(_CPU.isExecuting) _StdOut.putText("New program(s) successfully added to the schedule.");
                else{
                    _CPU.init();
                    if(_CurrentSchedule == "priority"){
                        let highest = _ReadyPCB[0];
                        for(let i = 0; i < _ReadyPCB.length; i++){
                            if(_ReadyPCB[i].priority < highest.priority){
                                highest = _ReadyPCB[i];
                            }
                        }
                        _CurrentPCB = highest;
                        if(_CurrentPCB.segment == -1) {
                            _Swapper.swapWith(_CurrentPCB, _ReadyPCB[0]);
                            Utils.updatePCBRow(_CurrentPCB);
                            Utils.updatePCBRow(_ReadyPCB[0]);
                        }
                    }
                    else _CurrentPCB = _ReadyPCB[0];
                    _CPU.isExecuting = true;
                    _StdOut.putText("Now executing all programs in memory.");
                }
            }
        }

        /* Lists any program or process labeled as 'Resident,' 'Ready,' or 'Running.'
        */
        public shellPS(){
            if(_ResidentPCB.length == 0 && _ReadyPCB.length == 0){
                _StdOut.putText("There are currently no processes to list.");
                return;
            }
            else{
                _StdOut.putText("List of current programs or processes:");
                _StdOut.advanceLine();
                if(_ResidentPCB.length > 0) {
                    for(let i = 0; i < _ResidentPCB.length; i++){
                        _StdOut.putText(`PID: ${_ResidentPCB[i].pid} | State: ${_ResidentPCB[i].state}`);
                        _StdOut.advanceLine();
                    }
                }
                if(_ReadyPCB.length > 0) {
                    for(let i = 0; i < _ReadyPCB.length; i++){
                        _StdOut.putText(`PID: ${_ReadyPCB[i].pid} | State: ${_ReadyPCB[i].state}`);
                        _StdOut.advanceLine();
                    }
                }
                _StdOut.putText("**************************");
            }
        }

        /* Kills a specified process (anything 'Ready' or 'Running').
        */
        public shellKill(args: string){
            if(_ReadyPCB.length == 0){
                _StdOut.putText("There are currently no processes to kill.");
                return;
            }
            else{
                let found = false;
                for(let i = 0; i < _ReadyPCB.length; i++) {
                    if(_ReadyPCB[i].pid == parseInt(args[0])) {
                        let temp = _ReadyPCB[i];
                        found = true;
                        _StdOut.putText(`Found process with PID ${temp.pid}.`);
                        temp.state = "Terminated";
                        Utils.updatePCBRow(temp);
                        _StdOut.advanceLine();
                        _StdOut.putText(`Process with PID ${temp.pid} has been killed.`);
                        if(temp.segment != -1) _MemoryManager.setSegmentTrue(temp.segment);
                        Utils.printTime(temp);
                        _ReadyPCB.splice(i, 1);
                        if(_ReadyPCB.length == 0) _CPU.isExecuting = false;
                        else {
                            let interrupt =  new TSOS.Interrupt(SOFTWARE_IRQ, [0]);
                            _KernelInterruptQueue.enqueue(interrupt);
                        }
                        break;
                    }
                }
                if(!found) _StdOut.putText(`There are no known processes with PID ${args[0]}.`);
            }
        }

        /* Kills all processes (anything 'Ready' or 'Running').
        */
        public shellKillAll(){
            if(_ReadyPCB.length == 0){
                _StdOut.putText("There are currently no processes to terminate.");
                return;
            }
            else{
                _StdOut.putText("Executing Order 66...");
                _StdOut.advanceLine();
                for(let i = 0; i < _ReadyPCB.length; i++){
                    _ReadyPCB[i].state = "Terminated";
                    Utils.updatePCBRow(_ReadyPCB[i]);
                    if(_ReadyPCB[i].segment != -1) _MemoryManager.setSegmentTrue(_ReadyPCB[i].segment);
                    Utils.printTime(_ReadyPCB[i]);
                }
                _CPU.isExecuting = false;
                _CPU.init();
                Utils.updateCPUDisplay();
                Utils.resetCPUIR();
                _ReadyPCB = [];
                _StdOut.putText("All of the processes have been terminated.");
            }
        }

        /* In Memorium to Gabe the Dog. RIP in peace, homie.
         */
        public shellDog(){
            if(_CPU.hasExecutionStarted) _StdOut.putText("The dog doesn't like CPU execution. Try again later.");
            else Utils.dogInit();
        }

        /* Shell command to set the current CPU scheduling algorithm.
        */
        public shellSetSchedule(args: string[]){
            let schedule = args[0];
            switch(schedule){
                case "fcfs":
                    _CurrentSchedule = "fcfs";
                    _StdOut.putText("Schedule set to First Come First Serve.");
                    break;
                case "priority":
                    _CurrentSchedule = "priority";
                    _StdOut.putText("Schedule set to Priority.");
                    break;
                case "rr":
                    _CurrentSchedule = "rr";
                    _StdOut.putText("Schedule set to Round Robin.");
                    break;
                case "d":
                    _CurrentSchedule = SCHEDULE_DEFAULT;
                    _StdOut.putText("Schedule set to default of Round Robin.");
                    break;
                default:
                    _CurrentSchedule = SCHEDULE_DEFAULT;
                    _StdOut.putText("That is not a valid Scheduling Algorithm.");
                    _StdOut.advanceLine();
                    _StdOut.putText("Defaulting to Round Robin.");
                    break;
            }
            if(_CPU.hasExecutionStarted) {
                let interrupt = new Interrupt(SOFTWARE_IRQ, [0]);
                _KernelInterruptQueue.enqueue(interrupt);
            }
        }

        /* Prints the current CPU scheduling algorithm to the console.
        */
        public shellGetSchedule(){
            let schedule: string;
            if(_CurrentSchedule == "fcfs") schedule = "First Come First Serve";
            else if(_CurrentSchedule == "priority") schedule = "Priority";
            else schedule = "Round Robin";
            _StdOut.putText(`The current CPU scheduling algorithm is ${schedule}.`);
        }

        /* Shell command to format the disk.
            The result of the format prints a success or failure message.
        */
        public shellFormat(args: string[]){
            if(_CPU.hasExecutionStarted || _CPU.isExecuting){
                _StdOut.putText("The Disk cannot be formatted during execution.");
                return;
            }
            let isCompleted: boolean;
            let isQFormat: boolean = false;
            if(args[0] == "q") {
                if(!_fsDD.disk.isFormatted){
                    _StdOut.putText("Quick Formats can only be performed after at least one full format.");
                    return;
                }
                else{
                    _StdOut.putText("Performing Quick Format...");
                    isCompleted = _fsDD.format(true);
                    isQFormat = true;
                    _StdOut.advanceLine();
                }
            }
            else if(args.length == 0){
                _StdOut.putText("Performing Full Format...");
                isCompleted = _fsDD.format(false);
                _StdOut.advanceLine();
            }
            else{
                _StdOut.putText("Usage: format <flag?>.");
                return;
            }

            if(isCompleted){
                if(isQFormat) _StdOut.putText("Quick Format successful!");
                else _StdOut.putText("Full Format successful!");
                Utils.drawDisk();
                Utils.enableScroll(<HTMLDivElement>document.getElementById("HDDDisplay"));
                for(let i = 0; i < _ResidentPCB.length; i+=0){
                    let temp = _ResidentPCB[i];
                    if(temp.segment == -1){
                        temp.state = "Terminated";
                        Utils.updatePCBRow(temp);
                        _ResidentPCB.splice(_ResidentPCB.indexOf(_ResidentPCB[i]), 1);
                    }
                    else i++;
                }
            }
            else if(!isCompleted) _StdOut.putText("The format failed.");
            else _StdOut.putText("Error! There was an error displaying the error. Layman's: If you're seeing this, something is very wrong :(");

        }

        /* Shell command to create a file.
            Creates a file on disk if A) the disk is formatted, B) there is enough space, and C) the file does not already exist.
        */
        public shellCreateFile(args: string[]){
            let isCreated = false
            if(!_fsDD.disk.isFormatted) {
                _StdOut.putText("Files can only be created once the disk is formatted.");
                return;
            }
            else if(args.length <= 0) {
                _StdOut.putText("A file name must contain at least one valid character.");
                return;
            }
            else if(args[0].charAt(0) == "@") {
                _StdOut.putText("Invalid name. File names cannot start with '@.'");
                return;
            }
            else {
                isCreated = _fsDD.createFile(args[0]);
            }
            if(isCreated) {
                Utils.drawDisk();
                _StdOut.putText(`File '${args[0]}' was created successfully!`);
            }
            else{
                _StdOut.putText("There was an issue creating the file.");
            }
        }

        /* Shell command to write data to files
            Writes data to a file if A) the disk is formatted, B) the file already exists and C) there is enough room for the data.
        */
        public shellWriteToFile(args: string[]){
            if(!_Disk.isFormatted) _StdOut.putText("Data cannot be written to an unformatted disk.");
            else if(typeof args[0] === "undefined" || args[0] == "") _StdOut.putText("A valid file name must be provided.");
            else if(typeof args[1] === "undefined" || args[1] == "") _StdOut.putText("Data must be given to write to a file.");
            else if(args[0].charAt(0) == "@") _StdOut.putText("File names starting with '@' cannot be written to.");
            else if(args[1].charAt(0) != `"` || args[1].charAt(args[1].length-1) != `"`) _StdOut.putText("File data must be between quotes.");
            else {
                let data = args[1].substring(1, args[1].length-1);
                let isWritten = _fsDD.writeToFile(args[0], data);
                if(isWritten) {
                    _StdOut.putText(`File ${args[0]} successfully written to!`);
                    Utils.drawDisk();
                }
                else{
                    _StdOut.putText("File write unsuccessful.");
                }
            }
        }

        /* Shell command to read a file
            Reads a file from disk if A) the disk is formatted and B) the file already exists
        */
        public shellReadFile(args: string[]){
            if(!_Disk.isFormatted) _StdOut.putText("Data cannot be read from an unformatted disk.");
            else if(args.length == 0) _StdOut.putText("A valid file name must be provided.");
            else if(args[0].charAt(0) == "@") _StdOut.putText("File names starting wtih '@' cannot be read.");
            else {
                _StdOut.putText(_fsDD.readFile(args[0]));
            }
        }

        /* Shell command to list the files on disk
            Lists all files on disk if the disk is formatted.
        */
        public shellList(args: string[]){
            if(!_Disk.isFormatted) _StdOut.putText("Files cannot be listed from an unformatted disk.");
            else if(args[0] == "l"){
                let files = _fsDD.listFiles(true);
                if(files.length == 0) _StdOut.putText("No files are stored on disk.");
                else{
                    _StdOut.putText("List of all files:");
                    _StdOut.advanceLine();
                    for(let i = 0; i < files.length; i++){
                        _StdOut.putText(files[i]);
                        if(i != files.length - 1) _StdOut.advanceLine();
                    }
                }
            }
            else{
                let files = _fsDD.listFiles(false);
                if(files.length == 0) _StdOut.putText("No files are stored on disk.");
                else{
                    _StdOut.putText("List of files:");
                    _StdOut.advanceLine();
                    for(let i = 0; i < files.length; i++){
                        _StdOut.putText(files[i]);
                        if(i != files.length - 1) _StdOut.advanceLine();
                    }
                }
            }
        }

        /* Shell command to delete a file from the disk
            Deletes a file from the disk if A) the disk is formatted and B) the file already exists.
        */
        public shellDelete(args: string[]){
            if(!_Disk.isFormatted) _StdOut.putText("Files cannot be deleted from an unformatted disk.");
            else{
                if(args.length == 0) {
                    _StdOut.putText("Usage: delete <filename>. Specify a file to delete.");
                    return;
                }
                else if(args[0].charAt(0) == "@") {
                    _StdOut.putText("File names starting with '@' cannot be deleted.");
                    return;
                }
                let wasDeleted = _fsDD.deleteFile(args[0]);
                if(wasDeleted) {
                    _StdOut.putText("File successfully deleted!");
                    Utils.drawDisk();
                }
                else _StdOut.putText("The specified file was not found.");
            }
        }
    }
}
