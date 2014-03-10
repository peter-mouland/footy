(function(d,addForEach){

    function getStats(){
        var o = {
            mapHeadings :{},
            arrHeadings :[],
            arrStats : [],
            mapStats : {}
        };
        var table = d.getElementsByClassName('STFFDataTable')[0];
        var headers = addForEach.call(table.getElementsByTagName('th'),0);
        var rows = addForEach.call(table.getElementsByTagName('tr'),0);
        headers.forEach(function ( el, i) {
            o.arrHeadings.push(el.innerText);
            o.mapHeadings[el.innerText] = el.getAttribute('title');
        });
        rows.forEach(function ( el, i) {
            var cols = addForEach.call(el.getElementsByTagName('td'),0);
            var player = {};
            cols.forEach(function (el, i) {
                player[o.arrHeadings[i]] = el.innerText;
            });
            o.arrStats.push(player);
        });
        o.arrStats.forEach(function(stats, i){o.mapStats[stats.Name] = stats});
        console.log(o);
        return o;
    }

    getStats();

}(document, Array.prototype.slice));