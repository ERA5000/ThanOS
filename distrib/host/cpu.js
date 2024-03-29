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
        constructor(PC = 0, Acc = 0, Xreg = 0, Yreg = 0, Zflag = 0, isExecuting = false, hasExecutionStarted = false, dataAmount = 0) {
            this.PC = PC;
            this.Acc = Acc;
            this.Xreg = Xreg;
            this.Yreg = Yreg;
            this.Zflag = Zflag;
            this.isExecuting = isExecuting;
            this.hasExecutionStarted = hasExecutionStarted;
            this.dataAmount = dataAmount;
        }
        init() {
            this.PC = 0;
            this.Acc = 0;
            this.Xreg = 0;
            this.Yreg = 0;
            this.Zflag = 0;
            this.isExecuting = false;
            this.hasExecutionStarted = false;
            this.dataAmount = 0;
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
            if (this.PC < 0 || this.PC >= 255) {
                command = "00";
            }
            else
                command = _MemoryAccessor.read(pcb.segment, this.PC);
            switch (command) {
                case "A9":
                    this.dataAmount = 1;
                    this.loadAccConst();
                    break;
                case "AD": //Little Endian
                    this.dataAmount = 2;
                    this.loadAccMem();
                    break;
                case "8D": //Little Endian
                    this.dataAmount = 2;
                    this.storeInMem();
                    break;
                case "6D": //Little Endian
                    this.dataAmount = 2;
                    this.addWCarry();
                    break;
                case "A2":
                    this.dataAmount = 1;
                    this.loadXConst();
                    break;
                case "AE": //Little Endian
                    this.dataAmount = 2;
                    this.loadXMem();
                    break;
                case "A0":
                    this.dataAmount = 1;
                    this.loadYConst();
                    break;
                case "AC": //Little Endian
                    this.dataAmount = 2;
                    this.loadYMem();
                    break;
                case "EA":
                    this.dataAmount = 0;
                    this.PC++;
                    break;
                case "00":
                    this.dataAmount = 0;
                    _MemoryManager.setSegmentTrue(pcb.segment);
                    pcb.state = "Terminated";
                    TSOS.Utils.printTime(pcb);
                    _ReadyPCB.splice(_ReadyPCB.indexOf(pcb), 1);
                    break;
                case "EC": //Little Endian
                    this.dataAmount = 2;
                    this.compXMem();
                    break;
                case "D0":
                    this.dataAmount = 1;
                    this.branchOnZ();
                    break;
                case "EE": //Little Endian
                    this.dataAmount = 2;
                    this.incByte();
                    break;
                case "FF":
                    this.dataAmount = 0;
                    let interrupt = new TSOS.Interrupt(SYSTEM_CALL, [0]);
                    _KernelInterruptQueue.enqueue(interrupt);
                    break;
                default:
                    _Kernel.krnTrace("Invalid Op Code. Terminating execution.");
                    _MemoryManager.toggleMemoryStatus(pcb.segment);
                    pcb.state = "Terminated";
                    _ReadyPCB.splice(_ReadyPCB.indexOf(pcb), 1);
                    break;
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
        /*The padStart ensures exactly two (2) digits are stored since the accumulator uses number variables (and I did not want to change this in the spirit thereof).
            For example, the accumulator only stores '1', but memory needs '01' since the program length matters. The CPU display of '01' is strictly graphical.*/
        storeInMem() {
            let locationOfValue1 = _MemoryAccessor.read(_CurrentPCB.segment, this.PC + 1);
            let locationOfValue2 = _MemoryAccessor.read(_CurrentPCB.segment, this.PC + 2);
            let newValue = parseInt(locationOfValue2 + locationOfValue1, 16);
            _MemoryAccessor.write(_CurrentPCB.segment, (this.Acc).toString(16).toUpperCase().padStart(2, "0"), newValue);
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
        //Increment the value of a byte in memory by 1.
        incByte() {
            let locationOfValue1 = _MemoryAccessor.read(_CurrentPCB.segment, this.PC + 1);
            let locationOfValue2 = _MemoryAccessor.read(_CurrentPCB.segment, this.PC + 2);
            let newValue = parseInt(locationOfValue2 + locationOfValue1, 16);
            let toIncrement = parseInt(_MemoryAccessor.read(_CurrentPCB.segment, newValue), 16) + 1;
            _MemoryAccessor.write(_CurrentPCB.segment, (toIncrement.toString(16).toUpperCase() + "").padStart(2, "0"), newValue);
            this.PC += 3;
        }
    }
    TSOS.Cpu = Cpu;
})(TSOS || (TSOS = {}));
//# sourceMappingURL=cpu.js.map