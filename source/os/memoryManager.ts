module TSOS {

    /*I was really conflicted in writing some of these methods since they effectively do the same thing, just in (so many) different ways.
        However, I have found that they all seem to serve different purposes depending on context. For now, they will all stay, but I did refactor
        a few just so it is easier to determine what they are doing since it was getting confusing (which means I am doing a bad job).
    */

    export class MemoryManager{

        public range1 = [0, 255];
        public range2 = [256, 511];
        public range3 = [512, 767];

        constructor(){
        }

        //Returns which first segment is available
        public getNextAvailableSegment(): number {
            if(_Memory.seg1Avail) return 0;
            else if (_Memory.seg2Avail) return 1;
            else if (_Memory.seg3Avail) return 2;
            else return -1;
        }

        //If a segment is specified, it will erase it. If not, all of memory will be erased.
        public wipeSegmentByID(segment?: number): void {
            if(segment < 0 || segment > 2) {
                _Kernel.krnTrapError("Segmentation Fault. Memory out of range.");
            }
            else if(segment == 0 || segment == 1 || segment == 2){
                for(let i = 0; i < 256; i++) {
                    _Memory.memoryContainer[segment][i] = "00";
                }
            }
            else {
                for(let i = 0; i < 3; i++){
                    for(let j = 0; j < 256; j++){
                        _Memory.memoryContainer[i][j] = "00";
                    }
                }
            }
            return;
        }

        /*Blindly flips memory status.
          If no segment is given, all get flipped.
          Can be useful for when the state is not explicitly known but needs to be changed.
        */
        public toggleMemoryStatus(segment?: number): void {
            if(segment < 0 || segment > 2) _Kernel.krnTrapError("Segmentation Fault. Status of nonexistent memory set.");
            else if(segment == 0) _Memory.seg1Avail = !_Memory.seg1Avail;
            else if (segment == 1) _Memory.seg2Avail = !_Memory.seg2Avail;
            else if (segment == 2) _Memory.seg3Avail = !_Memory.seg3Avail;
            else {
                _Memory.seg1Avail = !_Memory.seg1Avail;
                _Memory.seg2Avail = !_Memory.seg2Avail;
                _Memory.seg3Avail = !_Memory.seg3Avail;
            }
        }

        //Returns boolean status of the next available memory segment, if there is one.
        public getMemoryStatus(): boolean {
            if(_Memory.seg1Avail) return _Memory.seg1Avail;
            else if (_Memory.seg2Avail) return _Memory.seg2Avail;
            else if (_Memory.seg3Avail) return _Memory.seg3Avail;
            else {
                _Kernel.krnTrace("Error! No available memory.");
                return false;
            }
        }

        //Translates a literal address (0-767) to an actual segment (0, 1, 2)
        public translate(addressLiteral: number): number {
            if(addressLiteral >= 0 && addressLiteral <= 255) return 0;
            else if(addressLiteral >= 256 && addressLiteral <= 511) return 1;
            else if(addressLiteral >= 512 && addressLiteral <= 767) return 2;
            else return -1;
        }

        //Makes all memory available for use.
        public setAllAvailable(){
            _Memory.seg1Avail = true;
            _Memory.seg2Avail = true;
            _Memory.seg3Avail = true;
        }

        //Makes a specified segment available.
        public setSegmentTrue(segment: number){
            if(segment == 0) _Memory.seg1Avail = true;
            else if (segment == 1) _Memory.seg2Avail = true;
            else if (segment == 2) _Memory.seg3Avail = true;
            else _Kernel.krnTrapError("Segmentation Fault. Status of nonexistent memory set to true.");
        }

        //Makes a specified segment unavailable.
        public setSegmentFalse(segment: number){
            if(segment == 0) _Memory.seg1Avail = false;
            else if (segment == 1) _Memory.seg2Avail = false;
            else if (segment == 2) _Memory.seg3Avail = false;
            else _Kernel.krnTrapError("Segmentation Fault. Status of nonexistent memory set to false.");
        }
    }
}