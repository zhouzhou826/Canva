"use strict";

/**
 * Created by amarshanand on 25/7/17.
 * Team is an Entity class, which is contained inside a Tournament. Each Team has a unique id, a name and a score.
 * Other than the constructor, it exposes setTeam(), which is a Promise to get all the team data (name and score).
 */

class Team {

    /**
     * @param tournament : The Tournament this Team belongs to
     * @param id : id of the team
     */
    constructor (tournament, id) {
        this.tournament = tournament;
        this.id = id;
    }

    /**
     * Set this Team by obtaining its name and score from the server. It returns a Promise, which get resolved after the Team has been set
     */
    setTeam(){
        return new Promise((resolve, reject) => {
            fetchJSON('/team','get',{tournamentId: this.tournament.id, teamId: this.id})
                .then((teamData) => {
                    this.name = teamData.name; this.score = teamData.score;
                    resolve();
                })
                .catch(()=> {
                    reject(`FATAL: Couldnt get data for Team <${this.tournament.id},${this.id}>`);
                });
        })
    }

}