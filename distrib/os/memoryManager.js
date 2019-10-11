var TSOS;
(function (TSOS) {
    class MemoryManager {
        constructor() {
            this.range1 = [0, 255];
            this.range2 = [256, 511];
            this.range3 = [512, 767];
        }
        //Returns which first segment is available
        getAvailableMemory() {
            if (_Memory.seg1Avail)
                return 0;
            else if (_Memory.seg2Avail)
                return 1;
            else if (_Memory.seg3Avail)
                return 2;
            else
                return -1;
        }
        //Creates an available segment
        setAvailableMemory(segment) {
            if (segment < 0 || segment > 2) {
                _Kernel.krnTrapError("Segmentation Fault. Memory out of range.");
            }
            else {
                for (let i = 0; i < 256; i++) {
                    _Memory.memoryContainer[segment][i] = "00";
                }
            }
            return;
        }
        //Sets memory status. When in use or initially written to, the memory becomes unavailable
        setMemoryStatus(segment) {
            if (segment == 0)
                _Memory.seg1Avail = !_Memory.seg1Avail;
            else if (segment == 1)
                _Memory.seg2Avail = !_Memory.seg2Avail;
            else if (segment == 2)
                _Memory.seg3Avail = !_Memory.seg3Avail;
            else
                _Kernel.krnTrapError("Segmentation Fault. Status of nonexistent memory set.");
        }
        //Returns status of the next available memory segment.
        getMemoryStatus() {
            if (_Memory.seg1Avail)
                return _Memory.seg1Avail;
            else if (_Memory.seg2Avail)
                return _Memory.seg2Avail;
            else if (_Memory.seg3Avail)
                return _Memory.seg3Avail;
            else
                _Kernel.krnTrace("Error! No available memory.");
        }
        //Translate a literal address (0-767) to an actual segment (0, 1, 2)
        translate(addressLiteral) {
            if (addressLiteral >= 0 && addressLiteral <= 255)
                return 0;
            else if (addressLiteral >= 256 && addressLiteral <= 511)
                return 1;
            else if (addressLiteral >= 512 && addressLiteral <= 767)
                return 2;
            else
                return -1;
        }
    }
    TSOS.MemoryManager = MemoryManager;
})(TSOS || (TSOS = {}));
//# sourceMappingURL=memoryManager.js.map