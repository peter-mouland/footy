'use strict';

var Statistics =  require('../controllers/statistics.js');

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
  'HTML Table can be converted to JSON': function(test) {
      test.expect(3);

      var statistics = new Statistics();
      var htmlTable = '<table class="STFFDataTable"><tr><th title="head-name">head name</th><th title="head-title">head one</th></tr><tr><td Name>cell name</td><td title="cell-title">cell one</td></tr></table>'
      var htmlTableWithName = '<table class="STFFDataTable"><tr><th title="head-name">Name</th><th title="head-title">head one</th></tr><tr><td Name>cell name</td><td title="cell-title">cell one</td></tr></table>'

    // tests here
      test.deepEqual(statistics.tableToJson(),
          { mapHeadings: {}, arrHeadings: [], arrStats: [], mapStats: {} },
          'Empty table should return JSON with empty maps + arrays');

      test.deepEqual(statistics.tableToJson(htmlTable),
          { mapHeadings:
            { 'head name': 'head-name',
              'head one': 'head-title' },
            arrHeadings: [ 'head name', 'head one' ],
            arrStats: [
              { 'head name': 'cell name',
                'head one': 'cell one' } ],
            mapStats: {} },
          'Table without a Name column wont fill out mapStats');

      test.deepEqual(statistics.tableToJson(htmlTableWithName),
          { mapHeadings:
            { Name: 'head-name',
              'head one': 'head-title' },
            arrHeadings: [ 'Name', 'head one' ],
            arrStats: [
              { Name: 'cell name',
                'head one': 'cell one' } ],
            mapStats: {
                'cell name':  {
                    Name: 'cell name',
                    'head one': 'cell one' } } },
          'Table with a Name column will fill out mapStats');
    test.done();
  },

  'knows the weeks playing status': function(test) {
      test.expect(2);

      var statistics = new Statistics();
      var complete = require('./fixtures/statistics-week-complete.json');
      var inProgress = require('./fixtures/statistics-week-in-progress.json');

      test.equal(statistics.weekInProgress(inProgress), true, 'recognises when all games have scores');
      test.equal(statistics.weekInProgress(complete), false, 'recognises when at least one game hasn\'t finished');

      test.done();
  },

  'Weekly team summary can be saved': function(test) {
      test.expect(4);

      var statistics = new Statistics();
      statistics.getLatestTeam();

      var week1 = '{ "CURRENTWEEK" : 1 }';
      var week2 = '{ "CURRENTWEEK" : 2 }';
      var writtenJson = 0;
      statistics.latestTeam.CURRENTWEEK = 1;
      statistics.writeJson = function(){
          writtenJson++;
      };
      statistics.weekInProgress = function(){//i am not testing this so mock it
          return false;
      };
      test.equal(statistics.saveTeam(week1), false, 'returns false when weeks match');
      test.equal(writtenJson, 0, 'returning false doesn\'t write json');

      test.equal(statistics.saveTeam(week2), 2, 'returns latest week number when weeks mismatch');
      test.equal(writtenJson, 1, 'returning true does write json');

      test.done();
  },

  'Weekly player stats can be returned': function(test){
      test.expect(2);

      var statistics = new Statistics({statsRoot:'test/fixtures/'});
      var week1 = require('./fixtures/1/players.json');
      var week2 = require('./fixtures/2/players.json');

      statistics.latestTeam = { "CURRENTWEEK" : 1 };
      test.deepEqual(statistics.getRecentPlayerStats(),
          {week: 1, new: week1, old: {} }, 'The first week will have no old data');

      statistics.latestTeam = { "CURRENTWEEK" : 2 };
      test.deepEqual(statistics.getRecentPlayerStats(),
          {week: 2, new: week2, old: week1 }, 'the second week returns the correct data');

      test.done();
  }
};
