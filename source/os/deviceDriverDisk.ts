module TSOS{
    export class DeviceDriverDisk extends DeviceDriver{

        public disk: Disk;

        constructor(disk){
            super();
            this.disk = disk;
            this.driverEntry = this.krnKbdDriverEntry();
        }

        /* This is what the other device driver does... so yeah.
        */
        public krnKbdDriverEntry(){
            this.status = "loaded";
        }

        /* Formats the disk.
            By default, it does a Full Format, wiping everything.
            If specified by the '-q' flag, it will do a Quick Format which only wipes the TCB meta data.
        */
        public format(isQuickFormat: boolean): boolean{

            let isSuccess = false;

            if(isQuickFormat){
                console.log("Disk Post Quick Format:");
                for(let i = 0; i < this.disk.tracks; i++){
                    for(let j = 0; j < this.disk.sectors; j++){
                        for(let k = 0; k < this.disk.blocks; k++){

                            let reset = "---";
                            let previous = this.disk.storage.getItem(`${i}:${j}:${k}`).substring(4);
                            let data = "0" + reset + previous;
                            this.disk.storage.setItem(`${i}:${j}:${k}`, data);
                            console.log(`${i}:${j}:${k}: ${this.disk.storage.getItem(`${i}:${j}:${k}`)} Length: ${data.length}`);
                        }
                    }
                }
                isSuccess = true;
            }
            else{
                console.log("Disk Post Full Format:");
                const OVERHEAD = 4;
                const MAX_WRITEABLE = this.disk.blockSize - OVERHEAD;
                for(let i = 0; i < this.disk.tracks; i++){
                    for(let j = 0; j < this.disk.sectors; j++){
                        for(let k = 0; k < this.disk.blocks; k++){
                            let data: string = "";
                            if(i == 0 && j == 0 && k == 0){
                                data += "1";
                            }
                            else{
                                data += "0";
                            }
                            data = (data + "---").padEnd(MAX_WRITEABLE, "0");
                            this.disk.storage.setItem(`${i}:${j}:${k}`, data);
                            console.log(`${i}:${j}:${k}: ${data} Length: ${data.length}`);
                        }
                    }
                }
                isSuccess = true;
            }
            this.disk.isFormatted = true;
            console.log("Random TSB Vibe Check");
            let track = Math.floor(Math.random() * 4);
            let sector = Math.floor(Math.random() * 8);
            let block = Math.floor(Math.random() * 8);
            console.log(`Data for TSB ${track}:${sector}:${block} is ${this.disk.storage.getItem(`${track}:${sector}:${block}`)}`);

            return isSuccess;
        }
    }
}