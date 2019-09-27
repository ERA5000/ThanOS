/* ------------
     CPU.ts

     Routines for the host CPU simulation, NOT for the OS itself.
     In this manner, it's A LITTLE BIT like a hypervisor,
     in that the Document environment inside a browser is the "bare metal" (so to speak) for which we write code
     that hosts our client OS. But that analogy only goes so far, and the lines are blurred, because we are using
     TypeScript/JavaScript in both the host and client environments.

     This code references page numbers in the text book:
     Operating System Concepts 8th edition by Silberschatz, Galvin, and Gagne.  ISBN 978-0-470-12872-5
     ------------ */

module TSOS {

    export class Cpu {

        constructor(public PC: number = 0,
                    public Acc: number = 0,
                    public Xreg: number = 0,
                    public Yreg: number = 0,
                    public Zflag: number = 0,
                    public isExecuting: boolean = false) {

        }

        public init(): void {
            this.PC = 0;
            this.Acc = 0;
            this.Xreg = 0;
            this.Yreg = 0;
            this.Zflag = 0;
            this.isExecuting = false;
        }

        public cycle(): void {
            _Kernel.krnTrace('CPU cycle');
            // TODO: Accumulate CPU usage and profiling statistics here.
            // Do the real work here. Be sure to set this.isExecuting appropriately.

            this.execute(_CurrentPCB);
        }

        public execute(pcb: ProcessControlBlock) {
            pcb.state = "Running";
            let command:string;
            if(this.PC >= 255) command = "00";
            else command = _MemoryAccessor.read(pcb.segment, this.PC);

            switch (command) {
                case "A9":
                    this.loadAccConst();
                    break;
                case "AD":
                    this.loadAccMem();
                    break;
                case "8D":
                    this.storeInMem();
                    break;
                case "6D":
                    this.addWCarry();
                    break;
                case "A2":
                    this.loadXConst();
                    break;
                case "AE":
                    this.loadXMem();
                    break;
                case "A0":
                    this.loadYConst();
                    break;
                case "AC":
                    this.loadYMem();
                    break;
                case "EA":
                    this.PC++;
                    break;
                case "00":
                    this.isExecuting = false;
                    pcb.state = "Complete";
                    break;
                case "EC":
                    this.compXMem();
                    break;
                case "D0":
                    this.branchOnZ();
                    break;
                case "EE":
                    this.incByte();
                    break;
                case "FF":
                    break;
                default:
                    _Kernel.krnTrapError("Invalid Op Code. Terminating execution.");
                    this.isExecuting = false;
                    pcb.state = "Error";
                    break;
            }
            console.log("What instruction did I just execute? " + command);
            Utils.updateCPUDisplay();
            pcb.snapshot();
            Utils.updatePCBRow(pcb);
            _Memory.drawMemory();
        }

        public loadAccConst() {
            this.Acc = parseInt(_MemoryAccessor.read(_CurrentPCB.segment, this.PC+1), 16);
            this.PC += 2;
        }

        public loadAccMem() {
            let locationOfValue = parseInt(_MemoryAccessor.read(_CurrentPCB.segment, this.PC+1), 16);
            this.Acc = parseInt(_MemoryAccessor.read(_CurrentPCB.segment, locationOfValue), 16);
            this.PC += 2;
        }

        public storeInMem() {
            let locationOfValue = parseInt(_MemoryAccessor.read(_CurrentPCB.segment, this.PC+1), 16);
            _MemoryAccessor.write(_CurrentPCB.segment, (this.Acc).toString(16).toUpperCase(), locationOfValue);
            this.PC += 2;
        }

        public addWCarry() {
            let locationOfValue = parseInt(_MemoryAccessor.read(_CurrentPCB.segment, this.PC+1), 16);
            let toAdd = parseInt(_MemoryAccessor.read(_CurrentPCB.segment, locationOfValue), 16);
            this.Acc += toAdd;
            if(this.Acc >= 256) this.Acc %= 256;
            this.PC += 2;

        }

        public loadXConst() {
            this.Xreg = parseInt(_MemoryAccessor.read(_CurrentPCB.segment, this.PC+1), 16);
            this.PC += 2;
        }

        public loadXMem() {
            let locationOfValue = parseInt(_MemoryAccessor.read(_CurrentPCB.segment, this.PC+1), 16);
            this.Xreg = parseInt(_MemoryAccessor.read(_CurrentPCB.segment, locationOfValue), 16);
            this.PC += 2;
        }

        public loadYConst() {
            this.Yreg = parseInt(_MemoryAccessor.read(_CurrentPCB.segment, this.PC+1), 16);
            this.PC += 2;
        }

        public loadYMem() {
            let locationOfValue = parseInt(_MemoryAccessor.read(_CurrentPCB.segment, this.PC+1), 16);
            this.Yreg = parseInt(_MemoryAccessor.read(_CurrentPCB.segment, locationOfValue), 16);
            this.PC += 2;
        }

        public compXMem() {
            let locationOfValue = parseInt(_MemoryAccessor.read(_CurrentPCB.segment, this.PC+1), 16);
            let toCompare = parseInt(_MemoryAccessor.read(_CurrentPCB.segment, locationOfValue), 16);
            if(this.Xreg == toCompare) this.Zflag = 1;
            else this.Zflag = 0;
            this.PC += 2;
        }

        public branchOnZ() {
            if(this.Zflag == 0) this.PC += parseInt(_MemoryAccessor.read(_CurrentPCB.segment, this.PC+1), 16);
            else this.PC += 2;
        }

        public incByte() {
            let locationOfValue = parseInt(_MemoryAccessor.read(_CurrentPCB.segment, this.PC+1), 16);
            let toIncrement = parseInt(_MemoryAccessor.read(_CurrentPCB.segment, locationOfValue), 16) + 1;
            _MemoryAccessor.write(_CurrentPCB.segment, toIncrement.toString(16).toUpperCase(), locationOfValue);
            this.PC += 2;
        }
    }
}
