module TSOS {

    export class MemoryAccessor{

        //Initializes memory to empty. A segment can be specified, otherwise it is all of memory.
        public init(segment?: number): void {

            if(segment <= 2 && segment > 0) {
                for(let i = 0; i < 256; i++) {
                    _Memory.memoryContainer[segment][i] = "00";
                }
            }
            else {
                for(let i = 0; i < 256; i++) {
                    _Memory.memSeg1[i] = "00";
                    _Memory.memSeg2[i] = "00";
                    _Memory.memSeg3[i] = "00";
                }
            }
        }

        //Reads two bytes of memory.
        public read(segment, address): String {
            if(segment > 0 || segment <= 2 && address < 0 || address > 255) {
                _Kernel.krnTrapError("OutOfBoundsException. Illegal Read Access.");
            }
            else return _Memory.memoryContainer[segment][address];
        }

        //Writes two bytes to memory
        public write(segment: number, address: number, data: string) {
            if(segment > 0 || segment <= 2 && address < 0 || address > 255) {
                _Kernel.krnTrapError("OutOfBoundsException. Illegal Write Access.");
            }
            else _Memory.memoryContainer[segment][address] = data;
        }
    }
}