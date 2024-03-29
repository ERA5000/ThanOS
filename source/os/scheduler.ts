module TSOS{
    export class Scheduler{

    /* So what is this 'logic continuity module' I keep referring to? (I hope I have been typing it elsewhere... Otherwise, this is what it is)
        It essentially defines the combinations (and permutations?) in which the commands load, run, runall, kill, killall, and clearmem
        interact with each other. I have tried to make these interactions as intuitive as possible by adhering to these three ideas:
            1. Program the command to do what the user would expect.
            2. Implement functionality specifically requested of Alan (That's you).
            3. In any scenario of conflict, assume the worst case and ideally how it would want to be solved.
                As an example, the clearmem command acts a nuke so it stops execution and wipes memory, as if nothing had ever happened
                to prevent rogue/zombie programs from going hay-wire.
    
    Functionally, between the commands load, run, runall, kill, killall, and clearmem this is the continuity of the code:
        load -> Resident Q
        run -> splices from Resident Q, places onto Ready Q
        runall -> splices from Resident Q, places onto Ready Q
        kill -> splices from Ready Q
        killall -> splices from Ready Q
        clearmem -> Only clears programs that are 'Resident'

        If at any point this traversal pattern is infringed, everything will probably break. Also, apparently 'slice' and 'splice' are both valid Array methods...
            A typo lost me a good hour, so just to be clear, we want *splice* (with a p).
    */
        public cycle = 1;

        public schedulerInterrupt(scheduleType: string){
            switch(scheduleType) {
                case "fcfs":
                    this.firstComeFirstServe();
                    break;
                case "priority":
                    this.priority();
                    break;
                case "rr":
                    this.roundRobin();
                    break;
                default:
                    SCHEDULE_DEFAULT;
                    break;
            }
            this.addTurnaroundTime();
            this.addWaitTime();
        }

        /*This method updates the pointer for the Ready Queue depending on the schedule.
          This functionality had to be modularized from PCBSwitch because Swapping should be
            the Kernel's responsibility, but in order to accomplish that these behaviors of A)
            updating the pointer and B) actually changing the _CurrentPCB needed to be separated
            (even though they are very closely related).
          Now this may give the appearance that Swapping is tightly-coupled to Context Switching... and it will be.
          While the behavior itself should not intrinsically be so, this is just an unfortunate
            consequence of how my code is laid out. Obviously if a single program exists on disk
            without anything being in memory, however unlikely that may be for our OSs, it should still
            be able to move to memory to execute. So, because of how this culiminated, 
            the default behavior will be to have it this way and a single 'run' be the exception.
          The theory is, especially for us at least, that swapping should not occur if some segment
            is available (bc then the code would just go into that segment), but it seems that it can
            happen.
          My analysis could be (and probably is) wrong about why this works the way it does (I'm having doubts
            as I write this). It rides on certain observations and assumptions. Nonetheless, since it works, and
            these are *not* canonical answers after all, I'll leave it as is.

        Update (1 to 2 commits later) Since the Disk now exists, it is very possible to assume programs can
            sit on Disk without anything being in memory. I am writing this after doing extensive testing with
            run vs runall and timing load commands during specific states of the OS. My bad. The Swapper has two
            methods now, check the second one's comments for more info (swapFor).
        */
        public setPointer(schedule: string){
            if(schedule == "rr") {
                if(_Pointer < 0) _Pointer = 0;
                if(this.cycle >= 6) _Pointer++;
                if(_Pointer >= _ReadyPCB.length) _Pointer = 0;
            }
            else if(schedule == "fcfs"){
                _Pointer = 0;
                let first = _ReadyPCB[_Pointer];
                for(let i = 0; i < _ReadyPCB.length; i++){
                    if(_ReadyPCB[i].pid < first.pid){
                        first = _ReadyPCB[i];
                        _Pointer = i;
                    }
                }
            }
            else if(schedule == "priority"){
                _Pointer = 0;
                let highest = _ReadyPCB[_Pointer];
                for(let i = 0; i < _ReadyPCB.length; i++){
                    if(_ReadyPCB[i].priority < highest.priority){
                        highest = _ReadyPCB[i];
                        _Pointer = i;
                    }
                }
            }
            else{
                _Kernel.krnTrapError("Invalid Scheduling Scheme. Terminating OS.");
                _CPU.isExecuting = false;
                _CPU.hasExecutionStarted = false;
                _MemoryManager.wipeSegmentByID();
                return;
            }
        }

        /*Actually switches two PCBs when a context switch has been requested.
        */
        public PCBSwitch(){
            _Dispatcher.snapshot(_CurrentPCB);
            if(_CurrentPCB.state == "Running") _CurrentPCB.state = "Ready";
            Utils.updatePCBRow(_CurrentPCB);
            _CurrentPCB = _ReadyPCB[_Pointer];
            _Dispatcher.reinstate(_CurrentPCB);
            _CurrentPCB.state = "Running";
            Utils.updatePCBRow(_CurrentPCB);
            this.cycle = 1;
        }

        /*The Round Robin scheduling scheme. If either the cycle limit is exceeded or a process ends, and as long as there is at least a program
            to execute, create a software interrupt to switch to another program (I explain why we check for one program not two for an interrupt below).
        I then explicitly check for Termination because if a program ends, the pointer has to be back-peddled one because the array itself changes size.

        UPDATE: 10.17.19
        TL;DR - Fixed a bug: Context switches won't happen if only one process is left.

        I (hopefully) fixed a ratched bug that was creating a nightmare for me.
            I initially failed to realize that, when there is a single program left, it still does a context switch -- which is bad. And wrong.
            So, I implemented code here and in CPU (hasProccessEnded boolean) to check for if a single program was left, so it would not do that.
            Apparently, my first attempt, a boolean I aptly named 'finished' (replaced by hasProcessEnded, check older commits) 
                worked by *coincidence* because it was a global variable! I won't get into the whole 'how it was a coincidence' thing, but it happened to work (boo globals).

            So, to remedy all of these issues, here is what the code below does:
                if there is only one thing left to run AND if the process has not been updated to the next one, update it. <-- This is what I forgot to do.
                    otherwise (or now), execute the final process. <-- I wrote code that was only doing this, so it would crash from the discrepancy.
                if a program either terminates, or uses all of its cycles and there is something to switch to, context switch to it.

            But now your probably wondering, if there is only one thing in the queue, what are you switching to? What discrepancy?
            Well, here is the quirk of my code, I suppose: _CurrentPCB and its equivalent in ReadyPCB[] are different instances.
                The ReadyPCB[] is what can be executed upon, while _CurrentPCB is what the CPU is literally handling in the moment.
            When a program ends, I remove it from the ReadyPCB[], but _CurrentPCB does not get updated since I wanted to leave it to the scheduler to do that.
                (Because if I could assign _CurrentPCB at-will, what's the point of the scheduler? :P).
            This (complicated) solution brings me to the code I have. I will hopefully return to clean it since it may be redundant and not optimized, but it works... for now
        
            As far as counting wait time and turn around time, everytime a context switch takes place we DON'T want to count that towards our cycle count since
                a context switch itself is not a cycle.

            Update 11/4/19: this.cycle >= _Quantum is now inclusive since it checks after it increases, making it correctly do 6 instead of 7 cycles
            */
        public roundRobin(): void{
            let interrupt = new TSOS.Interrupt(SOFTWARE_IRQ, [0]);
            if(_ReadyPCB.length == 1){
                _Pointer = 0;
                if(_CurrentPCB.pid != _ReadyPCB[_Pointer].pid){
                    _Kernel.krnTrace("Context Switch via Round Robin");
                    _KernelInterruptQueue.enqueue(interrupt);
                }
                else{
                    this.cycle++;
                    if(this.cycle > 6) this.cycle = 1;
                    _ReadyPCB[_Pointer].turnaroundTime++;
                }
                return;
            }
            if((_CurrentPCB.state == "Terminated" || this.cycle >= _Quantum) && _ReadyPCB.length > 0) {
                if(_CurrentPCB.state == "Terminated") _Pointer--;
                if(_ReadyPCB.length > 1) _Kernel.krnTrace("Context Switch via Round Robin");
                _KernelInterruptQueue.enqueue(interrupt);
                return;
            }
            else {
                if(_ReadyPCB.length == 0) {
                    _CPU.hasExecutionStarted = false;
                    _CPU.isExecuting = false;
                    this.cycle = 1;
                    _CPU.init();
                }
                else this.cycle++;
            }
        }

        /**
         * First Come First Serve scheduling scheme.
         * On intial run, it simply executes the programs in order.
         * While running, it first checks to see which PCB has the lowest PID and then runs that program.
         */
        public firstComeFirstServe(): void{
            let interrupt = new TSOS.Interrupt(SOFTWARE_IRQ, [0]);
            if(_ReadyPCB.length == 1){
                _Pointer = 0;
                if(_CurrentPCB.pid != _ReadyPCB[_Pointer].pid){
                    _Kernel.krnTrace("Context Switch via First Come First Serve");
                    _KernelInterruptQueue.enqueue(interrupt);
                    return;
                }
            }
            else if(_CurrentPCB.state == "Terminated" && _ReadyPCB.length > 0) {
                _Pointer--;
                if(_ReadyPCB.length > 1) _Kernel.krnTrace("Context Switch via First Come First Serve");
                _KernelInterruptQueue.enqueue(interrupt);
                return;
            }
            else {
                if(_ReadyPCB.length == 0) {
                    _CPU.hasExecutionStarted = false;
                    _CPU.isExecuting = false;
                    this.cycle = 1;
                    _CPU.init();
                }
            }
        }

        /**
         * Priority scheduling scheme.
         * On initial run, as of now, it does NOT check priority since the programs all share priority.
         * While running, it first checks to see which PCB has the highest priority (lowest literal value) and then runs that program.
         */
        public priority(): void{
            let interrupt = new TSOS.Interrupt(SOFTWARE_IRQ, [0]);
            if(_ReadyPCB.length == 1){
                _Pointer = 0;
                if(_CurrentPCB.pid != _ReadyPCB[_Pointer].pid){
                    _Kernel.krnTrace("Context Switch via Priority");
                    _KernelInterruptQueue.enqueue(interrupt);
                    return;
                }
            }
            else if(_CurrentPCB.state == "Terminated" && _ReadyPCB.length > 0) {
                _Pointer--;
                if(_ReadyPCB.length > 1) _Kernel.krnTrace("Context Switch via Priority");
                _KernelInterruptQueue.enqueue(interrupt);
                return;
            }
            else {
                if(_ReadyPCB.length == 0) {
                    _CPU.hasExecutionStarted = false;
                    _CPU.isExecuting = false;
                    this.cycle = 1;
                    _CPU.init();
                }
            }
        }

        /* Adds 1 to each PCB after every cycle count.
        */
        public addTurnaroundTime(): void{
            for(let i = 0; i < _ReadyPCB.length; i++){
                _ReadyPCB[i].turnaroundTime++;
            }
        }

        /* Adds 1 to each PCB after every cycle count IF it is NOT running.
        */
        public addWaitTime(): void{
            for(let i = 0; i < _ReadyPCB.length; i++){
                if(_ReadyPCB[i].pid != _CurrentPCB.pid){
                    _ReadyPCB[i].waitTime++;
                }
            }
        }
    }
}

/* Test programs of length 12 each.
A9 00 A9 02 A9 04 A9 06 A9 08 A9 10 A9 12 A9 14 A9 16 A9 18 A9 20 A9 22 A9 24 

A9 01 A9 03 A9 05 A9 07 A9 09 A9 11 A9 13 A9 15 A9 17 A9 19 A9 21 A9 23 A9 25

A9 A9 A9 A9 A9 A9 A9 A9 A9 A9 A9 A9 A9 A9 A9 A9 A9 A9 A9 A9 A9 A9 A9 A9 A9 A9

EA EA EA EA EA EA EA EA EA EA EA EA EA EA EA EA EA EA EA EA EA EA EA EA EA EA

EA A9 EA A9 EA A9 EA A9 EA A9 EA A9 EA A9 EA A9 EA A9 EA A9 EA A9 EA A9 EA A9
*/