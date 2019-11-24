/* ------------
     Kernel.ts

     Routines for the Operating System, NOT the host.

     This code references page numbers in the text book:
     Operating System Concepts 8th edition by Silberschatz, Galvin, and Gagne.  ISBN 978-0-470-12872-5
     ------------ */
var TSOS;
(function (TSOS) {
    class Kernel {
        //
        // OS Startup and Shutdown Routines
        //
        krnBootstrap() {
            TSOS.Control.hostLog("bootstrap", "host"); // Use hostLog because we ALWAYS want this, even if _Trace is off.
            // Initialize our global queues.
            _KernelInterruptQueue = new TSOS.Queue(); // A (currently) non-priority queue for interrupt requests (IRQs).
            _KernelBuffers = new Array(); // Buffers... for the kernel.
            _KernelInputQueue = new TSOS.Queue(); // Where device input lands before being processed out somewhere.
            // Initialize the console.
            _Console = new TSOS.Console(); // The command line interface / console I/O device.
            _Console.init();
            // Initialize standard input and output to the _Console.
            _StdIn = _Console;
            _StdOut = _Console;
            // Load the Keyboard Device Driver
            this.krnTrace("Loading the keyboard device driver.");
            _krnKeyboardDriver = new TSOS.DeviceDriverKeyboard(); // Construct it.
            _krnKeyboardDriver.driverEntry(); // Call the driverEntry() initialization routine.
            this.krnTrace(_krnKeyboardDriver.status);
            //
            // ... more?
            //
            // Enable the OS Interrupts.  (Not the CPU clock interrupt, as that is done in the hardware sim.)
            this.krnTrace("Enabling the interrupts.");
            this.krnEnableInterrupts();
            // Launch the shell.
            this.krnTrace("Creating and Launching the shell.");
            _OsShell = new TSOS.Shell();
            _OsShell.init();
            //Initializes the Memory Manager
            _MemoryManager = new TSOS.MemoryManager();
            //Initializes the Dispatcher
            _Dispatcher = new TSOS.Dispatcher();
            //Initializes the Disk and the Disk Driver
            _Disk = new TSOS.Disk(MAX_TRACKS, MAX_SECTORS, MAX_BLOCKS, MAX_BLOCK_SIZE, false, window.sessionStorage);
            _DiskDriver = new TSOS.FileSystemDeviceDriver(_Disk);
            //Sets the schedule to the default of Round Robin
            _CurrentSchedule = SCHEDULE_DEFAULT;
            // Finally, initiate student testing protocol.
            if (_GLaDOS) {
                _GLaDOS.afterStartup();
            }
            _Mode = 1;
        }
        krnShutdown() {
            this.krnTrace("begin shutdown OS");
            // TODO: Check for running processes.  If there are some, alert and stop. Else...
            // ... Disable the Interrupts.
            this.krnTrace("Disabling the interrupts.");
            this.krnDisableInterrupts();
            this.krnTrace("Terminating CPU execution.");
            _CPU.isExecuting = false;
            _CPU.hasExecutionStarted = false;
            //
            // Unload the Device Drivers?
            // More?
            //
            this.krnTrace("end shutdown OS");
        }
        krnOnCPUClockPulse() {
            /* This gets called from the host hardware simulation every time there is a hardware clock pulse.
               This is NOT the same as a TIMER, which causes an interrupt and is handled like other interrupts.
               This, on the other hand, is the clock pulse from the hardware / VM / host that tells the kernel
               that it has to look for interrupts and process them if it finds any.
            */
            // Check for an interrupt, if there are any. Page 560
            if (_KernelInterruptQueue.getSize() > 0) {
                // Process the first interrupt on the interrupt queue.
                // TODO (maybe): Implement a priority queue based on the IRQ number/id to enforce interrupt priority.
                var interrupt = _KernelInterruptQueue.dequeue();
                // Mode bit is now toggled for software interrupts (context switches) and the system call functionality
                if (interrupt.irq == 2 || interrupt.irq == 3)
                    _Mode = 0;
                this.krnInterruptHandler(interrupt.irq, interrupt.params);
            }
            else if (_CPU.isExecuting) { // If there are no interrupts then run one CPU cycle if there is anything being processed.
                _CPU.cycle();
                TSOS.Utils.updateGUI(_CurrentPCB, _CPU.dataAmount); // Moved all graphical updates to here from CPU
                _Scheduler.schedulerInterrupt(_CurrentSchedule);
            }
            else { // If there are no interrupts and there is nothing being executed then just be idle.
                this.krnTrace("Idle");
            }
        }
        //
        // Interrupt Handling
        //
        krnEnableInterrupts() {
            // Keyboard
            TSOS.Devices.hostEnableKeyboardInterrupt();
            // Put more here.
        }
        krnDisableInterrupts() {
            // Keyboard
            TSOS.Devices.hostDisableKeyboardInterrupt();
            // Put more here.
        }
        krnInterruptHandler(irq, params) {
            // This is the Interrupt Handler Routine.  See pages 8 and 560.
            // Trace our entrance here so we can compute Interrupt Latency by analyzing the log file later on. Page 766.
            this.krnTrace("Handling IRQ~" + irq);
            // Invoke the requested Interrupt Service Routine via Switch/Case rather than an Interrupt Vector.
            // TODO: Consider using an Interrupt Vector in the future.
            // Note: There is no need to "dismiss" or acknowledge the interrupts in our design here.
            //       Maybe the hardware simulation will grow to support/require that in the future.
            switch (irq) {
                case TIMER_IRQ:
                    this.krnTimerISR(); // Kernel built-in routine for timers (not the clock).
                    break;
                case KEYBOARD_IRQ:
                    _krnKeyboardDriver.isr(params); // Kernel mode device driver
                    _StdIn.handleInput();
                    break;
                case SOFTWARE_IRQ:
                    if (_Mode == 0) {
                        _Scheduler.PCBSwap(_CurrentSchedule);
                        _Mode = 1;
                    }
                    else
                        this.krnTrace("Insufficient Privilege. Unable to context switch.");
                    break;
                case SYSTEM_CALL:
                    if (_Mode == 0) {
                        this.systemCall();
                        _Mode = 1;
                    }
                    else
                        this.krnTrace("Insufficient Privilege. Unable to make system call.");
                    break;
                default:
                    this.krnTrapError("Invalid Interrupt Request. irq=" + irq + " params=[" + params + "]");
            }
        }
        krnTimerISR() {
            // The built-in TIMER (not clock) Interrupt Service Routine (as opposed to an ISR coming from a device driver). {
            // Check multiprogramming parameters and enforce quanta here. Call the scheduler / context switch here if necessary.
            // Or do it elsewhere in the Kernel. We don't really need this.
        }
        //
        // System Calls... that generate software interrupts via tha Application Programming Interface library routines.
        //
        // Some ideas:
        // - ReadConsole
        // - WriteConsole
        // - CreateProcess
        // - ExitProcess
        // - WaitForProcessToExit
        // - CreateFile
        // - OpenFile
        // - ReadFile
        // - WriteFile
        // - CloseFile
        //
        // OS Utility Routines
        //
        krnTrace(msg) {
            // If the crash command has been issued, stop outputting anything to the Host Log
            if (_HasCrashed)
                return;
            // Check globals to see if trace is set ON.  If so, then (maybe) log the message.
            if (_Trace) {
                if (msg === "Idle") {
                    // We can't log every idle clock pulse because it would quickly lag the browser quickly.
                    if (_OSclock % 10 == 0) {
                        // Check the CPU_CLOCK_INTERVAL in globals.ts for an
                        // idea of the tick rate and adjust this line accordingly.
                        TSOS.Control.hostLog(msg, "OS");
                    }
                }
                else {
                    TSOS.Control.hostLog(msg, "OS");
                }
            }
        }
        krnTrapError(msg) {
            TSOS.Control.hostLog("OS ERROR - TRAP: " + msg);
            // TODO: Display error on console, perhaps in some sort of colored screen. (Maybe blue?)
            this.krnShutdown();
        }
        /*Prints the Y register if X is 1.
          Dumps the Y register's address' values until it encounters either 00 or the end of memory if X is 2.
          The toPrint variable has spaces because A) it makes it easier to read, but also B) it does not print properly if all of memory
            is one contiguous string (which is something I will look into later)*.
            *This may or may not be true because results have been inconsistent (ie the Heisenbug) -- will still look into later.
        */
        systemCall() {
            _Kernel.krnTrace("System Call");
            if (_CPU.Xreg == 1) {
                _StdOut.putText(_CPU.Yreg.toString(16));
                _StdOut.advanceLine();
                _StdOut.putText(_OsShell.promptStr);
            }
            else if (_CPU.Xreg == 2) {
                let toPrint = "";
                let temp = 0;
                let locationToStart = _CPU.Yreg;
                for (let i = locationToStart; i < 256; i++) {
                    temp = parseInt(_MemoryAccessor.read(_CurrentPCB.segment, i), 16);
                    if (temp >= 1 && temp <= 9) {
                        toPrint += temp;
                    }
                    else if (temp == 0)
                        break;
                    else {
                        toPrint += String.fromCharCode(temp);
                    }
                }
                _StdOut.putText(toPrint);
                _StdOut.advanceLine();
                _StdOut.putText(_OsShell.promptStr);
            }
            _CPU.PC++;
        }
    }
    TSOS.Kernel = Kernel;
})(TSOS || (TSOS = {}));
//# sourceMappingURL=kernel.js.map