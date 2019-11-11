module TSOS{
    export class Disk{
        public tracks: number;
        public sectors: number;
        public blocks: number;
        public blockSize: number;
        public isFormatted: boolean;
        public storage: Storage;

        constructor(tracks, sectors, blocks, blockSize, isFormatted, storage){
            this.tracks = tracks;
            this.sectors = sectors;
            this.blocks = blocks;
            this.blockSize = blockSize;
            this.isFormatted = isFormatted;
            this.storage = storage;
        }
    }
}