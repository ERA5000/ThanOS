/**
 * I made this new object to help organize my timers. I used just as many (if not more) for dog, and realized my current handling of them,
 *  passing them as parameters to new functions, is not great.
 * So I made this object to help manage them.
 * 
 * At some point, I will make a getter method to search for these objects by their properties in the global arrays. This is so I do not have to
 *  iterate through the arrays every single time since I may not immediately have access to the object itself when I want it.
 */

module TSOS{
    export class Interval{

        name: string;
        intervalID: number;

        constructor(name: string, id: number){
            this.name = name;
            this.intervalID = id;
        }
    }
}