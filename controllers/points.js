var fs = require('fs');
var statistics = require('../controllers/statistics');

var points = function(){

};


module.exports = points;

points.prototype.update = function(){
    var points = this;
    var stats = new statistics();
    var week = stats.latestTeam.CURRENTWEEK;
    var weeklyPoints = {};
    var newStats = stats.getPlayers(week);
    var oldStats = stats.getPlayers(week - 1);
    newStats.arrStats.forEach(function(newPlayerStats){
        weeklyPoints[newPlayerStats.Name] = points.calculatePlayer(oldStats, newPlayerStats);
    });
    return weeklyPoints;
};

points.prototype.calculatePlayer = function(oldStats, newPlayerStats){
    var oldPlayerStats = oldStats.mapStats[newPlayerStats.Name];
    var pointsForGoals = points.forGoals(oldPlayerStats['Gls'], newPlayerStats['Gls']);
    var pointsForYellowCards = points.forYellowCards(oldPlayerStats['YC'], newPlayerStats['YC']);
    var pointsForRedCards = points.forRedCards(oldPlayerStats['RC'], newPlayerStats['RC']);
    return pointsForGoals + pointsForYellowCards + pointsForRedCards;
};

points.prototype.forGoals = function(oldData, newData){
    return oldData - newData;
};

points.prototype.forYellowCards = function(oldData, newData){
    return (oldData - newData) * 2;
};

points.prototype.forRedCards = function(oldData, newData){
    return (oldData - newData) * 10;
};