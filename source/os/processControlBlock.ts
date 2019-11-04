module TSOS {

    export class ProcessControlBlock {

        PC: number;
        Acc: number;
        Xreg: number;
        Yreg: number;
        Zflag: number;
        pid: number;
        segment: number;
        priority: number;
        state: string;
        location: string;
        base: number;
        limit: number;
        turnaroundTime: number;
        waitTime: number;

        /*As of 10.28.19, based on our class discussion, this might (definitely) need to be changed
            when swapping is implemented... See the function description below as to why.
        */
        private readonly segHash: number;
        

        constructor(segment: number){
            this.PC = 0;
            this.Acc = 0;
            this.Xreg = 0;
            this.Yreg = 0;
            this.Zflag = 0;
            this.pid = _PID;
            _PID++;
            this.state = "Resident";
            this.priority = 7;
            this.segment = segment;
            this.determineRange();
            this.turnaroundTime = 0;
            this.waitTime = 0;
            this.segHash = segment;
        }

        //Given access to a physical segment, determines the base and limit registers of the PCB
        private determineRange(): void{
            if(this.segment == 0){
                this.base = 0;
                this.limit = 255;
            }
            else if(this.segment == 1){
                this.base = 256;
                this.limit = 511;
            }
            else {
                this.base = 512;
                this.limit = 767;
            }
        }

        /* I know you said a PCB is really more of a data structure, so it should not be doing much (if anything at all as far as methods go) but I wanted to make
            segHash private for 'extra' security, so it needs a getter.
        Anyway, segHash is my attempt at preventing illegal reads and writes. Since my memory is physically (architecturely :D ) different from the implementation discussed in class
            (1 array of 767 length as opposed to my two-dimensional array) I wanted to add software-based security too. For reference, the 'memory bounds checker'
                on your website fails not because of any security I have, but the program simply cannot interpret the 2-d array structure properly. So, I'm safeguarded,
                but for the wrong reasons, which I hate... and is bad practice anyway. (It took the CPU's PC to be 800+ in hex for me to figure something was weird)
            So, before this, if a PCB segment was changed, nothing was preventing it from continuing execution in the now new and most-definitely wrong segment.
        With this, however, when a PCB is created, it gets assigned a segment. To make sure there is no befuddlement, I then assign this segment to a one-time-write, readonly, private class
            member, segHash. When memory is then (attempted to be) read from or written to, if there is tomfoolery afoot (i.e. the segments don't match) it'll throw an error.

        Also, TS and JS apparently do not have built-in hash functions, so that's disappointing. I figured this was the next best thing.

        But now, learning as of 11/4/19, there is no guarantee that when a program is swapped that it will return to the same segment.
        I'll keep it for now, but remove it for iProject4.
        */
        public getSegHash(){return this.segHash;}
    }
}