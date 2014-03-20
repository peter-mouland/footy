/*
 * footy
 * user/repo
 *
 * Copyright (c) 2014 Peter Mouland
 * Licensed under the MIT license.
 */

'use strict';

    var express = require('express');
    var app = express();
    app.root = __dirname + '/';

    var fs = require('fs');
    var request = require('request');
    var cheerio = require('cheerio');

    function getStats($,addForEach){
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
    }

    app.get('/', function(req, res){
        res.send('hello world');
    });

    app.get('/info', function(req, res){
        var week = require(app.root + 'stats/current-week.json');
        res.send('current week: ' + week.CURRENTWEEK + '. week complete: ' + week.SUCCESS);
    });

    app.get('/update', function(req, res){
        var week = require(app.root + 'stats/current-week.json');
        request('https://fantasyfootball.skysports.com/json/teaminfo/0', function(err, response, body){
            var newJson = JSON.parse(body);
            var newWeek = newJson.CURRENTWEEK;
            var isUpToDate = week.CURRENTWEEK == newWeek;
            if (isUpToDate){
                res.send('nothing to do');
            } else {
                week = newJson;
                var outputFilename = app.root + 'stats/current-week.json';
                fs.writeFile(outputFilename, JSON.stringify(newJson, null, 2), function(err) {
                    if(err) {
                        console.log(err);
                    } else {
                        console.log("JSON saved to " + outputFilename);
                        request('https://fantasyfootball.skysports.com/statistics/', function(err, response, body) {
                            var $ = cheerio.load(body);
                            var stats = getStats($, Array.prototype.slice);
                            var outputFilename = app.root + 'stats/' + newWeek + '/stats.json';
                            fs.writeFile(outputFilename, JSON.stringify(stats, null, 2), function(err) {
                                if(err) {
                                    console.log(err);
                                } else {
                                    console.log("JSON saved to " + outputFilename);
                                    res.send(stats);
                                }
                            });
                        });
                    }
                });
            }
        });
    });

    app.get('/compare', function(req, res){
        var week = require(app.root + 'stats/current-week.json').CURRENTWEEK;
        var prevWeek = parseInt(week,10) - 1;
        var cur = require(app.root + 'stats/' + week + '/stats.json');
        var prev = require(app.root + 'stats/' + prevWeek + '/stats.json');
        res.send(prev.arrStats[0].Total + ' | ' + cur.arrStats[0].Total );
    });

    var server = app.listen(3000, function() {
        console.log('Listening on port %d', server.address().port);
    });
