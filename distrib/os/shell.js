/* ------------
   Shell.ts

   The OS Shell - The "command line interface" (CLI) for the console.

    Note: While fun and learning are the primary goals of all enrichment center activities,
          serious injuries may occur when trying to write your own Operating System.
   ------------ */
// TODO: Write a base class / prototype for system services and let Shell inherit from it.
var TSOS;
(function (TSOS) {
    class Shell {
        constructor() {
            // Properties
            this.promptStr = ">";
            this.commandList = [];
            this.curses = "[fuvg],[cvff],[shpx],[phag],[pbpxfhpxre],[zbgureshpxre],[gvgf]";
            this.apologies = "[sorry]";
            this.status = "";
        }
        init() {
            var sc;
            //
            // Load the command list.
            // The list is alphabetized for a. the user, b. the programmer, and c. Tab indexing
            // cls
            sc = new TSOS.ShellCommand(this.shellCls, "cls", "- Clears the screen and resets the cursor position.");
            this.commandList[this.commandList.length] = sc;
            // clearMem
            sc = new TSOS.ShellCommand(this.shellClearMem, "clearmem", "- Clears all of memory.");
            this.commandList[this.commandList.length] = sc;
            //crash
            sc = new TSOS.ShellCommand(this.shellBSOD, "crash", " - Crashes the system.");
            this.commandList[this.commandList.length] = sc;
            //date
            sc = new TSOS.ShellCommand(this.shellDate, "date", "- Displays the current date and time.");
            this.commandList[this.commandList.length] = sc;
            // help
            sc = new TSOS.ShellCommand(this.shellHelp, "help", "- Displays the list of available commands.");
            this.commandList[this.commandList.length] = sc;
            // kill
            sc = new TSOS.ShellCommand(this.shellKill, "kill", "<pid> - Kills the specified process.");
            this.commandList[this.commandList.length] = sc;
            // killall
            sc = new TSOS.ShellCommand(this.shellKillAll, "killall", "- Kills all programs.");
            this.commandList[this.commandList.length] = sc;
            //load
            sc = new TSOS.ShellCommand(this.shellLoad, "load", "- Loads user program into memory for execution.");
            this.commandList[this.commandList.length] = sc;
            // man <topic>
            sc = new TSOS.ShellCommand(this.shellMan, "man", "<topic> - Displays the MANual page for <topic>.");
            this.commandList[this.commandList.length] = sc;
            // prompt <string>
            sc = new TSOS.ShellCommand(this.shellPrompt, "prompt", "<string> - Sets the prompt.");
            this.commandList[this.commandList.length] = sc;
            // ps
            sc = new TSOS.ShellCommand(this.shellPS, "ps", "- Lists the PID and State of all available processes.");
            this.commandList[this.commandList.length] = sc;
            // quantum <number>
            sc = new TSOS.ShellCommand(this.shellQuantum, "quantum", "<flag> or <integer> - Set the quantum for RR scheduling.");
            this.commandList[this.commandList.length] = sc;
            // rot13 <string>
            sc = new TSOS.ShellCommand(this.shellRot13, "rot13", "<string> - Does rot13 obfuscation on <string>.");
            this.commandList[this.commandList.length] = sc;
            // run <pid>
            sc = new TSOS.ShellCommand(this.shellRun, "run", "<pid> - Executes a program in memory.");
            this.commandList[this.commandList.length] = sc;
            // runall
            sc = new TSOS.ShellCommand(this.shellRunAll, "runall", "- Runs all programs in memory.");
            this.commandList[this.commandList.length] = sc;
            // shutdown
            sc = new TSOS.ShellCommand(this.shellShutdown, "shutdown", "- Shuts down the virtual OS but leaves the underlying host / hardware simulation running.");
            this.commandList[this.commandList.length] = sc;
            //snap
            sc = new TSOS.ShellCommand(this.shellSnap, "snap", "- Reality is often disappointing. That is, it was.");
            this.commandList[this.commandList.length] = sc;
            //status
            sc = new TSOS.ShellCommand(this.shellStatus, "status", " - Sets a new status.");
            this.commandList[this.commandList.length] = sc;
            // trace <on | off>
            sc = new TSOS.ShellCommand(this.shellTrace, "trace", "<on | off> - Turns the OS trace on or off.");
            this.commandList[this.commandList.length] = sc;
            // ver
            sc = new TSOS.ShellCommand(this.shellVer, "ver", "- Displays the current version of the OS.");
            this.commandList[this.commandList.length] = sc;
            //whereami
            sc = new TSOS.ShellCommand(this.shellWhereAmI, "whereami", "- Let me guess, your home?");
            this.commandList[this.commandList.length] = sc;
            // ps  - list the running processes and their IDs
            // kill <id> - kills the specified process id.
            // Display the initial prompt.
            this.putPrompt();
        }
        printStatus() {
            return "Status: " + this.status;
        }
        putPrompt() {
            _StdOut.putText(this.promptStr);
        }
        handleInput(buffer) {
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
            var index = 0;
            var found = false;
            var fn = undefined;
            while (!found && index < this.commandList.length) {
                if (this.commandList[index].command === cmd) {
                    found = true;
                    fn = this.commandList[index].func;
                }
                else {
                    ++index;
                }
            }
            if (found) {
                this.execute(fn, args); // Note that args is always supplied, though it might be empty.
            }
            else {
                // It's not found, so check for curses and apologies before declaring the command invalid.
                if (this.curses.indexOf("[" + TSOS.Utils.rot13(cmd) + "]") >= 0) { // Check for curses.
                    this.execute(this.shellCurse);
                }
                else if (this.apologies.indexOf("[" + cmd + "]") >= 0) { // Check for apologies.
                    this.execute(this.shellApology);
                }
                else { // It's just a bad command. {
                    this.execute(this.shellInvalidCommand);
                }
            }
        }
        // Note: args is an optional parameter, ergo the ? which allows TypeScript to understand that.
        execute(fn, args) {
            // We just got a command, so advance the line...
            _StdOut.advanceLine();
            // ... call the command function passing in the args ...
            fn(args);
            // Check to see if we need to advance the line again
            if (_StdOut.currentXPosition > 0) {
                _StdOut.advanceLine();
            }
            // ... and finally write the prompt again if the shell has not crashed.
            if (_HasCrashed)
                return;
            this.putPrompt();
        }
        parseInput(buffer) {
            var retVal = new TSOS.UserCommand();
            // 1. Remove leading and trailing spaces.
            buffer = TSOS.Utils.trim(buffer);
            //2. Split up the input by spaces
            var tempList = buffer.split(" ");
            //2.1 Lowercase the command as an added measure
            tempList[0] = tempList[0].toLowerCase();
            //2.2 If the command is status, make an exception so the status itself can contain caps
            if (tempList[0] === "status") {
                retVal.command = TSOS.Utils.trim(tempList.shift()).toLowerCase();
            }
            else {
                // 3. Separate on spaces so we can determine the command and command-line args, if any.
                // 4. Take the first (zeroth) element and use that as the command.
                var cmd = tempList.shift(); // Yes, you can do that to an array in JavaScript. See the Queue class.
                // 4.1 Remove any left-over spaces.
                cmd = TSOS.Utils.trim(cmd);
                // 4.2 Record it in the return value.
                retVal.command = cmd;
            }
            // 5. Make another exception for the Status command so it can contain spaces
            if (retVal.command === "status") {
                retVal.args[0] = buffer.substr(7, buffer.length);
            }
            // 6. Now create the args array from what's left.
            else {
                for (var i in tempList) {
                    var arg = TSOS.Utils.trim(tempList[i]);
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
        shellInvalidCommand() {
            _StdOut.putText("Invalid Command. ");
            if (_SarcasticMode) {
                _StdOut.putText("Unbelievable. You, [subject name here],");
                _StdOut.advanceLine();
                _StdOut.putText("must be the pride of [subject hometown here].");
            }
            else {
                _StdOut.putText("Type 'help' for a list of commands.");
            }
        }
        shellCurse() {
            _StdOut.putText("Oh, so that's how it's going to be, eh? Fine.");
            _StdOut.advanceLine();
            _StdOut.putText("Bitch.");
            _SarcasticMode = true;
        }
        shellApology() {
            if (_SarcasticMode) {
                _StdOut.putText("I think we can put our differences behind us.");
                _StdOut.advanceLine();
                _StdOut.putText("For science . . . You monster.");
                _SarcasticMode = false;
            }
            else {
                _StdOut.putText("For what?");
            }
        }
        // Although args is unused in some of these functions, it is always provided in the 
        // actual parameter list when this function is called, so I feel like we need it.
        shellVer(args) {
            _StdOut.putText(APP_NAME + " v" + APP_VERSION);
        }
        shellHelp(args) {
            _StdOut.putText("Commands:");
            for (var i in _OsShell.commandList) {
                _StdOut.advanceLine();
                _StdOut.putText("  " + _OsShell.commandList[i].command + " " + _OsShell.commandList[i].description);
            }
        }
        shellShutdown(args) {
            _StdOut.putText("Shutting down...");
            // Call Kernel shutdown routine.
            _Kernel.krnShutdown();
        }
        shellCls(args) {
            _StdOut.clearScreen();
            _StdOut.resetXY();
        }
        shellMan(args) {
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
                    case "quantum":
                        _StdOut.putText("Specifies how many cycles a program receives in the Round Robin Scheduling scheme."
                            + " Usable Flags: 'v' and 'd'. v: Display current value. d: Reset to default (6).");
                        break;
                    case "clearmem":
                        _StdOut.putText("Clears all of memory, resetting all values to 0.");
                        break;
                    case "runall":
                        _StdOut.putText("Runs all programs in memory.");
                        break;
                    case "ps":
                        _StdOut.putText("Lists the state and PID of all available processes. Only processes listed as 'Ready' or 'Resident'" +
                            " are considered available.");
                    case "kill":
                        _StdOut.putText("Terminates execution of the specified program. Only processes listed as 'Ready' or 'Running'" +
                            " can be terminated.");
                        break;
                    case "killall":
                        _StdOut.putText("Terminates execution of all programs. Only processes listed as 'Ready' or 'Running' can be terminated.");
                        break;
                    default:
                        _StdOut.putText("No manual entry for " + args[0] + ".");
                }
            }
            else {
                _StdOut.putText("Usage: man <topic>. Please supply a topic.");
            }
        }
        shellTrace(args) {
            if (args.length > 0) {
                var setting = args[0];
                switch (setting) {
                    case "on":
                        if (_Trace && _SarcasticMode) {
                            _StdOut.putText("Trace is already on, doofus.");
                        }
                        else {
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
            }
            else {
                _StdOut.putText("Usage: trace <on | off>");
            }
        }
        shellRot13(args) {
            if (args.length > 0) {
                // Requires Utils.ts for rot13() function.
                _StdOut.putText(args.join(' ') + " = '" + TSOS.Utils.rot13(args.join(' ')) + "'");
            }
            else {
                _StdOut.putText("Usage: rot13 <string>. Please supply a string.");
            }
        }
        shellPrompt(args) {
            if (args.length > 0) {
                _OsShell.promptStr = args[0];
            }
            else {
                _StdOut.putText("Usage: prompt <string>. Please supply a string.");
            }
        }
        shellDate(args) {
            //_StdOut.putText("Going on half past a quarter of.");
            let temp = new Date();
            _StdOut.putText(temp.getTime() + " aka " + temp.toLocaleDateString("en-US"));
        }
        shellWhereAmI(args) {
            _StdOut.putText("It was. And it was beautiful. Titan was like most planets: too many mouths, not enough to go around.");
        }
        shellSnap(args) {
            //Requires Utils.snap() for optimal functionality
            if (!document.getElementById("video")) {
                _StdOut.putText("I am ... inevitable.");
            }
            else {
                _StdOut.putText("Universe ending. Please hold...");
                TSOS.Utils.snap();
            }
        }
        //I limited the length of the status message just as a way to try and inhibit weird behaviors.
        shellStatus(args) {
            if (args.length > 0) {
                status = args[0];
                if (status.length > 100) {
                    _StdOut.putText("Status messages cannot be longer than 100 chars.");
                    return;
                }
                _StdOut.putText("New status: " + status);
                document.getElementById("status").innerHTML = "Status: " + status;
            }
            else {
                _StdOut.putText("Usage: status: <string>. Please supply a string.");
            }
        }
        //The command is crash because it is more intuitive for an end-user, but is interally referenced as BSOD for the assignment
        shellBSOD(args) {
            TSOS.Utils.crash();
        }
        //Loads a program into memory for execution
        shellLoad(args) {
            if (TSOS.Utils.verifyInput()) {
                let availableMemory = _MemoryManager.getMemoryStatus();
                if (!availableMemory) {
                    _Kernel.krnTrapError("Segmentation Fault. No available memory.");
                    _HasCrashed = true;
                }
                else {
                    //let overritten = false;
                    let pcb = new TSOS.ProcessControlBlock(_MemoryManager.getAvailableSegmentByID());
                    _MemoryManager.setMemoryStatus(pcb.segment);
                    if (pcb.segment > 2) {
                        _StdOut.putText("Segmentation Fault. Only memory is available for iProject3. Execution has stopped.");
                        _Kernel.krnTrapError("Segmentation Fault. No more available memory.");
                        _CPU.isExecuting = false;
                        TSOS.Utils.disableSS();
                        _HasCrashed = true;
                        return;
                    }
                    pcb.location = "Memory";
                    _MemoryAccessor.write(pcb.segment, TSOS.Utils.standardizeInput());
                    //This is now broken and will not be fixed until the continuity for load/run/runall/kill/killall works flawlessly*
                    /*Make an attempt to clean old/unused PCBs
                    if(_ResidentPCB.length > 0) {
                        for(let i = 0; i < _ResidentPCB.length; i++){
                            console.log("What is the state? " + _ResidentPCB[i].state);
                            if(_ResidentPCB[i].state == "Terminated"){ //Might be able to overrite 'Ready' programs too -- check back later.
                                _ResidentPCB[i].state = "Overwritten";
                                Utils.updatePCBRow(_ResidentPCB[i]);
                                _ResidentPCB[i] = pcb;
                                _ReadyPCB.slice(i, 1);
                                overritten = true;
                                break;
                            }
                        }
                    }
                    if(!overritten) _ResidentPCB[_ResidentPCB.length] = pcb;*/
                    _ResidentPCB[_ResidentPCB.length] = pcb;
                    _StdOut.putText(`Program successfully loaded! PID ${pcb.pid}`);
                    TSOS.Utils.drawMemory();
                    TSOS.Utils.addPCBRow(pcb);
                    TSOS.Utils.updatePCBRow(pcb);
                }
            }
        }
        //Runs a program stored in memory when given a corresponding PID
        shellRun(args) {
            if (args.length > 0) {
                for (let i = 0; i < _ResidentPCB.length; i++) {
                    if (parseInt(args[0]) == _ResidentPCB[i].pid) {
                        let temp = _ResidentPCB[i];
                        if (temp.state === "Terminated")
                            _StdOut.putText("Execution of that program has since completed.");
                        else if (temp.state === "Running")
                            _StdOut.putText("The specified program is currently running.");
                        else {
                            //If the CPU is not executing AND Single Step is NOT enabled, then it is okay to brute-force a start of execution
                            if (!_CPU.isExecuting && !_CPU.hasExecutionStarted) {
                                _CPU.init();
                                _CurrentPCB = null;
                                _CPU.isExecuting = true;
                            }
                            //If Single Step is enabled, make sure to update the new program's state and display immediately
                            if (_CPU.hasExecutionStarted) {
                                temp.state = "Ready";
                                TSOS.Utils.updatePCBRow(temp);
                            }
                            _ReadyPCB[_ReadyPCB.length] = temp;
                            _ResidentPCB.splice(_ResidentPCB.indexOf(temp), 1);
                            if (_CurrentPCB == null)
                                _CurrentPCB = temp;
                            _StdOut.putText(`Execution of Program ${temp.pid} has begun.`);
                        }
                        return;
                    }
                }
                if (parseInt(args[0]) < 0) {
                    _StdOut.putText("It is not possible to have negative PIDs. Shutting down for OS' safety.");
                    _HasCrashed = true;
                }
                else
                    _StdOut.putText(`No Program with PID ${args[0]} exists.`);
            }
            else
                _StdOut.putText("Usage: run <pid>. Specify a program by its PID.");
        }
        //Specifies a quantum for the Round Robin Scheduling scheme
        shellQuantum(args) {
            let valid = /^[0-9.]+$/gm;
            if (args.length > 0) {
                if (args[0] == 'd') {
                    _StdOut.putText("The quantum has been reset to its default value of 6.");
                    _Quantum = 6;
                    return;
                }
                else if (args[0] == 'v') {
                    _StdOut.putText(`The current quantum is ${_Quantum}.`);
                    return;
                }
                else if (!valid.test(args[0])) {
                    _StdOut.putText("Invalid argument. Quanta can only be integers.");
                    return;
                }
                else if (parseFloat(args[0]) % 1 != 0)
                    _StdOut.putText("Input has been rounded. The new quantum is " + Math.round(parseFloat(args[0])) + ".");
                else
                    _StdOut.putText("The new quantum is " + Math.round(parseInt(args[0])));
                _Quantum = Math.round(parseFloat(args[0]));
            }
            else
                _StdOut.putText("Usage: quantum <flag> or <integer>. Specify an appropriate quantum.");
        }
        //Clears all memory regardless of the state of the OS
        shellClearMem(args) {
            //Possible use-cases
            //1. Program(s) are currently running
            //2. Nothing is running but memory is occupied
            //a. Single step mode is active
            //3. Memory is empty
            if (_CPU.isExecuting)
                _CPU.isExecuting = false;
            for (let i = 0; i < _ReadyPCB.length; i++) {
                let temp = _ReadyPCB[i];
                temp.state = "Terminated";
                TSOS.Utils.updatePCBRow(temp);
            }
            _MemoryManager.setAvailableSegmentByID();
            _MemoryManager.allAvailable();
            TSOS.Utils.drawMemory();
            _ReadyPCB = [];
            _CPU.init();
            TSOS.Utils.updateCPUDisplay();
            _StdOut.putText("Memory successfully cleared.");
        }
        /*Runs all programs sitting in the Resident Queue. The Scheduler (is supposed to) ensure(s) that any new programs will be executed if added after
            this command is run.
        */
        shellRunAll() {
            if (_ResidentPCB.length == 0) {
                _StdOut.putText("There are currently no processes to run.");
                return;
            }
            else {
                if (_ReadyPCB.length === 3) {
                    _StdOut.putText("Everything is already running.");
                    return;
                }
                /*So this gave me a headache and a half...
                  The Resident and Ready Queues are mutually exclusive. So, when I move it to Ready, I remove it from Resident.
                  Since this **changes the size of the array,** the for loop always ended early.
                  Because I need to remove it, I use this as the for loop counter, which is why i itself does not actually change.
                */
                for (let i = 0; i < _ResidentPCB.length; i += 0) {
                    _ResidentPCB[i].state = "Ready";
                    TSOS.Utils.updatePCBRow(_ResidentPCB[i]);
                    _ReadyPCB[_ReadyPCB.length] = _ResidentPCB[i];
                    _ResidentPCB.splice(i, 1);
                }
                if (_CPU.isExecuting)
                    _StdOut.putText("New programs have been added to the schedule.");
                else {
                    _CPU.init();
                    _CurrentPCB = _ReadyPCB[0];
                    _CPU.isExecuting = true;
                    _StdOut.putText("Now executing all programs in memory.");
                }
            }
        }
        shellPS() {
            if (_ResidentPCB.length == 0) {
                _StdOut.putText("There are currently no processes to list.");
                return;
            }
            else {
                _StdOut.putText("List of current processes:");
                _StdOut.advanceLine();
                for (let i = 0; i < _ResidentPCB.length; i++) {
                    _StdOut.putText(`PID: ${_ResidentPCB[i].pid} | State: ${_ResidentPCB[i].state}`);
                    _StdOut.advanceLine();
                }
                _StdOut.putText("**************************");
            }
        }
        shellKill(args) {
            if (_ReadyPCB.length == 0) {
                _StdOut.putText("There are currently no processes to kill.");
                return;
            }
            else {
                let found = false;
                for (let i = 0; i < _ReadyPCB.length; i++) {
                    if (_ReadyPCB[i].pid == parseInt(args[0])) {
                        found = true;
                        _StdOut.putText(`Found process with PID ${_ReadyPCB[i].pid}.`);
                        _ReadyPCB[i].state = "Terminated";
                        TSOS.Utils.updatePCBRow(_ReadyPCB[i]);
                        _StdOut.advanceLine();
                        _StdOut.putText(`Process with PID ${_ReadyPCB[i].pid} has been killed.`);
                        _MemoryManager.setSegmentTrue(_ReadyPCB[i].segment);
                        _ReadyPCB.splice(i, 1);
                        if (_ReadyPCB.length == 0)
                            _CPU.isExecuting = false;
                        else {
                            let interrupt = new TSOS.Interrupt(SOFTWARE_IRQ, [0]);
                            _KernelInterruptQueue.enqueue(interrupt);
                        }
                        break;
                    }
                }
                if (!found)
                    _StdOut.putText(`There are no known processes with PID ${args[0]}.`);
            }
        }
        shellKillAll() {
            if (_ReadyPCB.length == 0) {
                _StdOut.putText("There are currently no programs running to terminate.");
                return;
            }
            else {
                _StdOut.putText("Executing Order 66...");
                _StdOut.advanceLine();
                for (let i = 0; i < _ReadyPCB.length; i++) {
                    _ReadyPCB[i].state = "Terminated";
                    TSOS.Utils.updatePCBRow(_ReadyPCB[i]);
                    _MemoryManager.setSegmentTrue(_ReadyPCB[i].segment);
                    _MemoryManager.setAvailableSegmentByID(_ReadyPCB[i].segment);
                }
                _CPU.isExecuting = false;
                _CPU.init();
                TSOS.Utils.updateCPUDisplay();
                TSOS.Utils.resetCPUIR();
                TSOS.Utils.drawMemory();
                _ReadyPCB = [];
                _StdOut.putText("All of the programs have been terminated.");
            }
        }
    }
    TSOS.Shell = Shell;
})(TSOS || (TSOS = {}));
//# sourceMappingURL=shell.js.map