"use strict";

/**
 * Created by amarshanand on 25/7/17.
 * This class denotes a Match. Match belong to a certain round of the tournament, and is composed to #teamsPerMatch number of Teams.
 * Other than the constructor, the only public method is run(), which returns a Promise that will get settled upon getting a winner for this match.
 */
class Match {

    /**
     * @param tournament : the tournament this match belongs to
     * @param round : the round this match belongs to
     * @param id : match id, as received from the server
     * @param teamIds : a set of teamIds, as received from the server. we use these ids to create or retrieve a Team
     */
    constructor(tournament, round, id, teamsIds) {
        this.tournament = tournament;
        this.round = round;
        this.id = id;
        this.teamIds = teamsIds.sort((a,b) => a-b); // we sort ids so that upon a tie, the lower one gets picked first, as per spec
        document.dispatchEvent(new CustomEvent('createMatch', {detail:{tournamentId:this.tournament.id,roundNo:this.round,matchId:this.id,suffix:this.tournament.suffix}}));
    }

    /**
     * Play this Match. Playing a Match should resolve to a winning team eventually.
     * To play a match, we first set each team in the match (an asynch process that involves getting the team score).
     * Once that is done, we fetch the winner from the server, and resolve the promise
     */
    run() {
        return new Promise((resolve, reject) => {
            // we need to set up each team first. this.tournament.getTeam(teamId) returns a promise that is resolved after fetching the team info from the server
            Promise.all(this.teamIds.map((teamId) => this.tournament.getTeam(teamId)))
                .then((allTeams) => { return this.getMatchScore(allTeams) })
                .then((matchData) => { return this.getWinningTeam(matchData.allTeams, matchData.score)})
                .then((winningTeam) => { resolve(winningTeam) })
                .catch( (err) => { reject(`FATAL: Couldnt play match <tournament:${this.tournament.id}, round:${this.round}, match:${this.id}> : ${err}`)})
        });
    }

    /*************************************************************************************
     * Private Methods, could have been hidden if import/export were supported by Chrome *
     *************************************************************************************/

    /**
     * Get the score for this match
     * @returns {Promise}
     */
    getMatchScore(allTeams){
        return new Promise((resolve, reject) => {
            fetchJSON('/match','get',{tournamentId:this.tournament.id, round:this.round, match:this.id})
                .then((matchData) => {
                    resolve({allTeams:allTeams,score:matchData.score});
                })
                .catch((err)=> {
                    reject(`FATAL: Couldnt get data for Match <tournament:${this.tournament.id}, round:${this.round}, match:${this.id}> : ${err}`);
                });
        })
    }

    /**
     * Given all the Teams participating in the Match and the match score, get the winning team
     * @param allTeams
     * @param matchScore
     * @returns {Promise}
     */
    getWinningTeam(allTeams, matchScore){
        return new Promise((resolve, reject) => {
            let teamScores = allTeams.map(team=>team.score);
            addTrace(`Will play Match {tournament:${this.tournament.id},match:${this.id}} between ${allTeams.map(team=>`${team.name} [${team.score}]`).join("  and  ")}`, this.tournament.suffix);
            fetchJSON('/winner','get',{tournamentId:this.tournament.id, teamScores:teamScores, matchScore:matchScore})
                .then((winner) => {
                    document.dispatchEvent(new CustomEvent('endMatch', {detail:{tournamentId:this.tournament.id,roundNo:this.round,matchId:this.id,suffix:this.tournament.suffix}}));
                    resolve(allTeams.find((team) => (team.score===winner.score) ));
                })
                .catch((err)=> {
                    reject(`FATAL: Couldnt get winner for Match <tournament:${this.tournament.id},match:${this.id},teamScores:[${teamScores.join(",")}],matchScore:${matchScore}> : ${err}`);
                });
        })
    }

}
