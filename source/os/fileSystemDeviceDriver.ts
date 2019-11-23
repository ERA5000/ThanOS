module TSOS{
    export class FileSystemDeviceDriver extends DeviceDriver{

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
                            //console.log("What is the length of the data? "+ data.length);
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

        /*Use Cases for Creating a file
            File does not exist and enough space is available      -> create file
            File does not exist but enough space is unavailable    -> don't create file, return 'not enough space' error
            File does exist                                        -> dont' create file, return 'file already exists' error
        */
        public createFile(fileName: string): boolean{
            let isDirSpace = false;
            let isFileSpace = false;
            let dirSpace: string;
            let fileSpace: string;
            let isFileExtant = false;

            //Find Directory Space
            outer_loop:
            for(let i = 0; i < this.disk.sectors; i++){
                for(let j = 0; j < this.disk.blocks; j++){
                    if(this.getTSBUsage(`0${i}${j}`) == "0") {
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
                        if(this.getTSBUsage(`${i}${j}${k}`) == "0") {
                            isFileSpace = true;
                            fileSpace = `${i}${j}${k}`;
                            break outer_loop;
                        }
                    }
                }
            }

            //Ensure Singularity
            outer_loop:
            for(let i = 0; i < this.disk.tracks; i++){
                for(let j = 0; j < this.disk.sectors; j++){
                        if(this.getTSBInfo(`${0}${i}${j}`) == this.convertToHex(fileName)){
                            isFileExtant = true;
                            break outer_loop;
                    }
                }
            }

            //If there is file space, directory space, and it does not already exist, make the file
            if(isDirSpace && isFileSpace && !isFileExtant){
                if(!this.setTSBData(dirSpace, fileName)) return false;
                this.setTSBUsage(dirSpace, 1);
                this.setTSBLink(dirSpace, fileSpace);

                if(this.getTSBInfo(fileSpace) != "") this.wipeTSB(fileSpace);
                this.setTSBUsage(fileSpace, 1);

                return true;
            }
            else return false;
        }

        /*Use Cases for Writing to a file
            <= 60 hex chars on a file.                                              -> write converted data
                1. "Expected"/Standard write behavior.
            > 60 hex chars on a file.
                1. Find as many TSBs as needed. 
                    a. If all are available, use them.                              -> write converted data
                    b. If not enough are available, for now, fail operation.        -> return 'not enough space' error
            from > 60 to <= 60 hex chars.                                           -> Unlink all TSBs, write converted data
        */
        public writeToFile(fileName: string, data: string): boolean{
            let isFileFound = false;
            let fileTSB = "";
            let inUseBit: number;

            //Find the File
            outer_loop:
            for(let i = 0; i < this.disk.sectors; i++){
                for(let j = 0; j < this.disk.blocks; j++){
                    let fileFound = this.convertFromHex(this.getTSBInfo(`0${i}${j}`));
                    if(fileFound == fileName) {
                        isFileFound = true;
                        inUseBit = parseInt(this.getTSBUsage(`0${i}${j}`));
                        fileTSB = `0${i}${j}`;
                        break outer_loop;
                    }
                }
            }

            console.log("What is the converted length? " + this.convertToHex(data).length);
            //If the converted data is < 60, do 'standard write,' snaking through links to wipe if they exist
            if(isFileFound && inUseBit == 1){
                this.setTSBData(this.getTSBLink(fileTSB), data);
                return true;
            }
            else return false;
        }


        /*Use Cases for Reading from a file
            File does not exist                                             -> return 'file does not exist' error
            <= 60 hex chars on a file
                1. "Expected"/Standard read behavior                        -> return converted data
            > 60 hex chars on a file
                1. 'Snake' through linked TSBs. Combine data and output.    -> return converted data
        */
        public readFile(fileName: string): string{
            let hexName = this.convertToHex(fileName);
            let isFileFound = false;
            let inUseBit: number;
            let fileTSB: string;
            let printOut: string;

            //Find the File
            outer_loop:
            for(let i = 0; i < this.disk.sectors; i++){
                for(let j = 0; j < this.disk.blocks; j++){
                    let currentFile = this.getTSBInfo(`0${i}${j}`); //May break if the file length is exactly 30 chars / 60 hex.
                    if(currentFile == hexName){
                        isFileFound = true;
                        inUseBit = parseInt(this.getTSBUsage(`0${i}${j}`));
                        fileTSB = this.getTSBLink(`0${i}${j}`);
                        break outer_loop;
                    }
                }
            }

            /*If the file is found and in use,
              snake through its links to append all data to the output
            */
            if(isFileFound && inUseBit == 1){
                printOut = "";
                while(fileTSB != "---"){
                    let newLink = this.getTSBLink(fileTSB);
                    printOut += this.convertFromHex(this.getTSBInfo(fileTSB));
                    fileTSB = newLink;
                }
            }
            else printOut = "The requested file was not found.";
            return printOut;
        }

        public listFiles(listHidden: boolean): string[]{
            let files: string[] = [];
            if(listHidden){
                for(let i = 0; i < this.disk.sectors; i++){
                    for(let j = 1; j < this.disk.blocks; j++){
                        let currentFileBit = this.getTSBUsage(`0${i}${j}`);
                        if(currentFileBit == "1"){
                            files[files.length] = this.convertFromHex(this.getTSBInfo(`0${i}${j}`));
                        }
                    }
                }
            }
            else{
                for(let i = 0; i < this.disk.sectors; i++){
                    for(let j = 1; j < this.disk.blocks; j++){
                        let currentFileBit = this.getTSBUsage(`0${i}${j}`);
                        if(currentFileBit == "1"){
                            let fileName = this.convertFromHex(this.getTSBInfo(`0${i}${j}`));
                            if(fileName.charAt(0) == "." || fileName.charAt(0) == "@") continue;
                            else files[files.length] = this.convertFromHex(this.getTSBInfo(`0${i}${j}`));
                        }
                    }
                }
            }
            return files;
        }

        public deleteFile(fileName: string): boolean{
            let fileToDelete = this.convertToHex(fileName);
            let isFileFound = false;
            let nextTSBLink: string;
            let inUseBit: number;

            //Find the File
            outer_loop:
            for(let i = 0; i < this.disk.sectors; i++){
                for(let j = 0; j < this.disk.blocks; j++){
                    if(fileToDelete == this.getTSBInfo(`0${i}${j}`)){
                        isFileFound = true;
                        inUseBit = parseInt(this.getTSBUsage(`0${i}${j}`));
                        nextTSBLink = this.getTSBLink(`0${i}${j}`);
                        this.wipeTSB(`0${i}${j}`);
                        break outer_loop;
                    }
                }
            }

            //If the file is found, snake through its links to delete all data/references
            if(isFileFound && inUseBit == 1){
                while(nextTSBLink != "---"){
                    let newLink = this.getTSBLink(nextTSBLink);
                    this.wipeTSB(nextTSBLink);
                    nextTSBLink = newLink;
                }
                return true;
            }
            else return false;
        }

/*Below are Helper methods for the shell command methods above. (These will become private once all are completed and tested!)*/

        /*Returns only the information stored by the user.
            It uses "00" to denote when the data is done (and we can do this since the OS cannot interpret
                the null byte ASCII char anyway), but if the whole string is just "0," it returns an empty string.
                This is why that if statement in createFile *appears* unintuitive at first glance.
        */
        public getTSBInfo(tsb: string): string{
            return this.disk.storage.getItem(tsb).substring(4).split("00", 1)[0];
        }

        /*Returns the entire 64 bytes of data
        */
        public getTSBRaw(tsb: string): string{
            return this.disk.storage.getItem(tsb);
        }

        /*Writes data to a block
            Watch out for file names/data ending in 0 -> This will be a bug later.*
                *Potentially fixed as I now check for '00' as a 'null terminator' of sorts.
        */
        public setTSBData(tsb: string, data: string): boolean{
            let whole = this.getTSBRaw(tsb);
            let meta = whole.substring(0, 4);
            let hexName = this.convertToHex(data);
            if(hexName == "BROKEN") return false;
            let updated = (meta + hexName).padEnd(64, "0");
            this.disk.storage.setItem(tsb, updated);
            return true;
        }

        public getTSBUsage(tsb: string): string{
            return this.disk.storage.getItem(tsb).charAt(0);
        }

        public setTSBUsage(tsb: string, avail: number): void{
            let whole = this.getTSBRaw(tsb);
            let updated = avail + whole.substring(1);
            this.disk.storage.setItem(tsb, updated);
        }

        public wipeTSB(tsb: string){
            this.disk.storage.setItem(tsb, "0---".padEnd(64, "0"));
        }

        public findFreeTSB(): string{  
            return "";

        }

        public getTSBLink(tsb: string): string{
            return this.disk.storage.getItem(tsb).substring(1, 4);
        }

        public setTSBLink(tsb: string, link: string): void{
            let whole = this.getTSBRaw(tsb);
            let inUse = whole.charAt(0);
            let updated = inUse + link + whole.substring(4);
            this.disk.storage.setItem(tsb, updated);
        }

        /*Takes a string and converts it to unicode/ascii which then gets converted to Hex.
            If the value of what is attempted to be written, after doing all of the math/conversion is
            > 60, I return the string "BROKEN". This acts as a 'bubble' event like in JS to denote whether
            an operation was successful or not.
        This is read one-by-one because it's for each character.
        */
        private convertToHex(data: string): string{
            let hex = "";
            for(let i = 0; i < data.length; i++){
                hex += data.charCodeAt(i).toString(16);
                hex = hex.toUpperCase();
            }
            return hex;
        }

        /* Convert data from hex to ascii to readable strings
            Useful link: https://stackoverflow.com/questions/57803/how-to-convert-decimal-to-hexadecimal-in-javascript
        Thankfully, because we read every two chars, we don't need a special file terminator... for now.
        This is read two at a time because each value is is ASCII in hex.
            This will break if single-valued ASCII values are used -> I'll deal with these later if there's time.
        */
        private convertFromHex(data: string): string{
            let ascii = "";
            for(let i = 0; i < data.length - 1; i+=2){
                let temp = String.fromCharCode(parseInt(data.substring(i, i+2), 16));
                ascii += temp;
            }
            return ascii;
        }
    }
}