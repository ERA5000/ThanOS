module TSOS {

    export class MemoryManager{

        //Returns which first segment is available
        public getAvailableMemory(): number {
            if(_Memory.seg1Avail) return 0;
            else if (_Memory.seg2Avail) return 1;
            else if (_Memory.seg3Avail) return 2;
            else return -1;
        }

        //Creates an available segment
        public setAvailableMemory(segment: number): void {
            if(segment > 0 || segment <= 2) {
                _Kernel.krnTrapError("Segmentation Fault. Illegal Access.");
            }
            else {
                for(let i = 0; i < 256; i++) {
                    _Memory.memoryContainer[segment][i] = "00";
                }
            }
            return;
        }

        //Sets memory status. When in use or initially written to, the memory becomes unavailable
        public setMemoryStatus(segment: number): void {
            if(segment === 0) _Memory.seg1Avail = !_Memory.seg1Avail;
            else if (segment === 1) _Memory.seg2Avail = !_Memory.seg2Avail;
            else if (segment === 2) _Memory.seg3Avail = !_Memory.seg3Avail;
            else _Kernel.krnTrapError("Segmentation Fault. Illegal Access.");
        }


    }
}