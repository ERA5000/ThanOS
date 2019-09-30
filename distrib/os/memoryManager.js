var TSOS;
(function (TSOS) {
    class MemoryManager {
        constructor() {
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
            if (segment === 0)
                _Memory.seg1Avail = !_Memory.seg1Avail;
            else if (segment === 1)
                _Memory.seg2Avail = !_Memory.seg2Avail;
            else if (segment === 2)
                _Memory.seg3Avail = !_Memory.seg3Avail;
            else
                _Kernel.krnTrapError("Segmentation Fault. Status of nonexistent memory set.");
        }
        getMemoryStatus() {
            if (_Memory.seg1Avail)
                return _Memory.seg1Avail;
            else if (_Memory.seg2Avail)
                return _Memory.seg2Avail;
            else if (_Memory.seg3Avail)
                return _Memory.seg3Avail;
            else
                _Kernel.krnTrace("Error! No available memory."); //krnTrapError("Segmentation Fault. Illegal Access.");
        }
    }
    TSOS.MemoryManager = MemoryManager;
})(TSOS || (TSOS = {}));
//# sourceMappingURL=memoryManager.js.map