var TSOS;
(function (TSOS) {
    class Scheduler {
        constructor() {
            this.cycle = 1;
            this.pointer = 0;
        }
        schedulerInterrupt(scheduleType) {
            switch (scheduleType) {
                case "RoundRobin":
                    let interrupt = new TSOS.Interrupt(SOFTWARE_IRQ, [0]);
                    if ((_CurrentPCB.state == "Terminated" || this.cycle > _Quantum) && _ReadyPCB.length > 0) {
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
                    break;
                default:
                    _Kernel.krnTrapError("Invalid Scheduling Scheme. Terminating Execution.");
            }
        }
        PCBSwap() {
            if (_CurrentPCB == null) {
                _CurrentPCB = _ReadyPCB[this.pointer];
                return;
            }
            _CurrentPCB.snapshot();
            if (_CurrentPCB.state == "Running")
                _CurrentPCB.state = "Ready";
            TSOS.Utils.updatePCBRow(_CurrentPCB);
            if (this.pointer >= _ReadyPCB.length) {
                this.pointer = 0;
            }
            _CurrentPCB = _ReadyPCB[this.pointer];
            _CurrentPCB.reinstate();
            _CurrentPCB.state = "Running";
            TSOS.Utils.updatePCBRow(_CurrentPCB);
            this.pointer++;
            this.cycle = 1;
        }
    }
    TSOS.Scheduler = Scheduler;
})(TSOS || (TSOS = {}));
/* Test programs of length 12 each.
A9 00 A9 02 A9 04 A9 06 A9 08 A9 10 A9 12 A9 14 A9 16 A9 18 A9 20 A9 22 A9 24

A9 01 A9 03 A9 05 A9 07 A9 09 A9 11 A9 13 A9 15 A9 17 A9 19 A9 21 A9 23 A9 25
*/ 
//# sourceMappingURL=scheduler.js.map