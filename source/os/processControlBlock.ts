module TSOS {

    export class ProcessControlBlock {

        PC: number;
        Acc: number;
        Xreg: number;
        Yreg: number;
        Zflag: number;
        pid: number;

        constructor(){
            this.PC = 0;
            this.Acc = 0;
            this.Xreg = 0;
            this.Yreg = 0;
            this.Zflag = 0;
            this.pid = _PID;
            _PID++;
        }
    }
}