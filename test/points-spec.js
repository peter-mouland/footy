'use strict';

var points =  new (require('../controllers/points.js'))();

/*
  ======== A Handy Little Nodeunit Reference ========
  https://github.com/caolan/nodeunit

  Test methods:
    test.expect(numAssertions)
    test.done()
  Test assertions:
    test.ok(value, [message])
    test.equal(actual, expected, [message])
    test.notEqual(actual, expected, [message])
    test.deepEqual(actual, expected, [message])
    test.notDeepEqual(actual, expected, [message])
    test.strictEqual(actual, expected, [message])
    test.notStrictEqual(actual, expected, [message])
    test.throws(block, [error], [message])
    test.doesNotThrow(block, [error], [message])
    test.ifError(value)
*/

exports.footy = {
  setUp: function(done) {
    // setup here
    done();
  },

  'Points for stats can be calculated': function(test) {
      test.expect(9);

      test.equal(points.forGoals(1, 1), 0, 'a player gets 0 points if no goals scored');
      test.equal(points.forGoals(1, 2), 1, 'a player gets 1 points if 1 goals scored');
      test.equal(points.forGoals(0, 5), 5, 'a player gets 5 points if 1 goals scored');

      test.equal(points.forYellowCards(1, 1), 0, 'a player gets 0 points if no yellow cards');
      test.equal(points.forYellowCards(1, 2), -2, 'a player gets -2 points if 1 yellow cards');
      test.equal(points.forYellowCards(0, 5), -10, 'a player gets -4 points if 5 yellow cards');

      test.equal(points.forRedCards(1, 1), 0, 'a player gets 0 points if no red cards');
      test.equal(points.forRedCards(1, 2), -10, 'a player gets -10 points if 1 red cards');
      test.equal(points.forRedCards(0, 5), -50, 'a player gets -50 points if 5 red cards');

      test.done();
  },


    'Points all players can be calculated': function(test) {
        test.expect(3);

        var week1 = require('./fixtures/points-week1.json');
        var week2 = require('./fixtures/points-week2.json');

        points.getRecentPlayerStats = function(){
            return {
                week: 1,
                old: { arrStats: [] },
                new: { arrStats: [] }
            };
        };
        test.deepEqual(points.calculateAllPlayersWeek(),{ week: 1, points: {} },'empty JSON is returned with no stats');

        points.getRecentPlayerStats = function(){
            return {
                week: 1,
                old: {
                    "mapHeadings": { },
                    "arrHeadings": [ ],
                    "arrStats": [ ],
                    "mapStats": {}
                },
                new: week1
            };
        };
        test.deepEqual(points.calculateAllPlayersWeek(),
            { week: 1, points: { 'Gouffran, Yoan': 3 } },
            'first week JSON is returned with stats');

        points.getRecentPlayerStats = function(){
            return {
                week: 2,
                old: week1,
                new: week2
            };
        };
        test.deepEqual(points.calculateAllPlayersWeek(),
            { week: 2, points: { 'Gouffran, Yoan': -1 } },
            'first week JSON is returned with stats');

        test.done();

    }
};
