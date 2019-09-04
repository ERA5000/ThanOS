/*
Just a simple clock function.
It calls itself every second and updates their respective <p> elements.
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
    I could have functionally defined the behavior, but creating them as separate methods helped to keep me organized... 
    plus, we're using typescript so it's also in spirit of.
The function was a lot of fun to build, and I am so glad it all came together.
These functions are defined here because TS has some issues with media,
    (i.e. it does not recognize play()/pause() when called on a video element. Ofc, JS would internalize it just fine, 
        but seeing the redline bothered me / is bad practice)
Also, I loaded the audio here, as opposed to being an HTML element, because I just could not get those to work.
    As an object, I know they will function properly.
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

function pauseVideo(videoElem, dimTimerID) {
    videoElem.pause();
    clearInterval(dimTimerID);
    setTimeout(this.reboot, 3000);
}

function dimDisplay(overlay, video) {
    if (overlay.style.opacity >= 1) {
        return;
    }
    else {
        overlay.style.opacity = (video.currentTime / video.duration) * 2;
    }
}

function reboot(){

    var progressBar = document.getElementById("progress");
    var rebootAudio = new Audio("distrib/resources/audio/reboot.mp3");

    progressBar.style.display = "initial";
    rebootAudio.play();
    var progressTimeID = setInterval(loadBar, 100, progressBar, rebootAudio, progressTimeID);
    setTimeout(loadLogo, 12000);
}

function loadBar(progressBar, rebootAudio, progressTimeID){
    progressBar.value = Math.round(rebootAudio.currentTime / rebootAudio.duration * 100);
    if(progressBar.value >= 100) {
        clearInterval(progressTimeID);
    }
}

function loadLogo(){
    var logo = document.getElementById("logo");
    var startupAudio = new Audio("distrib/resources/audio/startup.mp3");
    logo.style.display = "initial";
    startupAudio.play();
    setTimeout(refresh, 4500);
}

function refresh(){
    location.reload();
}
//# sourceMappingURL=customFunctions.js.map