module.exports = function (grunt) {
  // Show elapsed time at the end
  require('time-grunt')(grunt);
  // Load all grunt tasks
  require('load-grunt-tasks')(grunt);

    var dateFormat = require('dateformat');
    var hour = dateFormat(new Date(), "HH");
    var folder = dateFormat(new Date(), "yyyy-mm-dd-ddd") + '/';


    if (parseInt(hour,10) < 19){
        console.error('please wait until after 7pm!!');
        return;
    }

  // Project configuration.
  grunt.initConfig({
    nodeunit: {
      files: ['test/**/*_test.js']
    },
    jshint: {
      options: {
        jshintrc: '.jshintrc',
        reporter: require('jshint-stylish')
      },
      gruntfile: {
        src: 'Gruntfile.js'
      },
      lib: {
        src: ['lib/**/*.js']
      },
      test: {
        src: ['test/**/*.js']
      }
    },
    exec: {

    },
    curl: {
        stats: {
            src: [{
                url: 'https://fantasyfootball.skysports.com/statistics/',
                method: 'GET'
            }],
            dest: './stats/' + folder + 'stats.html'
        }
    },
    dom_munger: {
      read: {
          options: {
              read: [
                  {selector:'.STFFDataTable', writeto:'stats', isPath:false} //<%= dom_munger.data.stats %>
              ],
              callback: function($, fileName){
                  var o = {  mapHeadings:{}, arrHeadings:[], arrStats: [], mapStats : {} };
                  var $th = $('.STFFDataTable th');
                  var $tr = $('.STFFDataTable tr:not(:first-child)');
                  var i, th, els, el, nodes, node, td, player;
                  for (th in $th){
                      if ($th.hasOwnProperty(th)) {
                          el = $th[th];
                          if (th !== 'length'){
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
                                          i++;
                                          player[o.arrHeadings[i]] = el.children[0].data;
                                      }
                                  }
                              }
                          }
                      }
                      o.arrStats.push(player);
                  }
                  o.arrStats.forEach(function(stats, i){o.mapStats[stats.Name] = stats});
                  $('html').html(JSON.stringify(o));
              }
          },
          src: 'stats/' + folder + 'stats.html', //could be an array of files
          dest: 'stats/' + folder + 'data.html' //optional, if not specified the src file will be overwritten
      },
    },
    copy:{
        stats:{
            options: {
                process: function (content, srcpath) {
                    var newContent = content.replace('<!doctype html>',"");
                    newContent = newContent.replace('<html lang="en">',"");
                    newContent = newContent.replace('</html>',"");
                    return newContent
                }
            },
            src: './stats/' + folder + 'data.html',
            dest: './stats/' + folder + 'data.json'
        }
    },
    watch: {
      gruntfile: {
        files: '<%= jshint.gruntfile.src %>',
        tasks: ['jshint:gruntfile']
      },
      lib: {
        files: '<%= jshint.lib.src %>',
        tasks: ['jshint:lib', 'nodeunit']
      },
      test: {
        files: '<%= jshint.test.src %>',
        tasks: ['jshint:test', 'nodeunit']
      }
    }
  });

  // Default task.
  grunt.registerTask('default', ['curl', 'dom_munger', 'copy']);

};
