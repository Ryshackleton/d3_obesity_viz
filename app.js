var express = require('express')
    , app = express()
    , routes = require('./routes/all')
    , dataroutes = require('./routes/dbcsv')
;

app.use(express.static(__dirname + '/public'));

// route root through routes/all
app.use('/', routes);

// route data server through data routes (fake database that just reads csv files and returns json requests)
app.use('/data/', dataroutes);

module.exports = app;
