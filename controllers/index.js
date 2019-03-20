const webpush = require("web-push");
const MatchSimulator = require('../services/match-simulator');
const {findTeams, getTeam, addTeamToUser, getUserTeams, getRandomTeam} = require('../services/database');

const home = async ctx => {
    const {search = ''} = ctx.query;
    let filteredTeams = [];

    if (search) {
        filteredTeams = findTeams(search);
    }

    await ctx.render('home', {
        teams: filteredTeams
    });
};

const addTeam = async ctx => {
    const {team} = ctx.request.body;

    try {
        addTeamToUser(team);
        ctx.redirect('/dashboard');
    } catch (e) {
        await ctx.render('error', {
            errorMessage: e.message
        });
    }
};

const dashboard = async ctx => {
    const userTeams = getUserTeams();
    await ctx.render('dashboard', {
        userTeams
    });
};

let gameMatch = null;

const match = async ctx => {
    const {team} = ctx.params;

    if (!gameMatch) {
        gameMatch = new MatchSimulator(getTeam(team), getRandomTeam());
        gameMatch.start();
    }

    console.log(gameMatch.getData());

    await ctx.render('match', {
        ...gameMatch.getData()
    });
};

let subscription = null;

const publicVapidKey =
    "BJthRQ5myDgc7OSXzPCMftGw-n16F7zQBEN7EUD6XxcfTTvrLGWSIG7y_JxiWtVlCFua0S8MTB5rPziBqNx1qIo";
const privateVapidKey = "3KzvKasA2SoCxsp0iIG_o9B0Ozvl1XDwI63JRKNIWBM";

webpush.setVapidDetails(
    "mailto:test@test.com",
    publicVapidKey,
    privateVapidKey
);

const subscribe = async ctx => {
    subscription = ctx.request.body;

    ctx.status = 201;
    ctx.body = {};

    if (!gameMatch) {
        gameMatch = gameMatch = new MatchSimulator(getRandomTeam(), getRandomTeam());

        const options = {
            updateWhenScored: true
        };

        gameMatch.simulate(data => {
            const bodyMessage = `${data.teams.team1.name} ${data.teams.team1.goals} - ${data.teams.team2.goals} ${data.teams.team2.name}`;

            const payload = JSON.stringify({
                title: "Goal!",
                body: bodyMessage
            });

            webpush
                .sendNotification(subscription, payload)
                .catch(err => console.error(err));
        }, options);
    }
};

module.exports = {
    home,
    addTeam,
    dashboard,
    match,
    subscribe
};