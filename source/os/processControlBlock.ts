module TSOS {

    export class ProcessControlBlock {

        PC: number;
        Acc: number;
        Xreg: number;
        Yreg: number;
        Zflag: number;
        pid: number;
        segment: number;
        priority: number;
        state: string;
        location: string;

        constructor(){
            this.PC = 0;
            this.Acc = 0;
            this.Xreg = 0;
            this.Yreg = 0;
            this.Zflag = 0;
            this.pid = _PID;
            _PID++;
            this.state = "Ready";
            this.priority = 7;
        }

        //Takes a 'snapshot' of the CPU's current execution context if (when) the currently running program needs to be paused
        public snapshot(): void{
            this.PC = _CPU.PC;
            this.Acc = _CPU.Acc;
            this.Xreg = _CPU.Xreg;
            this.Yreg = _CPU.Yreg;
            this.Zflag = _CPU.Zflag;
        }

        //Reinstates the program context's values back onto the CPU if (when) execution continues
        public reinstate(): void{ 
            _CPU.PC = this.PC;
            _CPU.Acc = this.Acc;
            _CPU.Xreg = this.Xreg;
            _CPU.Yreg = this.Yreg;
            _CPU.Zflag = this.Zflag;
        }
    }
}