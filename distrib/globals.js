/* ------------
   Globals.ts

   Global CONSTANTS and _Variables.
   (Global over both the OS and Hardware Simulation / Host.)

   This code references page numbers in our text book:
   Operating System Concepts 8th edition by Silberschatz, Galvin, and Gagne.  ISBN 978-0-470-12872-5
   ------------ */
//
// Global CONSTANTS (TypeScript 1.5 introduced const. Very cool.)
//
const APP_NAME = "ThanOS";
const APP_VERSION = "4.5.1";
const CPU_CLOCK_INTERVAL = 100; // This is in ms (milliseconds), so 1000 = 1 second.
//Interrupts
const TIMER_IRQ = 0; // Pages 23 (timer), 9 (interrupts), and 561 (interrupt priority).
// NOTE: The timer is different from hardware/host clock pulses. Don't confuse these.
const KEYBOARD_IRQ = 1;
const SOFTWARE_IRQ = 2;
const SYSTEM_CALL = 3;
//Scheduling
const QUANTUM_DEFAULT = 6; //Acts as a safety to the _Quantum variable just in case things break...
const SCHEDULE_DEFAULT = "rr"; //Acts as a safety to the _CurrentSchedule variable just in case things break...
const PRIORITY_DEFAULT = 5; //If the user does not input a priority for their programs, this is what it defaults to. Scaled out of 10, 1 being the smallest/highest.
//Disk(ing)
const MAX_TRACKS = 4;
const MAX_SECTORS = 8;
const MAX_BLOCKS = 8;
const MAX_BLOCK_SIZE = 64;
//
// Global Variables
// TODO: Make a global object and use that instead of the "_" naming convention in the global namespace.
//
var _CPU; // Utilize TypeScript's type annotation system to ensure that _CPU is an instance of the Cpu class.
var _OSclock = 0; // Page 23.
var _Mode = 0; // (currently unused)  0 = Kernel Mode, 1 = User Mode.  See page 21. (It's actually page 22 :3).
var _Canvas; // Initialized in Control.hostInit().
var _DrawingContext; // = _Canvas.getContext("2d");  // Assigned here for type safety, but re-initialized in Control.hostInit() for OCD and logic.
var _DefaultFontFamily = "sans"; // Ignored, I think. The was just a place-holder in 2008, but the HTML canvas may have use for it.
var _DefaultFontSize = 13;
var _FontHeightMargin = 4; // Additional space added to font size when advancing a line.
var _Trace = true; // Default the OS trace to be on.
// The OS Kernel and its queues.
var _Kernel;
var _KernelInterruptQueue = null;
var _KernelInputQueue = null;
var _KernelBuffers = null;
var _HasCrashed = false;
// Standard input and output
var _StdIn = null;
var _StdOut = null;
// UI
var _Console;
var _OsShell;
//Scheduling
var _Scheduler;
var _Quantum = 6;
var _ReadyPCB = [];
var _ResidentPCB = [];
var _Dispatcher;
var _CurrentSchedule;
var _Pointer = 0;
// At least this OS is not trying to kill you. (Yet.)
var _SarcasticMode = false;
// Global Device Driver Objects - page 12
var _krnKeyboardDriver = null;
var _hardwareClockID = null;
// For testing (and enrichment)...
var Glados = null; // This is the function Glados() in glados-ip*.js http://alanclasses.github.io/TSOS/test/ .
var _GLaDOS = null; // If the above is linked in, this is the instantiated instance of Glados.
//Memory
var _Memory;
var _MemoryAccessor;
var _MemoryManager = null;
var _PID = 0;
var _CurrentPCB;
var _SingleStep = false;
//Disk
var _Disk;
var _fsDD;
var _Swapper;
var onDocumentLoad = function () {
    TSOS.Control.hostInit();
    TSOS.Utils.clock();
};
//Other Managers
var _MusicManager = [];
var _TimerManager = [];
//Mission Critical
var _PetCounter = 0;
var _RequiredPets;
//# sourceMappingURL=globals.js.map