var TSOS;
(function (TSOS) {
    class Swapper {
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
        swap(toRollIn, toRollOut) {
            let dataFromMem = _MemoryAccessor.getSegData(toRollOut.segment);
            _MemoryManager.wipeSegmentByID(toRollOut.segment);
            _MemoryAccessor.write(toRollOut.segment, _fsDD.readFile(`@swap${toRollIn.pid}`));
            _fsDD.deleteFile(`@swap${toRollIn.pid}`);
            _fsDD.createFile(`@swap${toRollOut.pid}`);
            _fsDD.writeToFile(`@swap${toRollOut.pid}`, dataFromMem);
            toRollIn.segment = toRollOut.segment;
            toRollOut.segment = -1;
        }
    }
    TSOS.Swapper = Swapper;
})(TSOS || (TSOS = {}));
//# sourceMappingURL=swapper.js.map