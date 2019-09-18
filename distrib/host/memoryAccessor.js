var TSOS;
(function (TSOS) {
    class MemoryAccessor {
        read(segment, address) {
            if (segment < 0 || segment > 2 || address < 0 || address > 255) {
                _Kernel.krnTrapError("OutOfBoundsException. Illegal Read Access.");
                return;
            }
            else
                return _Memory.memoryContainer[segment][address];
        }
        write(segment, address, data) {
            if (segment < 0 || segment > 2 || address < 0 || address > 255) {
                _Kernel.krnTrapError("OutOfBoundsException. Illegal Write Access.");
                return;
            }
            else
                _Memory.memoryContainer[segment][address] = data;
        }
    }
    TSOS.MemoryAccessor = MemoryAccessor;
})(TSOS || (TSOS = {}));
//# sourceMappingURL=memoryAccessor.js.map