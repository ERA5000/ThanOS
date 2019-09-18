module TSOS {

    export class MemoryManager{
        
        public memSeg1: Memory;
        public memSeg2: Memory;
        public memSeg3: Memory;

        constructor() {
            this.memSeg1 = new Memory();
            this.memSeg2 = new Memory();
            this.memSeg3 = new Memory();
        }
    }
}