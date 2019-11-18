var TSOS;
(function (TSOS) {
    class DeviceDriverDisk extends TSOS.DeviceDriver {
        constructor(disk) {
            super();
            this.disk = disk;
            this.driverEntry = this.krnKbdDriverEntry();
        }
        /* This is what the other device driver does... so yeah.
        */
        krnKbdDriverEntry() {
            this.status = "loaded";
        }
        /* Formats the disk.
            By default, it does a Full Format, wiping everything.
            If specified by the '-q' flag, it will do a Quick Format which only wipes the TCB meta data.
        */
        format(isQuickFormat) {
            let isSuccess = false;
            if (isQuickFormat) {
                //console.log("Disk Post Quick Format:");
                for (let i = 0; i < this.disk.tracks; i++) {
                    for (let j = 0; j < this.disk.sectors; j++) {
                        for (let k = 0; k < this.disk.blocks; k++) {
                            let reset = "---";
                            let previous = this.disk.storage.getItem(`${i}${j}${k}`).substring(4);
                            let data = "";
                            if (k == 0 && j == 0 && i == 0)
                                data = "1" + reset + previous;
                            else
                                data = "0" + reset + previous;
                            this.disk.storage.setItem(`${i}${j}${k}`, data);
                            //console.log(`${i}:${j}:${k}: ${this.disk.storage.getItem(`${i}:${j}:${k}`)} Length: ${data.length}`);
                        }
                    }
                }
                isSuccess = true;
            }
            else {
                //console.log("Disk Post Full Format:");
                const MAX_LENGTH = 64;
                for (let i = 0; i < this.disk.tracks; i++) {
                    for (let j = 0; j < this.disk.sectors; j++) {
                        for (let k = 0; k < this.disk.blocks; k++) {
                            let data = "";
                            if (k == 0 && j == 0 && i == 0)
                                data += "1";
                            else
                                data += "0";
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
        createFile(fileName) {
            let isDirSpace = false;
            let isFileSpace = false;
            let dirSpace;
            let fileSpace;
            //Find Directory Space
            outer_loop: for (let i = 0; i < this.disk.sectors; i++) {
                for (let j = 0; j < this.disk.blocks; j++) {
                    if (this.getTSBAvailability(`0${i}${j}`) == "0") {
                        isDirSpace = true;
                        dirSpace = `0${i}${j}`;
                        break outer_loop;
                    }
                }
            }
            //Find File Space
            outer_loop: for (let i = 1; i < this.disk.tracks; i++) {
                for (let j = 0; j < this.disk.sectors; j++) {
                    for (let k = 0; k < this.disk.blocks; k++) {
                        //console.log("second loop set.");
                        if (this.getTSBAvailability(`${i}${j}${k}`) == "0") {
                            isFileSpace = true;
                            fileSpace = `${i}${j}${k}`;
                            break outer_loop;
                        }
                    }
                }
            }
            if (isDirSpace && isFileSpace) {
                if (!this.setTSBData(dirSpace, fileName))
                    return false;
                this.setTSBAvailability(dirSpace, 1);
                this.setTSBLink(dirSpace, fileSpace);
                this.setTSBAvailability(fileSpace, 1);
                return true;
            }
            else
                return false; //Create proper error message
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
        writeToFile(fileName, data) {
            let isFileFound = false;
            let fileTSB = "";
            outer_loop: for (let i = 0; i < this.disk.sectors; i++) {
                for (let j = 0; j < this.disk.blocks; j++) {
                    let fileFound = this.convertFromHex(this.getTSBData(`0${i}${j}`).substring(4).split("00", 1)[0]);
                    if (fileFound == fileName) {
                        isFileFound = true;
                        fileTSB = `0${i}${j}`;
                        break outer_loop;
                    }
                }
            }
            if (isFileFound) {
                this.setTSBData(this.getTSBLink(fileTSB), data);
                return true;
            }
            else
                return false;
        }
        /*Use Cases for Reading from a file
            File does not exist                                             -> return 'file does not exist' error
            <= 60 hex chars on a file
                1. "Expected"/Standard read behavior                        -> return converted data
            > 60 hex chars on a file
                1. 'Snake' through linked TSBs. Combine data and output.    -> return converted data
        */
        readFile(fileName) {
            let hexName = this.convertToHex(fileName);
            let fileFound = false;
            let fileTSB;
            outer_loop: for (let i = 0; i < this.disk.sectors; i++) {
                for (let j = 0; j < this.disk.blocks; j++) {
                    let currentFile = this.getTSBData(`0${i}${j}`).substring(4).split("00", 1)[0]; //May break if the file length is exactly 30 chars / 60 hex.
                    if (currentFile == hexName) {
                        fileFound = true;
                        fileTSB = this.getTSBLink(`0${i}${j}`);
                        break outer_loop;
                    }
                }
            }
            if (fileFound) {
                let printOut = "";
                outer_loop: for (let i = 1; i < this.disk.tracks; i++) {
                    for (let j = 0; j < this.disk.sectors; j++) {
                        for (let k = 0; k < this.disk.blocks; k++) {
                            printOut += this.convertFromHex(this.getTSBData(fileTSB).substring(4).split("00", 1)[0]);
                            fileTSB = this.getTSBLink(fileTSB);
                            if (fileTSB == "---")
                                break outer_loop;
                            else
                                fileTSB = this.getTSBLink(fileTSB);
                        }
                    }
                }
                return printOut;
            }
        }
        /*Below are Helper methods for the shell command methods above. (These will become private once all are completed and tested!)*/
        getTSBData(tsb) {
            return this.disk.storage.getItem(tsb);
        }
        /*Writes data to a block
            Watch out for file names/data ending in 0 -> This will be a bug later.*
                *Potentially fixed as I now check for '00' as a 'null terminator' of sorts.
        */
        setTSBData(tsb, data) {
            let whole = this.getTSBData(tsb);
            let meta = whole.substring(0, 4);
            let hexName = this.convertToHex(data);
            if (hexName == "BROKEN")
                return false;
            let updated = (meta + hexName).padEnd(64, "0");
            this.disk.storage.setItem(tsb, updated);
            return true;
        }
        getTSBAvailability(tsb) {
            return this.disk.storage.getItem(tsb).charAt(0);
        }
        setTSBAvailability(tsb, avail) {
            let whole = this.getTSBData(tsb);
            let updated = avail + whole.substring(1);
            this.disk.storage.setItem(tsb, updated);
        }
        wipeTSB(tsb) {
        }
        findFreeTSB() {
            return "";
        }
        getTSBLink(tsb) {
            return this.disk.storage.getItem(tsb).substring(1, 4);
        }
        setTSBLink(tsb, link) {
            let whole = this.getTSBData(tsb);
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
        convertToHex(data) {
            let hex = "";
            for (let i = 0; i < data.length; i++) {
                //console.log(`What's getting added? ASCII: ${data.charCodeAt(i)}`);
                //console.log(`What's getting added? Hex: ${data.charCodeAt(i).toString(16)}`);
                hex += data.charCodeAt(i).toString(16);
                hex = hex.toUpperCase();
            }
            //console.log("What is the length of the file name? " + hex.length);
            if (hex.length > 60)
                return "BROKEN";
            else
                return hex;
        }
        /* Convert data from hex to ascii to readable strings
            Useful link: https://stackoverflow.com/questions/57803/how-to-convert-decimal-to-hexadecimal-in-javascript
        Thankfully, because we read every two chars, we don't need a special file terminator... for now.
        This is read two at a time because each value is is ASCII in hex.
            This will break if single-valued ASCII values are used -> I'll deal with these later if there's time.
        */
        convertFromHex(data) {
            let ascii = "";
            for (let i = 0; i < data.length - 1; i += 2) {
                let temp = String.fromCharCode(parseInt(data.substring(i, i + 2), 16));
                ascii += temp;
            }
            return ascii;
        }
    }
    TSOS.DeviceDriverDisk = DeviceDriverDisk;
})(TSOS || (TSOS = {}));
//# sourceMappingURL=deviceDriverDisk.js.map