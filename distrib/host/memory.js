var TSOS;
(function (TSOS) {
    class Memory {
        constructor(memSeg1 = new Array(256), memSeg2 = new Array(256), memSeg3 = new Array(256), seg1Avail = true, seg2Avail = true, seg3Avail = true) {
            this.memSeg1 = memSeg1;
            this.memSeg2 = memSeg2;
            this.memSeg3 = memSeg3;
            this.seg1Avail = seg1Avail;
            this.seg2Avail = seg2Avail;
            this.seg3Avail = seg3Avail;
            this.init();
        }
        init() {
            for (let i = 0; i < 256; i++) {
                this.memSeg1[i] = "00";
                this.memSeg2[i] = "00";
                this.memSeg3[i] = "00";
            }
            this.memoryContainer = [this.memSeg1, this.memSeg2, this.memSeg3];
        }
        /*Dynamically populates the <table> with the contents of memory.
            The 'justCreated' boolean determines whether a new row was, well, justCreated. If so, create a new row and decrement the counter since it 'wasted a turn'
                populating the row's Hex label (ie 0x028) -- See next comment.
            The padStart() method, introduced in ES2017 (which I A. just discovered does exactly what I need and B. Is what you made the target for the project
                to be so #Bless) buffers a string with some text to a set length. Since all displayed Hex should be 0x1234, this works beautifully.
                The 256 * i acts as an offset for the segments so it keeps adding rather than restarting at 0x000.
            I also recognize that it is redundant to have the back-to-back if statements as they are, but when I changed them it broke... so I'll come back to that*
        */
        //TO DO: Remove this GUI Logic and put it somewhere else! (Utils? MemoryAccessor?)
        drawMemory() {
            let table = "<table>";
            let justCreated = false;
            for (let i = 0; i < this.memoryContainer.length; i++) {
                for (let j = 0; j < this.memoryContainer[i].length; j++) {
                    if (j == 0) {
                        table += "<tr><td><b>" + "0x" + ((j + (256 * i)).toString(16).toUpperCase()).padStart(3, "0") + "</b></td>";
                    }
                    if (j % 8 == 0 && j != 0) {
                        table += "</tr><tr><td><b>" + "0x" + (j + (256 * i)).toString(16).toUpperCase().padStart(3, "0") + "</b></td>";
                        justCreated = true;
                    }
                    else {
                        if (justCreated) {
                            justCreated = false;
                            j--;
                        }
                        table += "<td>" + this.memoryContainer[i][j] + "</td>";
                    }
                }
            }
            table += "</table>";
            document.getElementById("MemoryTable").innerHTML = table;
        }
    }
    TSOS.Memory = Memory;
})(TSOS || (TSOS = {}));
//# sourceMappingURL=memory.js.map