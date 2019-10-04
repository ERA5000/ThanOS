var TSOS;
(function (TSOS) {
    class Memory {
        constructor(memSeg1 = new Array(256), memSeg2 = new Array(256), memSeg3 = new Array(256), seg1Avail = true, seg2Avail = true, seg3Avail = true) {
            this.memSeg1 = memSeg1;
            this.memSeg2 = memSeg2;
            this.memSeg3 = memSeg3;
            this.seg1Avail = seg1Avail;
            this.seg2Avail = seg2Avail;
            this.seg3Avail = seg3Avail;
            this.init();
        }
        init() {
            for (let i = 0; i < 256; i++) {
                this.memSeg1[i] = "00";
                this.memSeg2[i] = "00";
                this.memSeg3[i] = "00";
            }
            this.memoryContainer = [this.memSeg1, this.memSeg2, this.memSeg3];
        }
    }
    TSOS.Memory = Memory;
})(TSOS || (TSOS = {}));
//# sourceMappingURL=memory.js.map