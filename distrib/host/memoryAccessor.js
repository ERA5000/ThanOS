var TSOS;
(function (TSOS) {
    class MemoryAccessor {
        //Initializes memory to empty. A segment can be specified, otherwise it is all of memory.
        init(segment) {
            if (segment <= 2 && segment > 0) {
                for (let i = 0; i < 256; i++) {
                    _Memory.memoryContainer[segment][i] = "00";
                }
            }
            else {
                for (let i = 0; i < 256; i++) {
                    _Memory.memSeg1[i] = "00";
                    _Memory.memSeg2[i] = "00";
                    _Memory.memSeg3[i] = "00";
                }
            }
        }
        //Reads two bytes of memory.
        read(segment, address) {
            if (_CurrentPCB.segment != _CurrentPCB.getSegHash())
                _Kernel.krnTrapError("IntegrityMismatchException. Illegal Read Access.");
            else if ((segment >= 0 && segment <= 2) && (address >= 0 && address <= 255))
                return _Memory.memoryContainer[segment][address];
            else
                _Kernel.krnTrapError("OutOfBoundsException. Illegal Read Access.");
        }
        /*Writes a stream of code to memory
            The 'stream of code' is 512 characters long, containing 256 2-byte segments.
        */
        write(segment, data, address) {
            if (_CurrentPCB != null && _CurrentPCB.segment != _CurrentPCB.getSegHash())
                _Kernel.krnTrapError("IntegrityMismatchException. Illegal Write Access.");
            else if (address) {
                if ((address >= 0 && address <= 255))
                    _Memory.memoryContainer[segment][address] = data;
                else
                    _Kernel.krnTrapError("OutOfBoundsException. Illegal Address Write Access.");
            }
            else if ((segment >= 0 && segment <= 2) && data.length / 2 <= 256) {
                let wordCounter = 0;
                for (let i = 0; i < data.length / 2; i++) {
                    _Memory.memoryContainer[segment][i] = data.substring(wordCounter, wordCounter + 2);
                    wordCounter += 2;
                }
            }
            else
                _Kernel.krnTrapError("OutOfBoundsException. Illegal Write Access.");
        }
        //Debugging purposes - Prints the contents of memory to the console
        print() {
            let seg1 = "";
            let seg2 = "";
            let seg3 = "";
            for (let i = 0; i < 256; i++) {
                seg1 += _Memory.memSeg1[i];
            }
            for (let i = 0; i < 256; i++) {
                seg2 += _Memory.memSeg2[i];
            }
            for (let i = 0; i < 256; i++) {
                seg3 += _Memory.memSeg3[i];
            }
            console.log("This is in memSeg1: " + seg1);
            console.log("This is in memSeg2: " + seg2);
            console.log("This is in memSeg3: " + seg3);
        }
    }
    TSOS.MemoryAccessor = MemoryAccessor;
})(TSOS || (TSOS = {}));
//# sourceMappingURL=memoryAccessor.js.map