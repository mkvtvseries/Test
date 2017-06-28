// ==UserScript==
// @name         BS Autoplay
// @namespace    http://tampermonkey.net/
// @version      0.4
// @description  Folgen automatisch wiedergeben!
// @author       jonnyy / High_village
// @icon         https://bs.to/favicon.ico
// @match        http://*/*
// @match        https://*/*
// @match        *://*
// @grant        none
// donationsURL paypal.me/JonathanHeindl :3
// ==/UserScript==

 
var time_before_next_episode=10;  //if less than *time_before_next_episode* seconds remain until video is finished the next video gets called
 
 
var nexturl="";
(function() {
    'use strict';
    var vid;
    if(location.href.indexOf("https://bs.to/serie")>-1){
        mainpage();
    }else if(location.href.indexOf("https://bs.to/out/")>-1){
 
    }else if(location.href.indexOf("https://openload.co/embed/")>-1){ //works for openload and openloadhd
        checkvideo(document.getElementById("olvideo_html5_api"));
        setTimeout(function(){
            debugger;
            document.getElementsByClassName("vjs-big-play-button")[0].click();
        },1000);
    }else if(location.href.indexOf("https://bs.to/out/")>-1){
 
    }else if(location.href.indexOf("https://bs.to/out/")>-1){
        //in progress getting the video elements of each hoster
    }else if(location.href.indexOf("https://thevideo.me/embed")>-1){
        function check(){
            if(document.getElementsByClassName("jw-controlbar jw-background-color jw-reset")[0]){
                checkvideo(document.getElementsByClassName("jw-controlbar jw-background-color jw-reset")[0]);
            }else{
                setTimeout(check,2000);
            }
        }
        setTimeout(check,2000);
    }else if(location.href.indexOf("https://streamango.com/embed/")>-1){
        checkvideo(document.getElementById("mgvideo_html5_api"));
    }else if(location.href.indexOf("facebook")>-1||location.href.indexOf("recaptcha")>-1){
        if(location.href.indexOf("www.google.com/recaptcha/api2")>-1){
            setTimeout(function () {
                try{
                    document.getElementsByClassName("recaptcha-checkbox-checkmark")[0].click();
                }catch(e){
                     
                }
            }, 500);
        }
    }else{
        //debugger;
        return;
    }
    // Your code here...
})();
 
function mainpage(){
    function receiveMessage(event){
        if(event.data.target==="https://bs.to/serie"){
            if(event.data.msg==="next"){
                setnext();
            }
        }
    }
    function setnext(){
        if(nexturl!==""){
            location.href=nexturl;
        }
    }
    function chooselink(hoster){
        var embededhoster=["OpenLoad","TheVideo","Streamango"];
        var hostername=location.href.split("/");
        hostername=hostername[hostername.length-1];
        var found=false;
        for(var j in hoster){
            if(hoster[j].className.indexOf(hostername)>-1){
                found=true;
                nexturl=hoster[j].href;
                break;
            }
        }
        if(!found){
            for(var k in hoster){
                for(var m in embededhoster){
                    if(hoster[k].className.indexOf(embededhoster[m])>-1){
                        found=true;
                        nexturl=hoster[k].href;
                        break;
                    }
                }
                if(found){
                    break;
                }
            }
        }
        if(!found){
            if(hosters[0]){
                nexturl=hosters[0].href;
            }
        }
    }
    window.top.addEventListener("message", receiveMessage, false);
    setTimeout(function getnexturl(){
        var episodes=document.getElementsByClassName("clearfix")[1].children;
        var episodesinfo=document.getElementsByClassName("episodes")[0].children;
        for(var i=0;i<episodes.length;i++){
            if(episodes[i].className==="active"){
 
                if(i+1<episodes.length){
                    var hoster=episodesinfo[i+3+1].children;
                    chooselink(hoster);
                }else{
                    var series=document.getElementsByClassName("clearfix")[0].children;
                    for(var k=0;k<series.length;k++){
                        if(series[k].className==="active"){
                            if(k<series.length){
                                var iframe = document.createElement('iframe');
                                document.body.appendChild(iframe);
                                iframe.frameBorder = "0";
                                iframe.src = series[k+1].children[0].href;
                                iFrameReady(iframe, function(a,b){
                                    var nextepisode=a.contentDocument.getElementsByClassName("episodes")[0].children[0].children[0];
                                    var hosters=nextepisode.children[2].children;
                                    chooselink(hosters);
                                    iframe.remove();
                                }, true);
                            }else{
                                new Notification("finished \o/");
                            }
                            break;
                        }
                    }
                }
                break;
            }
        }
    },5000);
}
 
function checkvideo(vid) {
    if (vid) {
        var current = vid.currentTime;
        var dur = vid.duration;
        if (current === undefined) {
            var times = vid.innerText.split("\n");
            times[0] = times[0].split(":");
            times[1] = times[1].split(":");
            current = (times[0][0] * 60) - 0 + (times[0][1] - 0);
            dur = (times[1][0] * 60) - 0 + (times[1][1] - 0);
        }
        if (current > dur - time_before_next_episode && dur > 100) {
            window.top.postMessage({target:"https://bs.to/serie",msg:"next"},"*");
        } else {
            setTimeout(checkvideo,100,vid);
        }
    } else {
        setTimeout(checkvideo,100,vid);
    }
}
 
 
function iFrameReady(iFrame, fn, hiding) {//calls fn when iFrame DOMCONTENT LOADED
    var timer;
    var fired = false;
    function ready() {
        if (!fired) {
            fired = true;
            clearTimeout(timer);
            iFrame.hidden = hiding;
            if (fn !== null && fn !== undefined) {
                try {
                    fn.call(this, iFrame);
                } catch (err) {
                    sc.D.e(err);
                }
            }
        }
    }
    function readyState() {
        if (this.readyState === "complete") {
            ready.call(this);
        }
    }
    // cross platform event handler for compatibility with older IE versions
    function addEvent(elem, event, fn) {
        if (elem.addEventListener) {
            return elem.addEventListener(event, fn);
        } else {
            return elem.attachEvent("on" + event, function () {
                return fn.call(elem, window.event);
            });
        }
    }
    // use iFrame load as a backup - though the other events should occur first
    addEvent(iFrame, "load", function () {
        ready.call(iFrame.contentDocument || iFrame.contentWindow.document);
    });
    function checkLoaded() {
        var doc = iFrame.contentDocument || iFrame.contentWindow.document;
        // We can tell if there is a dummy document installed because the dummy document
        // will have an URL that starts with "about:".  The real document will not have that URL
        if (doc.URL.indexOf("about:") !== 0) {
            if (doc.readyState === "complete") {
                ready.call(doc);
            } else {
                // set event listener for DOMContentLoaded on the new document
                addEvent(doc, "DOMContentLoaded", ready);
                addEvent(doc, "readystatechange", readyState);
            }
        } else {
            // still same old original document, so keep looking for content or new document
            timer = sc.D.sT(checkLoaded, 1);
        }
    }
    checkLoaded();
}
