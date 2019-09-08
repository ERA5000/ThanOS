/* ----------------------------------
   DeviceDriverKeyboard.ts

   The Kernel Keyboard Device Driver.
   ---------------------------------- */

module TSOS {

    // Extends DeviceDriver
    export class DeviceDriverKeyboard extends DeviceDriver {

        constructor() {
            // Override the base method pointers.

            // The code below cannot run because "this" can only be
            // accessed after calling super.
            // super(this.krnKbdDriverEntry, this.krnKbdDispatchKeyPress);
            // So instead...
            super();
            this.driverEntry = this.krnKbdDriverEntry;
            this.isr = this.krnKbdDispatchKeyPress;
        }

        public krnKbdDriverEntry() {
            // Initialization routine for this, the kernel-mode Keyboard Device Driver.
            this.status = "loaded";
            // More?
        }

        public krnKbdDispatchKeyPress(params) {
            // Parse the params.  TODO: Check that the params are valid and osTrapError if not.
            var keyCode = params[0];
            var isShifted = params[1];
            _Kernel.krnTrace("Key code:" + keyCode + " shifted:" + isShifted);
            var chr = "";
            // Check to see if we even want to deal with the key that was pressed.
            if (keyCode >= 65 && keyCode <= 90) { // letter
                if (isShifted === true) { 
                    chr = String.fromCharCode(keyCode); // Uppercase A-Z
                } else {
                    chr = String.fromCharCode(keyCode + 32); // Lowercase a-z
                }
                // TODO: Check for caps-lock and handle as shifted if so.
                _KernelInputQueue.enqueue(chr);
            }
            else if (keyCode >= 48 && keyCode <= 57){      // numbers
                if(isShifted === true){
                    switch(keyCode){
                        case 49:
                            chr = String.fromCharCode(33); // !
                            break;
                        case 50:
                            chr = String.fromCharCode(64); // @
                            break;
                        case 51:
                            chr = String.fromCharCode(35); // #
                            break;
                        case 52:
                            chr = String.fromCharCode(36); // $
                            break;
                        case 53:
                            chr = String.fromCharCode(37); // %
                            break;
                        case 54:
                            chr = String.fromCharCode(94); // ^
                            break;
                        case 55:
                            chr = String.fromCharCode(38); // &
                            break;
                        case 56:
                            chr = String.fromCharCode(42); // *
                            break;
                        case 57:
                            chr = String.fromCharCode(40); // (
                            break;
                        case 48:
                            chr = String.fromCharCode(41); // )
                            break;
                    }
                }
                else chr = String.fromCharCode(keyCode);
                _KernelInputQueue.enqueue(chr);
            } else if (keyCode == 32 || keyCode == 13 || keyCode == 8 || keyCode == 9           // enter, space, delete, and tab respectively
                || keyCode == 38 || keyCode == 40){                                             // up and down respectively
                chr = String.fromCharCode(keyCode);
                _KernelInputQueue.enqueue(chr);
            } else if (keyCode >= 96 && keyCode <= 105){         // numpad numbers
                chr = String.fromCharCode(keyCode - 48);
                _KernelInputQueue.enqueue(chr);
            } else {
                if(isShifted === false){
                    switch(keyCode){
                        case 59:
                            chr = String.fromCharCode(59); // ;
                            break;
                        case 61:
                            chr = String.fromCharCode(61); // =
                            break;
                        case 106:
                            chr = String.fromCharCode(42) // * (numpad)
                            break;
                        case 107:
                            chr = String.fromCharCode(43) // + (numpad)
                            break;
                        case 109:                          // (numpad)
                        case 173:
                            chr = String.fromCharCode(45); // -
                            break;                            
                        case 188:
                            chr = String.fromCharCode(44); // ,
                            break;
                        case 110:                          // (numpad)
                        case 190:
                            chr = String.fromCharCode(46); // .
                            break;
                        case 111:                          // (numpad)
                        case 191:
                            chr = String.fromCharCode(47); // /
                            break;
                        case 192:
                            chr = String.fromCharCode(96); // `
                            break;
                        case 219:
                            chr = String.fromCharCode(91); // [
                            break;                            
                        case 220:
                            chr = String.fromCharCode(92); // \
                            break;
                        case 221:
                            chr = String.fromCharCode(93); // ]
                            break;
                        case 222:
                            chr = String.fromCharCode(39); // '
                            break;
                    }
                }
                else {
                    switch(keyCode){
                        case 59:
                            chr = String.fromCharCode(58); // :
                            break;
                        case 61:
                            chr = String.fromCharCode(43); // +
                            break;
                        case 173:
                            chr = String.fromCharCode(95); // _
                            break;
                        case 188:
                            chr = String.fromCharCode(60); // <
                            break;
                        case 190:
                            chr = String.fromCharCode(62); // >
                            break;
                        case 191:
                            chr = String.fromCharCode(63); // ?
                            break;
                        case 192:
                            chr = String.fromCharCode(126); // ~
                            break;
                        case 219:
                            chr = String.fromCharCode(123); // {
                            break;                            
                        case 220:
                            chr = String.fromCharCode(124); // |
                            break;
                        case 221:
                            chr = String.fromCharCode(125); // }
                            break;
                        case 222:
                            chr = String.fromCharCode(34); // "
                            break;
                    }
                }
                _KernelInputQueue.enqueue(chr);
            }

        }
    }
}
