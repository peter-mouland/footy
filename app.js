'use strict';

var express = require('express');
var exphbs = require('express3-handlebars');
var Statistics = require('./controllers/statistics');
var Points = require('./controllers/points');

var app = express();
app.root = __dirname + '/';
app.public = app.root + 'public/';
app.statsRoot = app.public + 'stats/';
app.engine('handlebars', exphbs({defaultLayout: 'main'}));
app.set('view engine', 'handlebars');
app.set('view options', { doctype : 'html', pretty : true });
app.use(express.static(__dirname + '/public'));

var stats = new Statistics();
stats.getLatestTeam();
var points = new Points();

app.get('/', function(req, res){
    res.render('home', { week: stats.latestTeam});
});

app.get('/update/stats', function(req, res){
    stats.update().then(function(response){
        var msg = (response) ? 'Stats Updated' : 'Nothing updated, either week is in progress or stats have already been saved';
        res.render('home', { week: stats.latestTeam, msg: msg});
    });
});

app.get('/update/points', function(req, res){
    var response = points.update();
    var msg = (response) ? 'Points Updated' : 'Nothing updated, points have already been saved';
    res.render('home', { week: stats.latestTeam, msg: msg});
});

app.get('/view/stats', function(req, res){
    res.json(stats.getRecentPlayerStats().new);
});

app.get('/view/points', function(req, res){
    res.json(points.getRecentPlayerPoints().new);
});

var server = app.listen(3000, function() {
    console.log('Listening on port %d', server.address().port);
});
