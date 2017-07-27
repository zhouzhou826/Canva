"use strict";

window.onload = function() {

    // as a test for concurrency, i am simulating 3 Tournaments in parallel
    for(let i of ["","1","2"])
        // upon clicking start, we kickoff the tournament. events are triggered at various points during the lifecycle of the tournament
        document.getElementById(`start${i}`).onclick = function () {
            // we disable the user to start another tournament while this one is in progress. the code can handle multiple tournament, but the UI hasnt been designed for it (I can discuss this in the interview)
            document.getElementById(`start${i}`).disabled = document.getElementById(`teamsPerMatch${i}`).disabled = document.getElementById(`numberOfTeams${i}`).disabled = true;
            //NOTE: This is the starting point of the App, much like Thread.run() in Java
            (new Tournament(parseInt(document.getElementById(`teamsPerMatch${i}`).value), parseInt(document.getElementById(`numberOfTeams${i}`).value), i)).run();
        };

    /************************************************************************************************************
     * We add EventListeners to ensure the UI stays responsive. Observer pattern could have been an alternative *
     ************************************************************************************************************/

    // upon receiving the startTournament, we reset our state
    document.addEventListener('startTournament', (e) => {
        document.getElementById("trace").innerHTML = document.getElementById("winner"+e.detail.suffix).innerHTML = document.getElementById("progress"+e.detail.suffix).innerHTML = document.getElementById("error"+e.detail.suffix).innerHTML = document.getElementById("winner"+e.detail.suffix).innerHTML = "";
        document.getElementById("winnerContainer"+e.detail.suffix).style.display = 'none';
    }, false);

    // upon receiving the startMatch, we add a <span id='tournamentId_roundNo_matchId'>□</span> to progress, which would would fill upon completion of the match
    document.addEventListener('createMatch', (e) => {
        document.getElementById("progress"+e.detail.suffix).innerHTML += `<span id='${e.detail.tournamentId}_${e.detail.roundNo}_${e.detail.matchId}'>□</span>`;
    }, false);

    // upon receiving the endMatch, we look for <span id='tournamentId_roundNo_matchId'>□</span> and fill it up
    document.addEventListener('endMatch', (e) => {
        document.getElementById(`${e.detail.tournamentId}_${e.detail.roundNo}_${e.detail.matchId}`).innerHTML = `<span id=''>■</span>`;
    }, false);

    // upon receiving the endRound, we add <br> so that we can see a tree like structure
    document.addEventListener('endRound', (e) => {
        document.getElementById("progress"+e.detail.suffix).innerHTML += "&nbsp;";
    }, false);

    // upon receiving the endTournament, we look set the winner
    document.addEventListener('endTournament', (e) => {
        document.getElementById("winner"+e.detail.suffix).innerHTML = e.detail.winnerName;
        document.getElementById("winnerContainer"+e.detail.suffix).style.display = 'block';
        document.getElementById("start"+e.detail.suffix).disabled = document.getElementById("teamsPerMatch"+e.detail.suffix).disabled = document.getElementById("numberOfTeams"+e.detail.suffix).disabled = false;
    }, false);

    // upon receiving an error report it
    document.addEventListener('tournamentError', (e) => {
        document.getElementById("error"+e.detail.suffix).innerHTML = `Error: Could not play this Tournament : ${e.detail.message}`;
        document.getElementById("start"+e.detail.suffix).disabled = document.getElementById("teamsPerMatch"+e.detail.suffix).disabled = document.getElementById("numberOfTeams"+e.detail.suffix).disabled = false;
    }, false);

}

/**
 * Use fetch() to get the response from the server. Just enough to get past this interview challenge, hence covering maininal cases.
 * Wish if I could use jQuery just for making requests !!
 * @param url
 * @param method
 * @param params
 * @returns {Promise}
 */
function fetchJSON(url, method, params){
    return new Promise((resolve, reject) => {
        if(!url || (method!=='get' && method!=='post')) reject(`Caannot fetch url : ${url}, method : ${method}`);
        let fetchParams = {method: method};
        let urlEncodedParams = !params ? "" : Object.keys(params).map((k) => {
            if(Array.isArray(params[k])){
                // cases where we are sending an Array of values in get requests (say, /winner?tournamentId=0&teamScores=8&teamScores=9&matchScore=67 )
                return params[k].map( l => encodeURIComponent(k) + "=" + encodeURIComponent(l)).join('&')
            } else
                return encodeURIComponent(k) + "=" + encodeURIComponent(params[k])
        } ).join('&');
        if(method==="post"){
            fetchParams.headers = {"Content-Type": "application/x-www-form-urlencoded"};
            fetchParams.body = urlEncodedParams;
        } else {
            url += "?"+urlEncodedParams;
        }
        fetch(url, fetchParams)
            .then((response) => {
                if(!response.ok) reject(`FATAL: Couldnt ${method} ${url} : ${response.statusText}`);
                return response.json() })
            .then((tournamentResult) => {
                resolve(tournamentResult);
            })
    })
}

/**
 * A trace window for my debugging. You can set #tracer.display=block in style.css to see it
 * @param str
 * @param suffix (which trace window to send the message to)
 */
function addTrace(str,suffix) {
    document.getElementById(`trace${suffix}`).innerHTML += ( typeof str === "object" ? JSON.stringify(str) : str ) + "<br>";
}