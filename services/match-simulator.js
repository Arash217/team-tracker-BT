const faker = require('faker');
const Team = require('../models/team');
const GameTime = require('../models/game-time');

class MatchSimulator {
    constructor(team1, team2) {
        this.team1 = new Team(team1);
        this.team2 = new Team(team2);
        this.gameTime = new GameTime();
        this.timeline = []
    }

    start(options = {}) {
        setInterval(() => {
            const scored = this.randomGoal();

            if (options.updateWhenScored) {
                if (scored) {
                    this.cb && this.cb(this.getData());
                }
            } else {
                this.cb && this.cb(this.getData());
            }

        }, 1000);
    }

    simulate(cb, options = {}) {
        this.cb = cb;
        this.start(options);
    }

    randomGoal() {
        if (MatchSimulator.chance(5)) {
            let scoringTeam = null;
            let opponentTeam = null;
            if (MatchSimulator.chance(50)) {
                scoringTeam = this.team1;
                opponentTeam = this.team2;
            } else {
                scoringTeam = this.team2;
                opponentTeam = this.team1;
            }
            scoringTeam.addGoal();
            this.addToTimeline(scoringTeam, opponentTeam);
            return true;
        }

        return false;
    }

    static chance(percentage) {
        return Math.ceil(Math.random() * 100) <= percentage;
    }

    addToTimeline(scoringTeam, opponentTeam) {
        this.timeline.push({
            scoreTime: this.gameTime.getElapsedTime(),
            player: faker.name.findName(),
            scoringTeam: {...scoringTeam},
            opponentTeam: {...opponentTeam}
        })
    }

    getData() {
        return {
            gameTime: this.gameTime.getElapsedTime(),
            teams: {
                team1: this.team1,
                team2: this.team2
            },
            timeline: this.timeline
        }
    }
}

module.exports = MatchSimulator;