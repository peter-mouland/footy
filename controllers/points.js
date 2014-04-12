var fs = require('fs');
var statistics = require('../controllers/statistics');
var pointsRoot = 'public/stats/';

var points = function(){

};

module.exports = points;

points.prototype.writeJson = function(url, json){
    fs.writeFile(url, JSON.stringify(json, null, 2), function(err){
        if (err) console.log(err);
        console.log(url + ' saved');
    });
};

points.prototype.update = function(){
    return this.savePlayers(this.calculateAllPlayersWeek());
};

points.prototype.getRecentPlayerStats = function(){
    return new statistics().getRecentPlayerStats();
};

points.prototype.calculateAllPlayersWeek = function(){
    var points = this;
    var weeklyPoints = [];
    var stats = this.getRecentPlayerStats();
    stats.new.arrStats.forEach(function(newPlayerStats, i){
        weeklyPoints.push({
            name: newPlayerStats.Name,
            change: points.calculatePlayer(stats.old, newPlayerStats)
        });
    });
    this.latestPlayersWeek = {
        week: stats.week,
        points: weeklyPoints,
        winners: this.calculateWinners(weeklyPoints),
        losers: this.calculateLosers(weeklyPoints)
    };
    return this.latestPlayersWeek;
};

points.prototype.calculateWinners = function(points){
    var wins = points.sort(function(a,b) {
        return parseFloat(b.change) - parseFloat(a.change)
    });
    return wins.slice(0,5);
};

points.prototype.calculateLosers = function(points){
    var loses = points.sort(function(a,b) {
        return parseFloat(a.change) - parseFloat(b.change)
    });
    return loses.slice(0,5);
};

points.prototype.calculatePlayer = function(oldStats, newPlayerStats){
    if (!oldStats || !newPlayerStats){ return; }
    var oldPlayerStats = this.previous(oldStats, newPlayerStats);
    var forGoals = this.forGoals(oldPlayerStats['Gls'], newPlayerStats['Gls'], newPlayerStats['pos']);
    var forYellowCards = this.forYellowCards(oldPlayerStats['YC'], newPlayerStats['YC'], newPlayerStats['pos']);
    var forRedCards = this.forRedCards(oldPlayerStats['RC'], newPlayerStats['RC'], newPlayerStats['pos']);
    var forStarting = this.forStarting(oldPlayerStats['SXI'], newPlayerStats['SXI'], newPlayerStats['pos']);
    var forSub = this.forSub(oldPlayerStats['Sub'], newPlayerStats['Sub'], newPlayerStats['pos']);
    var forAssists = this.forAssists(oldPlayerStats['Ass'], newPlayerStats['Ass'], newPlayerStats['pos']);
    var forCleanSheet = this.forCleanSheet(oldPlayerStats['CS'], newPlayerStats['CS'], newPlayerStats['pos']);
    var forGoalAgainst = this.forGoalAgainst(oldPlayerStats['GA'], newPlayerStats['GA'], newPlayerStats['pos']);
    return forGoals + forYellowCards + forRedCards + forStarting + forSub + forAssists + forCleanSheet + forGoalAgainst;
};

points.prototype.previous = function(oldStats, newPlayerStats){
    var prev = oldStats.mapStats[newPlayerStats.Name];
    if(!prev){
        console.log('New Player : ' + newPlayerStats.Name);
    }
    return (prev) ? prev : {
        Gls: 0, RC:0, YC: 0, SXI: 0, Sub: 0, Ass: 0, CS: 0, GA: 0
    }
};


points.prototype.forStarting = function(oldData, newData, position){ //starting a match 3 point
    return (newData - oldData) * 3;
};

points.prototype.forSub = function(oldData, newData, position){ //sub = 1 point
    return (newData - oldData) * 1;
};

points.prototype.forGoals = function(oldData, newData, position){//depends on position
    var multiplier;
    if (position == 'GK'){
        multiplier = 10;
    } else  if (position == 'FB' || position == 'CB'){
        multiplier = 8;
    } else if (position == 'WM' || position == 'CM'){
        multiplier = 6;
    } else if (position == 'FWD'){
        multiplier = 4;
    } else {
        console.log('Position not found : ', position);
    }
    return (newData - oldData) * multiplier;
};

points.prototype.forAssists = function(oldData, newData, position){//assist = 3 points
    return (newData - oldData) * 3;
};

points.prototype.forYellowCards = function(oldData, newData, position){ //-2
    return (oldData - newData) * 2;
};

points.prototype.forRedCards = function(oldData, newData, position){ //-5
    return (oldData - newData) * 5;
};

points.prototype.forCleanSheet = function(oldData, newData, position){ //5
    var multiplier;
    if ((position == 'FB' || position == 'CB') || position == 'GK'){
        multiplier = 5;
    } else  {
        multiplier = 0;
    }
    return (oldData - newData) * multiplier;
};

points.prototype.forGoalAgainst = function(oldData, newData, position){ //-1
    var multiplier;
    if ((position == 'FB' || position == 'CB') || position == 'GK'){
        multiplier = -1;
    } else  {
        multiplier = 0;
    }
    return (oldData - newData) * multiplier;
};

points.prototype.savePlayers = function(body){
    if (!body){ return false; }
    this.writeJson(pointsRoot + body.week + '/points.json', body);
    return 'Saved';

};


points.prototype.getRecentPlayerPoints = function(){
    return {
        week: 0,
        new: {},
        old: {}
    };
};