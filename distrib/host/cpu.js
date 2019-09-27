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
        constructor(PC = 0, Acc = 0, Xreg = 0, Yreg = 0, Zflag = 0, isExecuting = false) {
            this.PC = PC;
            this.Acc = Acc;
            this.Xreg = Xreg;
            this.Yreg = Yreg;
            this.Zflag = Zflag;
            this.isExecuting = isExecuting;
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
            pcb.state = "Running";
            let command;
            if (this.PC >= 255)
                command = "00";
            else
                command = _MemoryAccessor.read(pcb.segment, this.PC);
            switch (command) {
                case "A9":
                    this.loadAccConst();
                    break;
                case "AD":
                    break;
                case "8D":
                    break;
                case "6D":
                    break;
                case "A2":
                    break;
                case "AE":
                    break;
                case "A0":
                    break;
                case "AC":
                    break;
                case "EA":
                    this.PC++;
                    break;
                case "00":
                    this.isExecuting = false;
                    pcb.state = "Complete";
                    break;
                case "EC":
                    break;
                case "D0":
                    break;
                case "EE":
                    break;
                case "FF":
                    break;
                default:
                    _Kernel.krnTrapError("Invalid Op Code. Terminating execution.");
                    this.isExecuting = false;
                    break;
            }
            TSOS.Utils.updateCPUDisplay();
            pcb.snapshot();
            TSOS.Utils.updatePCBRow(pcb);
        }
        loadAccConst() {
            this.Acc = parseInt(_MemoryAccessor.read(_CurrentPCB.segment, this.PC + 1), 16);
            this.PC += 2;
        }
    }
    TSOS.Cpu = Cpu;
})(TSOS || (TSOS = {}));
//# sourceMappingURL=cpu.js.map