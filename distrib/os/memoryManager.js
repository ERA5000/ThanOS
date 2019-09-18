var TSOS;
(function (TSOS) {
    class MemoryManager {
        constructor() {
            this.memSeg1 = new TSOS.Memory();
            this.memSeg2 = new TSOS.Memory();
            this.memSeg3 = new TSOS.Memory();
        }
    }
    TSOS.MemoryManager = MemoryManager;
})(TSOS || (TSOS = {}));
//# sourceMappingURL=memoryManager.js.map