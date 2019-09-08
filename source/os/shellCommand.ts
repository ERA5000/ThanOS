module TSOS {
    /*Takes three parameters
        1. A function - what the command does
        2. A command - what to type into the cli to make that operation occur
        3. A description - text that describes the behavior
    */
    export class ShellCommand {
        constructor(public func: any,
                    public command: string = "",
                    public description: string = "") {
        }
    }
}
