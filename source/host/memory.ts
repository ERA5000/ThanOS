module TSOS {

    export class Memory {

        public memoryContainer;

        constructor(public memSeg1 = new Array(256),
                    public memSeg2 = new Array(256),
                    public memSeg3 = new Array(256)){
                this.init();
        }

        public init(): void {
            for(let i = 0; i < 256; i++) {
                this.memSeg1[i] = "00";
                this.memSeg2[i] = "00";
                this.memSeg3[i] = "00";
            }
            this.memoryContainer = [this.memSeg1, this.memSeg2, this.memSeg3];
        }
    }
}