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

    app.get('/', function(req, res){
        res.send('Hello World');
    });

    var server = app.listen(3000, function() {
        console.log('Listening on port %d', server.address().port);
    });
