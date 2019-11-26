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
        swapWith(toRollIn, toRollOut) {
            let dataFromMem = _MemoryAccessor.getSegData(toRollOut.segment);
            _MemoryManager.wipeSegmentByID(toRollOut.segment);
            _MemoryAccessor.write(toRollOut.segment, _fsDD.readFile(`@swap${toRollIn.pid}`));
            _fsDD.deleteFile(`@swap${toRollIn.pid}`);
            _fsDD.createFile(`@swap${toRollOut.pid}`);
            _fsDD.writeToFile(`@swap${toRollOut.pid}`, dataFromMem);
            toRollIn.segment = toRollOut.segment;
            toRollOut.segment = -1;
        }
        /*Because the Disk now exists, it is possible that a program can sit on Disk
            without anything being in memory. Because of how I've implemented everything,
            there needs to be a way to simply throw something from the Disk into memory, so
            this method solves that use-case.
        The idea is that swapWith() is a method to swap PCB A 'with' PCB B. But this method, swapFor(),
            handles that manually, as though it were swapping 'for' PCB A.

        Something of note, and a little unrelated, but because of all these 'inconsistencies,' the PCB display
            may look as though more than 3 programs are in memory at once. I assure you this is most certaintly
            NOT the case.
        The important thing to note is the State of the Process. All Terminated processes are removed from
            the OS entirely. Therefore, if it is Terminated, its Location represents where it was placed when
            execution completed.
            As long as three Processes State's do not "Ready" and their Locations
                do not concurrently say "Memory", then everything is working as intended.
        */
        swapFor(toRollIn) {
            let segment = _MemoryManager.getNextAvailableSegment();
            _MemoryManager.wipeSegmentByID(segment);
            _MemoryAccessor.write(segment, _fsDD.readFile(`@swap${toRollIn.pid}`));
            toRollIn.segment = segment;
        }
    }
    TSOS.Swapper = Swapper;
})(TSOS || (TSOS = {}));
//# sourceMappingURL=swapper.js.map