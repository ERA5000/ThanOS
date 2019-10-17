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
        */
        RoundRobin() {
            let interrupt = new TSOS.Interrupt(SOFTWARE_IRQ, [0]);
            if ((_CurrentPCB.state == "Terminated" || this.cycle > _Quantum) && _ReadyPCB.length > 0) {
                if (_CurrentPCB.state == "Terminated")
                    this.pointer--;
                _KernelInterruptQueue.enqueue(interrupt);
            }
            else {
                if (_ReadyPCB.length == 0) {
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