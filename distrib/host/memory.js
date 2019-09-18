var TSOS;
(function (TSOS) {
    class Memory {
        constructor(memoryArray = new Array(256)) {
            this.memoryArray = memoryArray;
            this.init();
        }
        init() {
            for (let i = 0; i < this.memoryArray.length; i++) {
                this.memoryArray[i] = "00";
            }
        }
        read(address) {
            if (address < 0 || address > 255) {
                _Kernel.krnTrapError("OutOfBoundsException. Illegal Read Access.");
                return;
            }
            else
                return this.memoryArray[address];
        }
        write(address, data) {
            if (address < 0 || address > 255) {
                _Kernel.krnTrapError("OutOfBoundsException. Illegal Write Access.");
                return;
            }
            else
                this.memoryArray[address] = data;
        }
    }
    TSOS.Memory = Memory;
})(TSOS || (TSOS = {}));
//# sourceMappingURL=memory.js.map