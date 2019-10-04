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
        constructor(PC = 0, Acc = 0, Xreg = 0, Yreg = 0, Zflag = 0, isExecuting = false, hasExecutionStarted = false) {
            this.PC = PC;
            this.Acc = Acc;
            this.Xreg = Xreg;
            this.Yreg = Yreg;
            this.Zflag = Zflag;
            this.isExecuting = isExecuting;
            this.hasExecutionStarted = hasExecutionStarted;
        }
        init() {
            this.PC = 0;
            this.Acc = 0;
            this.Xreg = 0;
            this.Yreg = 0;
            this.Zflag = 0;
            this.isExecuting = false;
        }
        cycle() {
            _Kernel.krnTrace('CPU cycle');
            // TODO: Accumulate CPU usage and profiling statistics here.
            // Do the real work here. Be sure to set this.isExecuting appropriately.
            this.execute(_CurrentPCB);
        }
        execute(pcb) {
            this.hasExecutionStarted = true;
            pcb.state = "Running";
            let command;
            let instrucAmount = 0;
            if (this.PC >= 255)
                command = "00";
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
                    this.isExecuting = false;
                    _MemoryManager.setMemoryStatus(_CurrentPCB.segment);
                    pcb.state = "Terminated";
                    this.hasExecutionStarted = false;
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
                    this.systemCall();
                    break;
                default:
                    _Kernel.krnTrapError("Invalid Op Code. Terminating execution.");
                    this.isExecuting = false;
                    pcb.state = "Error";
                    break;
            }
            TSOS.Utils.updateCPUDisplay();
            TSOS.Utils.updatePCBRow(pcb);
            TSOS.Utils.drawMemory();
            TSOS.Utils.highlight(pcb.PC, instrucAmount);
            pcb.snapshot();
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
        /*Prints the Y register if X is 1.
          Dumps the Y register's address' values until it encounters either 00 or the end of memory if X is 2.
          The toPrint variable has spaces because A) it makes it easier to read, but also B) it does not print properly if all of memory
            is one contiguous string (which is something I will look into later).
        */
        systemCall() {
            if (this.Xreg == 1) {
                console.log("What is this value? " + parseInt(this.Yreg + "", 16));
                _StdOut.putText(this.Yreg.toString(16));
                _StdOut.advanceLine();
                _StdOut.putText(_OsShell.promptStr);
            }
            else if (this.Xreg == 2) {
                let toPrint = "";
                let temp = 0;
                let locationToStart = this.Yreg;
                for (let i = locationToStart; i < 256; i++) {
                    temp = parseInt(_MemoryAccessor.read(_CurrentPCB.segment, i), 16);
                    console.log("What is the value of temp? " + temp);
                    if (temp >= 1 && temp <= 9) {
                        console.log("What is being added here? " + temp);
                        toPrint += temp;
                    }
                    else if (temp == 0)
                        break;
                    else {
                        toPrint += String.fromCharCode(temp);
                    }
                }
                _StdOut.putText(toPrint);
                _StdOut.advanceLine();
                _StdOut.putText(_OsShell.promptStr);
            }
            this.PC++;
        }
    }
    TSOS.Cpu = Cpu;
})(TSOS || (TSOS = {}));
//# sourceMappingURL=cpu.js.map