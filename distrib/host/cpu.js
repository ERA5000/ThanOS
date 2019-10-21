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
var TSOS;
(function (TSOS) {
    class Cpu {
        constructor(PC = 0, Acc = 0, Xreg = 0, Yreg = 0, Zflag = 0, isExecuting = false, hasExecutionStarted = false, hasProgramEnded = false) {
            this.PC = PC;
            this.Acc = Acc;
            this.Xreg = Xreg;
            this.Yreg = Yreg;
            this.Zflag = Zflag;
            this.isExecuting = isExecuting;
            this.hasExecutionStarted = hasExecutionStarted;
            this.hasProgramEnded = hasProgramEnded;
        }
        init() {
            this.PC = 0;
            this.Acc = 0;
            this.Xreg = 0;
            this.Yreg = 0;
            this.Zflag = 0;
            this.isExecuting = false;
            this.hasExecutionStarted = false;
            this.hasProgramEnded = false;
        }
        cycle() {
            _Kernel.krnTrace('CPU cycle');
            // TODO: Accumulate CPU usage and profiling statistics here.
            // Do the real work here. Be sure to set this.isExecuting appropriately.
            this.execute(_CurrentPCB);
        }
        execute(pcb) {
            //console.log(`Process: ${pcb.pid}`);
            //console.log(`What is the wait time?  ${pcb.waitTime}`);
            //console.log(`What is the turnaround time?  ${pcb.turnaroundTimeCycles}`);
            //console.log();
            this.hasExecutionStarted = true;
            pcb.state = "Running";
            let command;
            let instrucAmount = 0;
            if (this.PC < 0 || this.PC >= 255) {
                command = "00";
            }
            else
                command = _MemoryAccessor.read(pcb.segment, this.PC);
            switch (command) {
                case "A9":
                    instrucAmount = 1;
                    this.loadAccConst();
                    break;
                case "AD": //Little Endian
                    instrucAmount = 2;
                    this.loadAccMem();
                    break;
                case "8D": //Little Endian
                    instrucAmount = 2;
                    this.storeInMem();
                    break;
                case "6D": //Little Endian
                    instrucAmount = 2;
                    this.addWCarry();
                    break;
                case "A2":
                    instrucAmount = 1;
                    this.loadXConst();
                    break;
                case "AE": //Little Endian
                    instrucAmount = 2;
                    this.loadXMem();
                    break;
                case "A0":
                    instrucAmount = 1;
                    this.loadYConst();
                    break;
                case "AC": //Little Endian
                    instrucAmount = 2;
                    this.loadYMem();
                    break;
                case "EA":
                    this.PC++;
                    break;
                case "00":
                    this.hasProgramEnded = true;
                    _MemoryManager.setMemoryStatus(pcb.segment);
                    pcb.state = "Terminated";
                    if (this.PC >= 255) {
                        TSOS.Utils.updateCPUDisplay();
                        TSOS.Utils.drawMemory();
                        TSOS.Utils.updatePCBRow(pcb);
                        _ReadyPCB.splice(_ReadyPCB.indexOf(pcb), 1);
                        return;
                    }
                    break;
                case "EC": //Little Endian
                    instrucAmount = 2;
                    this.compXMem();
                    break;
                case "D0":
                    instrucAmount = 1;
                    this.branchOnZ();
                    break;
                case "EE": //Little Endian
                    instrucAmount = 2;
                    this.incByte();
                    break;
                case "FF":
                    let interrupt = new TSOS.Interrupt(SYSTEM_CALL, [0]);
                    _KernelInterruptQueue.enqueue(interrupt);
                    break;
                default:
                    _Kernel.krnTrace("Invalid Op Code. Terminating execution.");
                    this.hasProgramEnded = true;
                    break;
            }
            TSOS.Utils.updateCPUDisplay();
            TSOS.Utils.drawMemory();
            TSOS.Utils.highlightMemory(pcb.segment, pcb.PC, instrucAmount);
            TSOS.Utils.updatePCBIR(pcb);
            _Dispatcher.snapshot(pcb);
            TSOS.Utils.updatePCBRow(pcb);
            if (this.hasProgramEnded) {
                TSOS.Utils.printTime(pcb);
                pcb.state = "Terminated";
                TSOS.Utils.updatePCBRow(pcb);
                _ReadyPCB.splice(_ReadyPCB.indexOf(pcb), 1);
                this.hasProgramEnded = false;
            }
            if (_SingleStep)
                this.isExecuting = false;
        }
        //Loads the accumulator with a constant.
        loadAccConst() {
            this.Acc = parseInt(_MemoryAccessor.read(_CurrentPCB.segment, this.PC + 1), 16);
            this.PC += 2;
        }
        //Loads the accumulator with a value from memory.
        loadAccMem() {
            let locationOfValue1 = _MemoryAccessor.read(_CurrentPCB.segment, this.PC + 1);
            let locationOfValue2 = _MemoryAccessor.read(_CurrentPCB.segment, this.PC + 2);
            let newValue = parseInt(locationOfValue2 + locationOfValue1, 16);
            this.Acc = parseInt(_MemoryAccessor.read(_CurrentPCB.segment, newValue), 16);
            this.PC += 3;
        }
        //Stores the accumulator's value in memory.
        storeInMem() {
            let locationOfValue1 = _MemoryAccessor.read(_CurrentPCB.segment, this.PC + 1);
            let locationOfValue2 = _MemoryAccessor.read(_CurrentPCB.segment, this.PC + 2);
            let newValue = parseInt(locationOfValue2 + locationOfValue1, 16);
            _MemoryAccessor.write(_CurrentPCB.segment, (this.Acc).toString(16).toUpperCase(), newValue);
            this.PC += 3;
        }
        //Adds a value to the accumulator. If the value is greater than 255, it 'rolls over' to 0 + remainder.
        addWCarry() {
            let locationOfValue1 = _MemoryAccessor.read(_CurrentPCB.segment, this.PC + 1);
            let locationOfValue2 = _MemoryAccessor.read(_CurrentPCB.segment, this.PC + 2);
            let newValue = parseInt(locationOfValue2 + locationOfValue1, 16);
            let toAdd = parseInt(_MemoryAccessor.read(_CurrentPCB.segment, newValue), 16);
            this.Acc += toAdd;
            if (this.Acc >= 256)
                this.Acc %= 256;
            this.PC += 3;
        }
        //Loads the X register with a constant.
        loadXConst() {
            this.Xreg = parseInt(_MemoryAccessor.read(_CurrentPCB.segment, this.PC + 1), 16);
            this.PC += 2;
        }
        //Loads the X register from memory.
        loadXMem() {
            let locationOfValue1 = _MemoryAccessor.read(_CurrentPCB.segment, this.PC + 1);
            let locationOfValue2 = _MemoryAccessor.read(_CurrentPCB.segment, this.PC + 2);
            let newValue = parseInt(locationOfValue2 + locationOfValue1, 16);
            this.Xreg = parseInt(_MemoryAccessor.read(_CurrentPCB.segment, newValue), 16);
            this.PC += 3;
        }
        //Loads the Y register with a constant.
        loadYConst() {
            this.Yreg = parseInt(_MemoryAccessor.read(_CurrentPCB.segment, this.PC + 1), 16);
            this.PC += 2;
        }
        //Loads the Y register from memory.
        loadYMem() {
            let locationOfValue1 = _MemoryAccessor.read(_CurrentPCB.segment, this.PC + 1);
            let locationOfValue2 = _MemoryAccessor.read(_CurrentPCB.segment, this.PC + 2);
            let newValue = parseInt(locationOfValue2 + locationOfValue1, 16);
            this.Yreg = parseInt(_MemoryAccessor.read(_CurrentPCB.segment, newValue), 16);
            this.PC += 3;
        }
        //Compares a value in memory with the X register. If it's true, set the Zflag.
        compXMem() {
            let locationOfValue1 = _MemoryAccessor.read(_CurrentPCB.segment, this.PC + 1);
            let locationOfValue2 = _MemoryAccessor.read(_CurrentPCB.segment, this.PC + 2);
            let newValue = parseInt(locationOfValue2 + locationOfValue1, 16);
            let toCompare = parseInt(_MemoryAccessor.read(_CurrentPCB.segment, newValue), 16);
            if (this.Xreg == toCompare)
                this.Zflag = 1;
            else
                this.Zflag = 0;
            this.PC += 3;
        }
        //Branches to a value in memory if the Zflag is false (0).
        branchOnZ() {
            if (this.Zflag == 0) {
                this.PC += parseInt(_MemoryAccessor.read(_CurrentPCB.segment, this.PC + 1), 16);
                this.PC += 2;
                this.PC %= 256;
            }
            else
                this.PC += 2;
        }
        //Increment the value of in memory by 1.
        incByte() {
            let locationOfValue1 = _MemoryAccessor.read(_CurrentPCB.segment, this.PC + 1);
            let locationOfValue2 = _MemoryAccessor.read(_CurrentPCB.segment, this.PC + 2);
            let newValue = parseInt(locationOfValue2 + locationOfValue1, 16);
            let toIncrement = parseInt(_MemoryAccessor.read(_CurrentPCB.segment, newValue), 16) + 1;
            _MemoryAccessor.write(_CurrentPCB.segment, toIncrement.toString(16).toUpperCase(), newValue);
            this.PC += 3;
        }
    }
    TSOS.Cpu = Cpu;
})(TSOS || (TSOS = {}));
//# sourceMappingURL=cpu.js.map