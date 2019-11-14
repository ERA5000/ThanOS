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
                //console.log("Disk Post Quick Format:");
                for(let i = 0; i < this.disk.tracks; i++){
                    for(let j = 0; j < this.disk.sectors; j++){
                        for(let k = 0; k < this.disk.blocks; k++){

                            let reset = "---";
                            let previous = this.disk.storage.getItem(`${i}${j}${k}`).substring(4);
                            let data: string = "";
                            if(k == 0 && j == 0 && i == 0) data = "1" + reset + previous;
                            else data = "0" + reset + previous;
                            this.disk.storage.setItem(`${i}${j}${k}`, data);
                            //console.log(`${i}:${j}:${k}: ${this.disk.storage.getItem(`${i}:${j}:${k}`)} Length: ${data.length}`);
                        }
                    }
                }
                isSuccess = true;
            }
            else{
                //console.log("Disk Post Full Format:");
                const MAX_LENGTH = 64;
                for(let i = 0; i < this.disk.tracks; i++){
                    for(let j = 0; j < this.disk.sectors; j++){
                        for(let k = 0; k < this.disk.blocks; k++){
                            let data: string = "";
                            if(k == 0 && j == 0 && i == 0) data += "1";
                            else data += "0";
                            data = (data + "---").padEnd(MAX_LENGTH, "0");
                            console.log("What is the length of the data? "+ data.length);
                            this.disk.storage.setItem(`${i}${j}${k}`, data);
                            //console.log(`${i}:${j}:${k}: ${data} Length: ${data.length}`);
                        }
                    }
                }
                isSuccess = true;
            }
            this.disk.isFormatted = true;
            /*console.log("Random TSB Vibe Check");
            let track = Math.floor(Math.random() * 4);
            let sector = Math.floor(Math.random() * 8);
            let block = Math.floor(Math.random() * 8);
            console.log(`Data for TSB ${track}:${sector}:${block} is ${this.disk.storage.getItem(`${track}:${sector}:${block}`)}`);*/

            return isSuccess;
        }

        public createFile(fileName: string): boolean{
            //console.log("create file call");
            let isDirSpace = false;
            let isFileSpace = false;
            let dirSpace: string;
            let fileSpace: string;

            //Find Directory Space
            outer_loop:
            for(let i = 0; i < this.disk.sectors; i++){
                for(let j = 0; j < this.disk.blocks; j++){
                    //console.log("first loop set.");
                    if(this.getTSBAvailability(`0${i}${j}`) == "0") {
                        isDirSpace = true;
                        dirSpace = `0${i}${j}`;
                        break outer_loop;
                    }
                }
            }

            //Find File Space
            outer_loop:
            for(let i = 1; i < this.disk.tracks; i++){
                for(let j = 0; j < this.disk.sectors; j++){
                    for(let k = 0; k < this.disk.blocks; k++){
                        //console.log("second loop set.");
                        if(this.getTSBAvailability(`${i}${j}${k}`) == "0") {
                            isFileSpace = true;
                            fileSpace = `${i}${j}${k}`;
                            break outer_loop;
                        }
                    }
                }
            }

            if(isDirSpace && isFileSpace){
                //console.log("both were true.");
                if(!this.setTSBData(dirSpace, fileName)) return false;
                this.setTSBAvailability(dirSpace, 1);
                this.setTSBLink(dirSpace, fileSpace);

                this.setTSBAvailability(fileSpace, 1);

                return true;
            }
            else return false; //Create proper error message
        }

        public getTSBData(tsb: string): string{
            return this.disk.storage.getItem(tsb);
        }

        /*Writes data to a block
            Watch out for file names/data ending in 0 -> This will be a bug later.
        */
        public setTSBData(tsb: string, data: string): boolean{
            //console.log("What does it look like just before writing the name? "+ this.getTSBData(tsb));
            let whole = this.getTSBData(tsb);
            let meta = whole.substring(0, 4);
            let hexName = this.convertToHex(data);
            console.log("What was returned? "+ hexName);
            if(hexName == "BROKEN") return false;
            let updated = (meta + hexName).padEnd(64, "0");
            this.disk.storage.setItem(tsb, updated);
            //console.log("What does it look like just after writing the name? " + this.getTSBData(tsb));
            return true;
        }

        public getTSBAvailability(tsb: string): string{
            return this.disk.storage.getItem(tsb).charAt(0);
        }

        public setTSBAvailability(tsb: string, avail: number): void{
            let whole = this.getTSBData(tsb);
            let updated = avail + whole.substring(1);
            this.disk.storage.setItem(tsb, updated);
        }

        public wipeTSB(tsb: string){

        }

        public findFreeTSB(): string{  
            return "";

        }

        public getTSBLink(): string{
            return "";
        }

        public setTSBLink(tsb: string, link: string): void{
            let whole = this.getTSBData(tsb);
            let inUse = whole.charAt(0);
            let updated = inUse + link + whole.substring(4);
            console.log("What is this value? " + updated);
            console.log("What is its length? " + updated.length);
            this.disk.storage.setItem(tsb, updated);
        }

        /*Takes a string and converts it to unicode/ascii which then gets converted to Hex.
            If the value of what is attempted to be written, after doing all of the math/conversion is
            > 60, I return the string "BROKEN". This acts as a 'bubble' event like in JS to denote whether
            an operation was successful or not.
        */
        private convertToHex(data: string): string{
            let hex = "";
            for(let i = 0; i < data.length; i++){
                //console.log(`What's getting added? ASCII: ${data.charCodeAt(i)}`);
                //console.log(`What's getting added? Hex: ${data.charCodeAt(i).toString(16)}`);
                hex += data.charCodeAt(i).toString(16);
                hex = hex.toUpperCase();
            }
            //console.log("What is the length of the file name? " + hex.length);
            if(hex.length > 60) return "BROKEN";
            else return hex;
        }
    }
}