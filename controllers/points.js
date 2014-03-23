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
    var pointsForGoals = this.forGoals(oldPlayerStats['Gls'], newPlayerStats['Gls']);
    var pointsForYellowCards = this.forYellowCards(oldPlayerStats['YC'], newPlayerStats['YC']);
    var pointsForRedCards = this.forRedCards(oldPlayerStats['RC'], newPlayerStats['RC']);
    return pointsForGoals + pointsForYellowCards + pointsForRedCards;
};

points.prototype.previous = function(oldStats, newPlayerStats){
    var prev = oldStats.mapStats[newPlayerStats.Name];
    if(!prev){
        console.log('New Player : ' + newPlayerStats.Name);
    }
    return (prev) ? prev : {
        Gls: 0, RC:0, YC: 0
    }
};

points.prototype.forGoals = function(oldData, newData){
    return newData - oldData;
};

points.prototype.forYellowCards = function(oldData, newData){
    return (oldData - newData) * 2;
};

points.prototype.forRedCards = function(oldData, newData){
    return (oldData - newData) * 10;
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