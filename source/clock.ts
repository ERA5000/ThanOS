function clock(){
    var dateObject = new Date();
    var date = dateObject.toLocaleDateString("en-US");
    var time = dateObject.toLocaleTimeString("en-US");
    document.getElementById("date").innerHTML = date + "";
    document.getElementById("time").innerHTML = time + "";
    window.setTimeout(clock, 1000);
}
clock();