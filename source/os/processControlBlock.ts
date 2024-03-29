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
        base: number;
        limit: number;
        turnaroundTime: number;
        waitTime: number;        

        constructor(segment: number){
            this.PC = 0;
            this.Acc = 0;
            this.Xreg = 0;
            this.Yreg = 0;
            this.Zflag = 0;
            this.pid = _PID;
            _PID++;
            this.state = "Resident";
            this.priority = 5;
            this.segment = segment;
            this.determineRange();
            this.turnaroundTime = 0;
            this.waitTime = 0;
        }

        //Given access to a physical segment, determines the base and limit registers of the PCB
        private determineRange(): void{
            if(this.segment == 0){
                this.base = 0;
                this.limit = 255;
            }
            else if(this.segment == 1){
                this.base = 256;
                this.limit = 511;
            }
            else {
                this.base = 512;
                this.limit = 767;
            }
        }
        
        //RIP segHash
    }
}