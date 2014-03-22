'use strict';

var stats =  new (require('../controllers/stats.js'))();

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

      var htmlTable = '<table class="STFFDataTable"><tr><th title="head-name">head name</th><th title="head-title">head one</th></tr><tr><td Name>cell name</td><td title="cell-title">cell one</td></tr></table>'
      var htmlTableWithName = '<table class="STFFDataTable"><tr><th title="head-name">Name</th><th title="head-title">head one</th></tr><tr><td Name>cell name</td><td title="cell-title">cell one</td></tr></table>'

      test.expect(3);
    // tests here
      test.deepEqual(stats.tableToJson(),
          { mapHeadings: {}, arrHeadings: [], arrStats: [], mapStats: {} },
          'Empty table should return JSON with empty maps + arrays');

      test.deepEqual(stats.tableToJson(htmlTable),
          { mapHeadings:
            { 'head name': 'head-name',
              'head one': 'head-title' },
            arrHeadings: [ 'head name', 'head one' ],
            arrStats: [
              { 'head name': 'cell name',
                'head one': 'cell one' } ],
            mapStats: {} },
          'Table without a Name column wont fill out mapStats');

      test.deepEqual(stats.tableToJson(htmlTableWithName),
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

  'Weekly summary can be saved': function(test) {
      var week1 = '{ "CURRENTWEEK" : 1 }';
      var week2 = '{ "CURRENTWEEK" : 2 }';
      var writtenJson = 0;
      test.expect(4);

      stats.current.CURRENTWEEK = 1;
      stats.writeJson = function(){
          writtenJson++;
      };
      test.equal(stats.saveWeek(week1), false, 'returns false when weeks match');
      test.equal(writtenJson, 0, 'returning false doesn\'t write json');

      test.equal(stats.saveWeek(week2), 2, 'returns latest week number when weeks mismatch');
      test.equal(writtenJson, 1, 'returning true does write json');

      test.done();
  }
};
