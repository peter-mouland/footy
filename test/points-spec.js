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

  'Weeks can be compared': function(test) {
        var week1 = require('./fixtures/compare-week1.json');
        var week2 = require('./fixtures/compare-week2.json');

      test.expect(5);

      test.equal(points.forGoals(1, 1), 0, 'a player gets 0 points if no goals scored');

      test.equal(points.forYellowCards(1, 1), 0, 'a player gets 0 points if no yellow cards');
      test.equal(points.forYellowCards(1, 2), -2, 'a player gets -2 points if 1 yellow cards');

      test.equal(points.forRedCards(1, 1), 0, 'a player gets 0 points if no red cards');
      test.equal(points.forRedCards(1, 2), -10, 'a player gets -10 points if 1 red cards');

      test.done();
  }
};
