var TSOS;
(function (TSOS) {
    /*Takes three parameters
        1. A function - what the command does
        2. A command - what to type into the cli to make that operation occur
        3. A description - text that describes the behavior
    */
    class ShellCommand {
        constructor(func, command = "", description = "") {
            this.func = func;
            this.command = command;
            this.description = description;
        }
    }
    TSOS.ShellCommand = ShellCommand;
})(TSOS || (TSOS = {}));
//# sourceMappingURL=shellCommand.js.map