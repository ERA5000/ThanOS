var TSOS;
(function (TSOS) {
    class Scheduler {
        constructor() {
            /* Between the commands load, run, runall, kill, and killall, this is the continuity of a program:
                load -> Resident Q
                run -> splices from Resident Q, places onto Ready Q
                runall -> splices from Resident Q, places onto Ready Q
                kill -> splices from Ready Q
                killall -> splices from Ready Q
        
                If at any point this traversal pattern is infringed, everything breaks. Also, apparently 'slice' and 'splice' are valid Array methods...
                    A typo lost me a good hour, so just to be clear, we want *splice* (with a p).
            */
            this.cycle = 1;
            this.pointer = 0;
        }
        schedulerInterrupt(scheduleType) {
            switch (scheduleType) {
                case "RoundRobin":
                    this.RoundRobin();
                    break;
                default:
                    _Kernel.krnTrapError("Invalid Scheduling Scheme. Terminating Execution.");
            }
        }
        PCBSwap() {
            this.pointer++;
            /*if(_CurrentPCB == null) {
                _CurrentPCB = _ReadyPCB[this.pointer];
                return;
            }*/
            _Dispatcher.snapshot(_CurrentPCB);
            if (_CurrentPCB.state == "Running")
                _CurrentPCB.state = "Ready";
            TSOS.Utils.updatePCBRow(_CurrentPCB);
            if (this.pointer >= _ReadyPCB.length) {
                this.pointer = 0;
            }
            _CurrentPCB = _ReadyPCB[this.pointer];
            _Dispatcher.reinstate(_CurrentPCB);
            _CurrentPCB.state = "Running";
            TSOS.Utils.updatePCBRow(_CurrentPCB);
            this.cycle = 1;
        }
        /*The Round Robin scheduling scheme. If either the cycle limit is exceeded, a process ends, and as long as there is at least a program
            to execute, create a software interrupt to switch to another program.
        I then explicitly check for Termination because if a program ends, the pointer has to be back-peddled one because the array itself changes size.

        UPDATE: 10.17.19
        TL;DR - Fixed a bug: Context switches won't happen if only one process is left.

        I (hopefully) fixed a ratched bug that was creating a nightmare for me.
            I initially failed to realize that, when there is a single program left, it still does a context switch -- which is bad. And wrong.
            So, I implemented code here and in CPU (hasProccessEnded boolean) to check for if a single program was left, so it would not do that.
            Apparently, my first attempt, a boolean I aptly named 'finished' (replaced by hasProcessEnded, check older commits)
                worked by *coincidence* because it was a global variable! I won't get into the whole 'how it was a coincidence' thing, but it happened to work (boo globals).

            So, to remedy all of these issues, here is what the code below does:
                if there is only one thing left to run AND if the process has not been updated to the next one, update it. <-- This is what I forgot to do.
                    otherwise (or now), execute the final process. <-- I wrote code that was only doing this, so it would crash from the discrepancy.
                if a program either terminates, or uses all of its cycles and there is something to switch to, context switch to it.

            But now your probably wondering, if there is only one thing in the queue, what are you switching to? What discrepancy?
            Well, here is the quirk of my code, I suppose: _CurrentPCB and its equivalent in ReadyPCB[] are different instances.
                The ReadyPCB[] is what can be executed upon, while _CurrentPCB is what the CPU is literally handling in the moment.
            When a program ends, I remove it from the ReadyPCB[], but _CurrentPCB does not get updated since I wanted to leave it to the scheduler to do that.
                (Because if I could assign _CurrentPCB at-will, what's the point of the scheduler? :P).
            This (complicated) solution brings me to the code I have. I will hopefully return to clean it since it may be redundant and not optimized, but it works... for now
        */
        RoundRobin() {
            let interrupt = new TSOS.Interrupt(SOFTWARE_IRQ, [0]);
            if (_ReadyPCB.length == 1) {
                this.pointer = 0;
                if (_CurrentPCB.pid != _ReadyPCB[this.pointer].pid) {
                    _Kernel.krnTrace("Context Switch via Round Robin");
                    _KernelInterruptQueue.enqueue(interrupt);
                }
                else {
                    this.cycle++;
                    return;
                }
            }
            if ((_CurrentPCB.state == "Terminated" || this.cycle > _Quantum) && _ReadyPCB.length > 0) {
                if (_CurrentPCB.state == "Terminated")
                    this.pointer--;
                if (_ReadyPCB.length > 1)
                    _Kernel.krnTrace("Context Switch via Round Robin");
                _KernelInterruptQueue.enqueue(interrupt);
            }
            else {
                if (_ReadyPCB.length == 0) {
                    _CPU.hasExecutionStarted = false;
                    _CPU.isExecuting = false;
                    this.cycle = 1;
                    return;
                }
                else
                    this.cycle++;
            }
        }
    }
    TSOS.Scheduler = Scheduler;
})(TSOS || (TSOS = {}));
/* Test programs of length 12 each.
A9 00 A9 02 A9 04 A9 06 A9 08 A9 10 A9 12 A9 14 A9 16 A9 18 A9 20 A9 22 A9 24

A9 01 A9 03 A9 05 A9 07 A9 09 A9 11 A9 13 A9 15 A9 17 A9 19 A9 21 A9 23 A9 25
*/ 
//# sourceMappingURL=scheduler.js.map