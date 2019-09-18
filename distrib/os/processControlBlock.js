var TSOS;
(function (TSOS) {
    class ProcessControlBlock {
        constructor() {
            this.PC = 0;
            this.Acc = 0;
            this.Xreg = 0;
            this.Yreg = 0;
            this.Zflag = 0;
            this.pid = _PID;
            _PID++;
            this.segment = _NextAvailSeg;
            _NextAvailSeg++;
        }
        //Takes a 'snapshot' of the CPU's current context if (when) execeution needs to be paused
        snapshot() {
            this.PC = _CPU.PC;
            this.Acc = _CPU.Acc;
            this.Xreg = _CPU.Xreg;
            this.Yreg = _CPU.Yreg;
            this.Zflag = _CPU.Zflag;
        }
    }
    TSOS.ProcessControlBlock = ProcessControlBlock;
})(TSOS || (TSOS = {}));
//# sourceMappingURL=processControlBlock.js.map