var TSOS;
(function (TSOS) {
    class Disk {
        constructor(tracks, sectors, blocks, blockSize, isFormatted, storage) {
            this.tracks = tracks;
            this.sectors = sectors;
            this.blocks = blocks;
            this.blockSize = blockSize;
            this.isFormatted = isFormatted;
            this.storage = storage;
        }
    }
    TSOS.Disk = Disk;
})(TSOS || (TSOS = {}));
//# sourceMappingURL=disk.js.map