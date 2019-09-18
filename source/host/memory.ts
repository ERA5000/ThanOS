module TSOS {

    export class Memory {

        constructor(
                    public memoryArray = new Array(256)
        ){
            this.init();
        }

        public init(): void {
            for(let i = 0; i < this.memoryArray.length; i++) {
                this.memoryArray[i] = "00";
            }
        }

        public read(address): String {
            if(address < 0 || address > 255) {
                _Kernel.krnTrapError("OutOfBoundsException. Illegal Read Access.");
                return;
            }
            else return this.memoryArray[address];
        }

        public write(address, data) {
            if(address < 0 || address > 255) {
                _Kernel.krnTrapError("OutOfBoundsException. Illegal Write Access.");
                return;
            }
            else this.memoryArray[address] = data;
        }
    }
}