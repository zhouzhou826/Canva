"use strict";

/**
 * Created by amarshanand on 25/7/17.
 * This is the key class for the project.
 * Other than the constructor, the only public method is run(), which returns a Promise that will get settled upon getting a winner
 */
class Tournament {

    /**
     * @param teamsPerMatch
     * @param numberOfTeams
     * @param suffix an optional parameter ("1") so that the events can be directed to another UI. FOr testing parallel execution of multiple Tournaments
     */
    constructor(teamsPerMatch, numberOfTeams, suffix) {
        this.teamsPerMatch = teamsPerMatch;
        this.numberOfTeams = numberOfTeams;
        this.rounds = []; // we store each round of the tournament fir backtracking. last element of this array will tell us the winning team. this costs us memory, but provides a nice audit trail
        this.teams = {}; // a <teamId,Team> mapping of all Teams participating in this tournament
        this.suffix = suffix ? suffix : "";
    }

    /**
     * Run this Tournament, much like Java's Thread.run().
     * We notify the UI of the progress by emitting CustomEvents
     */
    run() {
        fetchJSON('/tournament','post',{teamsPerMatch:this.teamsPerMatch, numberOfTeams:this.numberOfTeams})
            .then((tournamentResult)=>{
                this.id = tournamentResult.tournamentId;
                document.dispatchEvent(new CustomEvent('startTournament', {detail:{tournamentId:this.id,suffix:this.suffix}}));
                this.playRound(tournamentResult.matchUps); // play the first round. subsequent rounds will be played recursively until a winner is chosen
            })
            .catch((err) => {
                document.dispatchEvent(new CustomEvent('tournamentError',{detail:{teamsPerMatch:this.teamsPerMatch,numberOfTeams:this.numberOfTeams,message:err,suffix:this.suffix}}));
            })
    }

    /*************************************************************************************
     * Private Methods, could have been hidden if import/export were supported by Chrome *
     *************************************************************************************/

    /**
     * Play a round to the tournament. This method constructs a bunch of Match classes, and play()s each one of them to get an array of winning teams (one per match).
     * @param matchUps : array of matches for this round
     */
    playRound(matchUps){
        // from <matchId,[teamId]> type structure, we compose an Array of Matches for this round
        addTrace(`\n------------------------------------------ starting round# ${this.getCurrentRound()+1} ------------------------------------------`, this.suffix);
        let matchArray = matchUps.map((match) => new Match(this, this.getCurrentRound()+1, match.match, match.teamIds));
        this.rounds.push(matchArray); // we store each match in the tournament round-wise for auditing if required
        // now, we play each of these matches. Match.run() returns a promise, which gets resolved after a winner has been fetched from the server
        Promise.all(matchArray.map((match) => match.run()))
            .then((winningTeams) => {
                // winningTeams is an array of winningTeam per match in this tournament
                document.dispatchEvent(new CustomEvent('endRound', {detail:{tournamentId:this.id,roundNo:this.getCurrentRound(),suffix:this.suffix}}));
                addTrace(`# Winning teams for round#${this.getCurrentRound()} are ${winningTeams.map((team)=>{ return `${team.id}@${team.name}` }).join(", ")}`, this.suffix);
                // exit condition: if only one winner is reported, we exit the recursion
                if(winningTeams.length==1) {
                    document.dispatchEvent(new CustomEvent('endTournament', {detail:{winnerName:winningTeams[0].name,suffix:this.suffix}}));
                    addTrace(`\n## Final winner ${winningTeams[0].name} decided in ${this.getCurrentRound()+1} rounds`, this.suffix);
                    return;
                }
                // to prepare for the next round, we need to compose matchUps (the way server had returned in the first go) and recurse playRound() with it
                this.playRound(this.matchUpsForNextRound(winningTeams));
            })
            .catch( (err) => { throw new Error(`FATAL: Couldnt play round# ${this.getCurrentRound()} : ${err}`) } ) //TODO this should emit an error event
    }

    /**
     * Get the matchUps for the next round, which is an array of {matchId, teamIds:[Array teamIds]}, just the way server had returned in the first go
     * @param winningTeams
     */
    matchUpsForNextRound(winningTeams){
        // as mentioned in the spec, we simply pick adjacent #teamsPerMatch teams to create a match
        let matchUps=[], matchNo = 0;
        while (winningTeams.length>0)
            matchUps.push({match: matchNo++, teamIds: winningTeams.splice(0, this.teamsPerMatch).map(team => team.id) });
        return matchUps;
    }

    /**
     * Get the round being played currently
     * @returns {Number}
     */
    getCurrentRound(){
        return this.rounds.length-1;
    }

    /**
     * Given the teamId, get the Team. Each Team in a Tournament has unique id, which we use to create a Team, or to retrieve one if cached.
     * This method returns a Promise since creating a Team involves making an asynch call to the server to fetch the team name and score.
     * @param teamId
     */
    getTeam(teamId){
        return new Promise((resolve, reject) => {
            // we first scan to see if the team has been initialized already. if so, we resolve immediately
            if(this.teams[teamId]) return resolve(this.teams[teamId]);
            // if not, we create a new Team, cache it, and issue a request to the server to set it
            let aTeam = new Team(this,teamId); this.teams[teamId] = aTeam;
            aTeam.setTeam().then(()=>resolve(aTeam)).catch((err)=>reject(err));
        })
    }

}
