/* --------
   Utils.ts

   Utility functions.
   -------- */
var TSOS;
(function (TSOS) {
    class Utils {
        static trim(str) {
            // Use a regular expression to remove leading and trailing spaces.
            return str.replace(/^\s+ | \s+$/g, "");
            /*
            Huh? WTF? Okay... take a breath. Here we go:
            - The "|" separates this into two expressions, as in A or B.
            - "^\s+" matches a sequence of one or more whitespace characters at the beginning of a string.
            - "\s+$" is the same thing, but at the end of the string.
            - "g" makes is global, so we get all the whitespace.
            - "" is nothing, which is what we replace the whitespace with.
            */
        }
        static rot13(str) {
            /*
               This is an easy-to understand implementation of the famous and common Rot13 obfuscator.
               You can do this in three lines with a complex regular expression, but I'd have
               trouble explaining it in the future.  There's a lot to be said for obvious code.
            */
            var retVal = "";
            for (var i in str) { // We need to cast the string to any for use in the for...in construct.
                var ch = str[i];
                var code = 0;
                if ("abcedfghijklmABCDEFGHIJKLM".indexOf(ch) >= 0) {
                    code = str.charCodeAt(Number(i)) + 13; // It's okay to use 13.  It's not a magic number, it's called rot13.
                    retVal = retVal + String.fromCharCode(code);
                }
                else if ("nopqrstuvwxyzNOPQRSTUVWXYZ".indexOf(ch) >= 0) {
                    code = str.charCodeAt(Number(i)) - 13; // It's okay to use 13.  See above.
                    retVal = retVal + String.fromCharCode(code);
                }
                else {
                    retVal = retVal + ch;
                }
            }
            return retVal;
        }
        /*A simple method to verify hex input data using RegEx
        I think this turned into one of the those logical 'proofs' where finding the negation is easier,
            which is why I look for *anything* that is NOT a-f, 0-9, space, newline and carriage return*/
        static verifyInput() {
            let text = document.getElementById("taProgramInput").value;
            let validHex = /[^a-f0-9 \r\n]+/img;
            if (validHex.test(text)) {
                _StdOut.putText("Hex input is NOT valid!");
            }
            else {
                _StdOut.putText("Hex input is valid!");
            }
        }
        /* The Crème de la crème of ThanOS, the snap function.
        This introduced me to the setTimeout and setInterval functions which are really useful for timing events very precisely and in a quantifiable manner.
        Both the overlay and the progress bar needed 'real-time updating,' so being able to call them using setInterval made things significantly easier.
            I could have functionally defined the behavior (ex: setInterval({}, 1000)), but creating them as separate methods helped to keep me organized...
            plus, we're using typescript so it's also in spirit of.
        The function was a lot of fun to build, and I am so glad it all came together.
        Also, I loaded the audio here, as opposed to being an HTML element, because I just could not get those to work.
            As an object, I know they will function properly.
        */
        static snap() {
            _Kernel.krnDisableInterrupts();
            var overlay = document.getElementById("overlay");
            overlay.style.display = "initial";
            var video = document.getElementById("video");
            video.style.display = "initial";
            video.play();
            var dimTimerID = setInterval(this.dimDisplay, 100, overlay, video);
            setTimeout(this.pauseVideo, 11500, video, dimTimerID);
        }
        //This method pauses the video because when HTML videos end, they kinda just keep going... so to prevent anything funky, I just stop it manually.
        //The clearInterval function also stops any setInterval timers... the goal is to prevent any memory leaks or other weird behavior.
        static pauseVideo(videoElem, dimTimerID) {
            videoElem.pause();
            videoElem.style.display = "none";
            clearInterval(dimTimerID);
            setTimeout(Utils.reboot, 1750);
        }
        //Dims the overlay as the video plays
        static dimDisplay(overlay, video) {
            if (overlay.style.opacity >= 1)
                return;
            else
                overlay.style.opacity = (video.currentTime / video.duration) * 2;
        }
        //This starts the 'reboot' process
        //It first loads the progress bar and the AOL dial-up noise for a nice throwback
        //It then calls the other two methods with timed delays
        static reboot() {
            var progressBar = document.getElementById("progress");
            var rebootAudio = new Audio("distrib/resources/audio/reboot.mp3");
            progressBar.style.display = "initial";
            rebootAudio.play();
            var progressTimeID = setInterval(Utils.loadBar, 100, progressBar, rebootAudio, progressTimeID);
            setTimeout(Utils.loadLogo, 12000);
        }
        //Fills the progress bar gradually
        //It uses the audio feedback duration as a means of timing how long it should load for, so they'll finish at the same time
        static loadBar(progressBar, rebootAudio, progressTimeID) {
            progressBar.value = Math.round(rebootAudio.currentTime / rebootAudio.duration * 100);
            if (progressBar.value >= 100)
                clearInterval(progressTimeID);
        }
        //Places the logo on the screen and plays the traditional Mac startup noise
        static loadLogo() {
            var logo = document.getElementById("logo");
            var startupAudio = new Audio("distrib/resources/audio/startup.mp3");
            logo.style.display = "initial";
            startupAudio.play();
            setTimeout(Utils.refresh, 4500);
        }
        //Refreshes the page to complete the process
        static refresh() {
            location.reload();
        }
    }
    TSOS.Utils = Utils;
})(TSOS || (TSOS = {}));
//# sourceMappingURL=utils.js.map