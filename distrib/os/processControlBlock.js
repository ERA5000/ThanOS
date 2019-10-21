var TSOS;
(function (TSOS) {
    class ProcessControlBlock {
        constructor(segment) {
            this.PC = 0;
            this.Acc = 0;
            this.Xreg = 0;
            this.Yreg = 0;
            this.Zflag = 0;
            this.pid = _PID;
            _PID++;
            this.state = "Resident";
            this.priority = 7;
            this.segment = segment;
            this.determineRange();
            this.turnaroundTime = 0;
            this.waitTime = 0;
        }
        //Given access to a physical segment, determines the base and limit registers of the PCB
        determineRange() {
            if (this.segment == 0) {
                this.base = 0;
                this.limit = 255;
            }
            else if (this.segment == 1) {
                this.base = 256;
                this.limit = 511;
            }
            else {
                this.base = 512;
                this.limit = 767;
            }
        }
    }
    TSOS.ProcessControlBlock = ProcessControlBlock;
})(TSOS || (TSOS = {}));
//# sourceMappingURL=processControlBlock.js.map