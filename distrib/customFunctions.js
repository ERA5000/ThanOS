/*
Just a simple clock function.
It calls itself every second and updates its respective <p> elements, one for the date and the other for time.
Definitely an easy/clean implentation.
*/
function clock() {
    var dateObject = new Date();
    var date = dateObject.toLocaleDateString("en-US");
    var time = dateObject.toLocaleTimeString("en-US");
    document.getElementById("date").innerHTML = date + "";
    document.getElementById("time").innerHTML = time + "";
    window.setTimeout(clock, 1000);
}
clock();

/* The Crème de la crème of ThanOS, the snap function.
This introduced me to the setTimeout and setInterval functions which are really useful for timing events very precisely and in a quantifiable manner.
Both the overlay and the progress bar needed 'real-time updating,' so being able to call them using setInterval made things significantly easier.
    I could have functionally defined the behavior (ex: setInterval({}, 1000)), but creating them as separate methods helped to keep me organized... 
    plus, we're using typescript so it's also in spirit of.
The function was a lot of fun to build, and I am so glad it all came together.
These functions are defined here because TS has some issues with media,
    (i.e. it does not recognize play()/pause() when called on a video element. Of course, JS would internalize it just fine when compiled, 
        but seeing the redline bothered me / is bad practice).
Also, I loaded the audio here, as opposed to being an HTML element, because I just could not get those to work.
    As an object, I know they will function properly.
Finally, the function call is linked to a button because that is what I initially used for testing, but I wanted it to be a command (as per the surprise).
    So, I simply hid the button, and tied a digital click to the command.
*/
function snap() {
    _Kernel.krnDisableInterrupts();
    var overlay = document.getElementById("overlay");
    overlay.style.display = "initial";
    var video = document.getElementById("video");
    video.style.display = "initial";
    video.autoplay = true;
    var dimTimerID = setInterval(this.dimDisplay, 100, overlay, video);
    setTimeout(this.pauseVideo, 11500, video, dimTimerID);
}

//This function pauses the video because when HTML videos end, they kinda just keep going... so to prevent anything funky, I just stop it manually.
//The clearInterval function also stops any setInterval timers... the goal is to prevent any memory leaks or other weird behavior.
function pauseVideo(videoElem, dimTimerID) {
    videoElem.pause();
    video.style.display = "none";
    clearInterval(dimTimerID);
    setTimeout(this.reboot, 3000);
}

//Dims the overlay as the video plays
function dimDisplay(overlay, video) {
    if (overlay.style.opacity >= 1) {
        return;
    }
    else {
        overlay.style.opacity = (video.currentTime / video.duration) * 2;
    }
}

//This starts the 'reboot' process.
//It first loads the progress bar and the AOL dial-up noise for a nice throwback
//It then calls the other two methods with timed delays
function reboot(){

    var progressBar = document.getElementById("progress");
    var rebootAudio = new Audio("distrib/resources/audio/reboot.mp3");

    progressBar.style.display = "initial";
    rebootAudio.play();
    var progressTimeID = setInterval(loadBar, 100, progressBar, rebootAudio, progressTimeID);
    setTimeout(loadLogo, 12000);
}

//Fills the progress bar gradually
function loadBar(progressBar, rebootAudio, progressTimeID){
    progressBar.value = Math.round(rebootAudio.currentTime / rebootAudio.duration * 100);
    if(progressBar.value >= 100) {
        clearInterval(progressTimeID);
    }
}

//Places the logo on the screen and plays the traditional Mac startup noise
function loadLogo(){
    var logo = document.getElementById("logo");
    var startupAudio = new Audio("distrib/resources/audio/startup.mp3");
    logo.style.display = "initial";
    startupAudio.play();
    setTimeout(refresh, 4500);
}

//Refreshes the page to complete the process
function refresh(){
    location.reload();
}
//# sourceMappingURL=customFunctions.js.map