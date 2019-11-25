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

        /*Use Cases for Writing to a file:
            1. <= 60 hex chars on a file.                     -> delete any previous data, write new data
            2. > 60 hex chars on a file.
                a. Find as many TSBs as needed. 
                    i. If enough are available, use them.     -> search for TSBs, delete any previous data, write new data
                    ii. If not, fail the operation.
            3. Reducing TSB quantity while TSB count > 1      -> salvage TSBs, delete any previous data, write new data
            4. If all else fails                              -> fail the operation
                a. file not found
                b. not enough space
                c. some other third thing

        Verbose:
            My initial instinct on programming this was something small like "if space => write hex," and it worked.
                For reference, this now currently sits at around 130 lines of code. The orginal was closer to 40.
            But then I realized that for the case of the swap files at the very least, or just writing large files
                in general, that would not cut it.
            Above are the use-cases I came up with for how files might be written to.
            The first use-case is pretty stright-forward: regardless of how much data / how many links were there prior,
                just 'snake' through all of them and delete the data. Then write to the one TSB linked in the directory. Simple enough, no exceptions.
            The second use-case is where things get interesting. So I had this idea of 'salvaging' for two reasons:
                1. Since the data is overritten, technically those TSBs are now, relative to the command, 'available.' However,
                2. If the write were to fail, we need to make sure NOT to overrite the data. Yet.
                So instead of just jumping in and overriting and then looking for more if need be, that is what I did.
            The third use-case is almost like a sub-use-case of 2. This is because we need more than 1 TSB, so it definitely
                is not use-case 1, but because the data is less, more often than not the TSB count is going down. My point being that once
                it's been determined how many are required, it effectively acts as a combination of use-case 1 in that we have the space
                to do it, but like use-case 2 in that we still need to know how many.

            I wrote the logic for this first before programming it, and it took me about 5 hours to get it working "completely."*
                *I'm sure something will break it eventually. I'm writing this before I've even dared to implement swapping.
            Regardless, *famous last words* swapping should just build itself at this point. All I (theoretically) have to do is link it up
                and turn it on.
            But I do write this in some confidence because what I have tested does work (including reading and deleting > 60 hex char files.
                I even managed to intertwine two files and still parse them properly ;) ).
            Still, I'm not holding my breath.

            Aside: What is 'snaking?' I use this term to describe how files are supposed to be parsed: around other TSBs but through the ones
                that are linked. Unlike what common sense imposes nor the list command, one cannot simply brute-force the whole cache to find what's requested
                    (I guess you could but that is totally unnecessary). So that term is thrown around a bit.
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
            if(isFileFound && inUseBit == 1){
                //If writing more than 60 hex chars
                if(this.convertToHex(data).length > 60){
                    //determine how many TSBs are necessary to write the data
                    let required = Math.ceil(this.convertToHex(data).length / 60);
                    let found = 0;
                    let tempTSB = fileTSB;
                    let writeableTSBs: string[] = [];
                    //and attempt to salvage current TSBs in use.
                    while(tempTSB != "---"){
                        tempTSB = this.getTSBLink(tempTSB);
                        if(tempTSB != "---") {
                            writeableTSBs[writeableTSBs.length] = tempTSB;
                            found++;
                        }
                        else break;
                    }
                    //If the salvage met the requirement
                    if(found >= required){
                        let tempTSB = this.getTSBLink(fileTSB);
                        //delete the old data
                        while(tempTSB != "---"){
                            let newLink = this.getTSBLink(tempTSB);
                            this.wipeTSB(tempTSB);
                            tempTSB = newLink;
                        }
                        let shortner = data;
                        //and write the new data.
                        for(let i = 0; i < writeableTSBs.length; i++){
                            if(shortner.length > 30) {
                                this.setTSBData(writeableTSBs[i], shortner.substring(0, 30));
                                this.setTSBUsage(writeableTSBs[i], 1);
                                this.setTSBLink(writeableTSBs[i], writeableTSBs[i + 1]);
                                shortner = shortner.substring(30);
                            }
                            else {
                                this.setTSBData(writeableTSBs[i], shortner);
                                this.setTSBUsage(writeableTSBs[i], 1);
                                break;
                            }
                        }
                        return true;
                    }
                    //If the salvage did not meet the requirement
                    else if(found < required){
                        //look for available TSBs.
                        outer_loop:
                        for(let i = 1; i < this.disk.tracks; i++){
                            for(let j = 0; j < this.disk.sectors; j++){
                                for(let k = 0; k < this.disk.blocks; k++){
                                    if(this.getTSBUsage(`${i}${j}${k}`) == "0"){
                                        writeableTSBs[writeableTSBs.length] = `${i}${j}${k}`;
                                        found++;
                                        if(found >= required) {
                                            break outer_loop;
                                        }
                                        else continue;
                                    }
                                }
                            }
                        }
                        //If more TSBs are available
                        if(found >= required){
                            let tempTSB = fileTSB;
                            //delete their old data
                            while(this.getTSBLink(tempTSB) != "---"){
                                let newLink = this.getTSBLink(fileTSB);
                                this.wipeTSB(newLink);
                                tempTSB = newLink;
                            }
                            let shortner = data;
                            //and write the new data.
                            for(let i = 0; i < writeableTSBs.length; i++){
                                if(shortner.length > 30) {
                                    this.setTSBData(writeableTSBs[i], shortner.substring(0, 30));
                                    this.setTSBUsage(writeableTSBs[i], 1);
                                    this.setTSBLink(writeableTSBs[i], writeableTSBs[i + 1]);
                                    shortner = shortner.substring(30);
                                }
                                else {
                                    this.setTSBData(writeableTSBs[i], shortner);
                                    this.setTSBUsage(writeableTSBs[i], 1);
                                    break;
                                }
                            }
                            return true;
                        }
                        else return false;
                    }
                    /*If the salvage failed and no more TSBs are available, the larger data cannot be written.
                        Also, this ensures the previous data does not get overritten since it failed (if I did everything correctly).*/
                    else return false;
                }
                //If writing <= 60 hex chars
                else{
                    let tempTSB = this.getTSBLink(fileTSB);
                    //delete all previous data
                    while(tempTSB != "---"){
                        let newLink = this.getTSBLink(tempTSB);
                        this.wipeTSB(tempTSB);
                        tempTSB = newLink;
                    }
                    //and write to the first TSB directly referenced in the directory.
                    this.setTSBData(this.getTSBLink(fileTSB), data);
                    this.setTSBUsage(this.getTSBLink(fileTSB), 1);
                    return true;
                }
            }
            //If the file does not exist or something else weird happens, fail entirely.
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
              'snake' through its links to append all data to the output
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

            //If the file is found, 'snake' through its links to delete all data/references
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

        /*Checks to see if any free space exists by scouring the directory.
        This method purposely does not care about how much space is actually available as
            that is handled directly at write-time (boo tightly coupling).
        */
        public isDiskFull(): boolean{
            let isFull;
            for(let i = 0; i < this.disk.sectors; i++){
                for(let j = 0; j < this.disk.blocks; j++){
                    if(this.getTSBUsage(`0${i}${j}`) == '0'){
                        isFull = false;
                        return isFull;
                    }
                }
            }
            isFull = true;
            return isFull;
        }

        /*The Disk Swapping method! Hooray! The culmination of all iProjects is finally here.
        Here's how I broke down swapping:
        1. A PCB context switch is triggered
        2. If the pointer is now referring to a PCB with an invalid segment (that's how I denote on-disk, -1)
            a. temp store current memory segment
            b. delete current memory segment
            c. write hdd data to memory segment
            d. delete hdd data
            e. store memory data in hdd
            f. update segments, states, locations

        If you could believe it, it actually worked on the 'first' try. The only thing breaking it, as I predicted,
            was segHash (RIP in peace). Once removed, this thing soared.
        */
        public swap(toRollIn: ProcessControlBlock, toRollOut: ProcessControlBlock){
            let dataFromMem = _MemoryAccessor.getSegData(toRollOut.segment);
            _MemoryManager.wipeSegmentByID(toRollOut.segment);
            _MemoryAccessor.write(toRollOut.segment, this.readFile(`@swap${toRollIn.pid}`));
            _fsDD.deleteFile(`@swap${toRollIn.pid}`);
            _fsDD.createFile(`@swap${toRollOut.pid}`);
            _fsDD.writeToFile(`@swap${toRollOut.pid}`, dataFromMem);
            //toRollIn.location = "Memory"; //BROKEN
            toRollIn.segment = toRollOut.segment;
            //toRollOut.location = "Disk"; //BROKEN
            toRollOut.segment = -1;
            console.log("What is the memory segment? " + _MemoryAccessor.getSegData(toRollIn.segment));
            console.log("What is in the HDD? " + this.readFile(`@swap${toRollOut.pid}`));
            console.log("Where are these located? In: " + toRollIn.location);
            console.log("Where are these located? Out: " + toRollOut.location);
        }

/*Below are Helper methods for the shell command methods above.*/

        /*Returns only the information stored by the user.
            It uses "00" to denote when the data is done (and we can do this since the OS cannot interpret
                the null byte ASCII char anyway), but if the whole string is just "0," it returns an empty string.
                This is why that if statement in createFile *appears* unintuitive at first glance.
            UPDATE 11/24/19: Super Salty about this one. So, based on what I know, splitting on any amount of 0s
                cannot be differentiated. So if a Hex value ends with a 0, say the hex of ASCII '0' or the hex of ASCII 'P,'
                it indiscriminantely chops off all of it.
            I thought it would work like this: Say some hex is A230000... with the rest being filled with 0s. I thought
                that by telling split to look for say '00', it would ignore the '30' since that 0 is 'attached' to the 3,
                making it false. But no, it's just a hard left-to-right, character by character.
            And there's no help in Regex either since there is no way to ignore the 'xth' instance of something. Aw well.
        */
        private getTSBInfo(tsb: string): string{
            let info = this.disk.storage.getItem(tsb).substring(4).split("00", 1)[0];
            if(info.length % 2 != 0) return (info+=0);
            else return info;
        }

        /*Returns the entire 64 bytes of data
        */
        private getTSBRaw(tsb: string): string{
            return this.disk.storage.getItem(tsb);
        }

        /*Writes data to a block
            Watch out for file names/data ending in 0 -> This will be a bug later.*
                *Potentially fixed as I now check for '00' as a 'null terminator' of sorts.
        */
        private setTSBData(tsb: string, data: string): boolean{
            let whole = this.getTSBRaw(tsb);
            let meta = whole.substring(0, 4);
            let hexName = this.convertToHex(data);
            let updated = (meta + hexName).padEnd(64, "0");
            this.disk.storage.setItem(tsb, updated);
            return true;
        }

        private getTSBUsage(tsb: string): string{
            return this.disk.storage.getItem(tsb).charAt(0);
        }

        private setTSBUsage(tsb: string, avail: number): void{
            let whole = this.getTSBRaw(tsb);
            let updated = avail + whole.substring(1);
            this.disk.storage.setItem(tsb, updated);
        }

        private wipeTSB(tsb: string){
            this.disk.storage.setItem(tsb, "0---".padEnd(64, "0"));
        }

        private findFreeTSB(): string{  
            return "";

        }

        private getTSBLink(tsb: string): string{
            return this.disk.storage.getItem(tsb).substring(1, 4);
        }

        private  setTSBLink(tsb: string, link: string): void{
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