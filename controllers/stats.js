var cheerio = require('cheerio');
var fs = require('fs');
var request = require('request-promise');

var statsRoot = 'public/stats/';
var externalWeekUrl = 'https://fantasyfootball.skysports.com/json/teaminfo/0';
var externalOverallUrl = 'https://fantasyfootball.skysports.com/statistics/';
var currentWeek = statsRoot + 'current-week.json';

var stats = function(){
    this.current = JSON.parse(fs.readFileSync( statsRoot + 'current-week.json'));
};


stats.prototype.tableToJson = function(body){
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



module.exports = stats;

stats.prototype.writeJson = function(url, json){
    fs.writeFile(url, JSON.stringify(json, null, 2), function(err){
        if (err) console.log(err);
        console.log(url + ' saved');
    });
};

stats.prototype.update = function(){
     return this.getWeek()
         .then(this.saveWeek.bind(this))
         .then(this.getStats.bind(this))
         .then(this.saveStats.bind(this));
};

stats.prototype.getWeek = function(){
    return request(externalWeekUrl);
};

stats.prototype.getStats = function(week){
    if (!week){ return false; }
    return request(externalOverallUrl);
};

stats.prototype.saveWeek = function(body){
    var newJson = JSON.parse(body);
    var newWeek = newJson.CURRENTWEEK;
    var isUpToDate = this.current.CURRENTWEEK == newWeek;
    if (isUpToDate){
        return false;
    } else {
        this.current = newJson; //todo: doesn't work
        this.writeJson(currentWeek, newJson);
        return newWeek;
    }
};

stats.prototype.saveStats = function(body){
    if (!body){ return false; }
    self.writeJson(statsRoot + this.current.CURRENTWEEK + '/stats.json', self.tableToJson(body));
    return 'Saved';
};