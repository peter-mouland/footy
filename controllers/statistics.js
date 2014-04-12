var cheerio = require('cheerio');
var fs = require('fs');
var request = require('request-promise');
var mkdirp = require("mkdirp");
var getDirName = require("path").dirname;

var externalWeekUrl = 'https://fantasyfootball.skysports.com/json/teaminfo/0';
var externalOverallUrl = 'https://fantasyfootball.skysports.com/statistics/';
//var externalPlayerUrl = 'http://fantasy.premierleague.com/web/api/elements/';
//1-635?
/* http://fantasy.premierleague.com/web/api/elements/186/
 first_name: "George",
 second_name: "Boyd",
 web_name: "Boyd",
 type_name: "Midfielder",
 fixture_history: {all: [
 "18 Aug 16:00", //d.  date                  0
 1,              //r.  round                 1
 "CHE(A) 0-2",   //o.  opponent              2
 11,             //mp. minutes played        3
 0,              //gs. goals scored          4
 0,              //A.  assists               5
 0,              //c.  clean sheets          6
 0,              //gc. goals conceded        7
 0,              //og. own goals             8
 0,              //ps. penalties saved       9
 0,              //pm. penalties missed      10
 0,              //yc. yellow cards          11
 0,              //rc. red coards            12
 0,              //s.  saves                 13
 0,              //b.  bonus                 14
 0,              //esp. ea sports ppi        15
 1,              //bps. bonus point system   16
 0,              //nt. net transfers         17
 55,             //v.  value                 18
 1               //p.  points                19
 ]}
 */
var statistics = function(opts){
    opts = opts || {};

    this.statsRoot = opts.statsRoot || 'public/stats/';
    this.teamPath = opts.teamPath || this.statsRoot + 'latest-team.json';
    this.positionsPath = opts.positionsPath || this.statsRoot + 'player-positions.json';
};

statistics.prototype.tableToJson = function(body){
    var $ = cheerio.load(body);
    var o = {  mapHeadings:{}, arrHeadings:[], arrStats: [], mapStats : {} };
    var $th = $('.STFFDataTable th');
    var $tr = $('.STFFDataTable tr:not(:first-child)');
    var i, th, els, el, nodes, node, td, player;
    var addPlayer = false;
    for (th in $th){
        if ($th.hasOwnProperty(th)) {
            el = $th[th];
            if (th !== 'length' && el.children[0]){
                o.arrHeadings.push(el.children[0].data);
                o.mapHeadings[el.children[0].data] = el.attribs['title'];
            }
        }
    }
    for (nodes in $tr){
        addPlayer = false;
        delete player;
        i = 0;
        if ($tr.hasOwnProperty(nodes)) {
            node = $tr[nodes];
            if (nodes !== 'length'){
                player = {};
                for (els in node.children){
                    if (node.children.hasOwnProperty(els) ) {
                        el = node.children[els];
                        if (el.name == 'td' && o.arrHeadings[i].trim){
                            player[o.arrHeadings[i]] = el.children[0].data;
                            i++;
                            addPlayer = true;
                        }
                    }
                }
                if (addPlayer){
                    o.arrStats.push(player);
                }
            }
        }
    }
    o.arrStats.forEach(function(stats, i){
        if (!stats.Name){ return; }
        o.mapStats[stats.Name] = stats;
    });
    return o;
};



module.exports = statistics;

statistics.prototype.writeJson = function(url, json){
    mkdirp(getDirName(url), function (err) {
        if (err) return cb(err);
            fs.writeFile(url, JSON.stringify(json, null, 2), function(err){
            if (err) console.log(err);
            console.log(url + ' saved');
        });
    });
};

statistics.prototype.update = function(){
     return this.scrapeTeam()
         .then(this.saveTeam.bind(this))
         .then(this.scrapePlayers.bind(this))
         .then(this.savePlayers.bind(this));
};

statistics.prototype.scrapeTeam = function(){
    return request(externalWeekUrl);
};

statistics.prototype.getLatestTeam = function(){
    if (!this.latestTeam) {
        this.latestTeam =  JSON.parse(fs.readFileSync( this.teamPath ));
    }
    return this.latestTeam;
};
statistics.prototype.getPlayers = function(week){
    return JSON.parse(fs.readFileSync( this.statsRoot + week + '/players.json'));
};

statistics.prototype.scrapePlayers = function(week){
    if (!week){ return false; }
    return request(externalOverallUrl);
};

statistics.prototype.saveTeam = function(body){
    var latest = this.getLatestTeam();
    var newJson = JSON.parse(body);
    var newWeek = newJson.CURRENTWEEK;
    var isUpToDate = latest.CURRENTWEEK == newWeek;
//    if (isUpToDate || this.weekInProgress(newJson)){
//        return false;
//    } else {
        this.latestTeam = newJson;
        this.writeJson(this.teamPath, newJson);
        return newWeek;
//    }
};

statistics.prototype.weekInProgress = function(weekJson){
    var incompleteGames = 0;
    weekJson.PAGE[0].FIXTURES_RESULTS.forEach(function(day){
        day.FIXTURES.forEach(function(fixture){
            if (fixture.HOMESCORE.length === 0){
                incompleteGames ++;
            }
        });
    });
    return incompleteGames > 0;
};


statistics.prototype.getRecentPlayerStats = function(){
    var latest = this.getLatestTeam();
    var week = latest.CURRENTWEEK;
    var newStats = this.getPlayers(week);
    var oldStats = (week - 1) > 0 ? this.getPlayers(week - 1) : {};
    return {
        week: week,
        new: newStats,
        old: oldStats
    };
};

statistics.prototype.savePlayers = function(body){
    if (!body){ return false; }
    var latest = this.getLatestTeam();
    this.writeJson(this.statsRoot + latest.CURRENTWEEK + '/players.json', this.tableToJson(body));
    return 'Saved';
};