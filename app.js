'use strict';

var express = require('express');
var exphbs = require('express3-handlebars');
var statistics = require('./controllers/statistics');
var points = require('./controllers/points');

var app = express();
app.root = __dirname + '/';
app.public = app.root + 'public/';
app.statsRoot = app.public + 'stats/';
app.engine('handlebars', exphbs({defaultLayout: 'main'}));
app.set('view engine', 'handlebars');
app.set('view options', { doctype : 'html', pretty : true });


app.get('/', function(req, res){
    res.render('home');
});

app.get('/info', function(req, res){
    var stats = new statistics();
    res.send('Most Recent Update: week ' + stats.latestTeam.CURRENTWEEK + ' (complete: ' + stats.latestTeam.SUCCESS + ')');
});

app.get('/update', function(req, res){
    var stats = new statistics();
    stats.update().then(function(response){
        res.send(response);
    });
});

app.get('/compare', function(req, res){
    var stats = new statistics();
    var week = stats.latestTeam.CURRENTWEEK;
    var prevWeek = parseInt(week,10) - 1;
    var cur = require(app.statsRoot + week + '/stats.json');
    var prev = require(app.statsRoot + prevWeek + '/stats.json');
    res.send(prev.arrStats[0].Total + ' | ' + cur.arrStats[0].Total );
});

var server = app.listen(3000, function() {
    console.log('Listening on port %d', server.address().port);
});
