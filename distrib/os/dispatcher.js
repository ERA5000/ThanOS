var TSOS;
(function (TSOS) {
    class Dispatcher {
        constructor() { }
        //Takes a 'snapshot' of the CPU's current execution context if (when) the currently running program needs to be paused
        snapshot(pcb) {
            pcb.PC = _CPU.PC;
            pcb.Acc = _CPU.Acc;
            pcb.Xreg = _CPU.Xreg;
            pcb.Yreg = _CPU.Yreg;
            pcb.Zflag = _CPU.Zflag;
        }
        //Reinstates the program context's values back onto the CPU if (when) execution continues
        reinstate(pcb) {
            _CPU.PC = pcb.PC;
            _CPU.Acc = pcb.Acc;
            _CPU.Xreg = pcb.Xreg;
            _CPU.Yreg = pcb.Yreg;
            _CPU.Zflag = pcb.Zflag;
        }
    }
    TSOS.Dispatcher = Dispatcher;
})(TSOS || (TSOS = {}));
//# sourceMappingURL=dispatcher.js.map