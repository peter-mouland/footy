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

var writeJson = function(url, json){
    fs.writeFile(url, JSON.stringify(json, null, 2), function(err){
        if (err) console.log(err);
        console.log(url + ' saved');
    });
};

var tableToJson = function(body){
    var $ = cheerio.load(body);
    var o = {  mapHeadings:{}, arrHeadings:[], arrStats: [], mapStats : {} };
    var $th = $('.STFFDataTable th');
    var $tr = $('.STFFDataTable tr:not(:first-child)');
    var i, th, els, el, nodes, node, td, player;
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
        player = {};
        i = 0;
        if ($tr.hasOwnProperty(nodes)) {
            node = $tr[nodes];
            if (nodes !== 'length'){
                for (els in node.children){
                    if (node.children.hasOwnProperty(els) ) {
                        el = node.children[els];
                        if (el.name == 'td' && o.arrHeadings[i].trim){
                            player[o.arrHeadings[i]] = el.children[0].data;
                            i++;
                        }
                    }
                }
            }
        }
        o.arrStats.push(player);
    }
    o.arrStats.forEach(function(stats, i){o.mapStats[stats.Name] = stats});
    return o;
};



module.exports = stats;


stats.prototype.latest = function(){
     return request(externalWeekUrl);
};

stats.prototype.update = function(){
    var self = this;
     return this.latest().then(self.save.bind(self));
};

stats.prototype.save = function(body){
    var newJson = JSON.parse(body);
    var newWeek = newJson.CURRENTWEEK;
    var isUpToDate = this.current.CURRENTWEEK == newWeek;
    if (isUpToDate){
        return false;
    } else {
        this.current = newJson; //todo: doesn't work
        writeJson(currentWeek, newJson);
        return request(externalOverallUrl).then(function(body) {
            var outputFilename = statsRoot + newWeek + '/stats.json';
            writeJson(outputFilename, tableToJson(body));
            return 'cool';
        });
    }
};