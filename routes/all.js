var express = require('express')
    , path = require('path')
    , router = express.Router();

router.route('/')
    .get(function(request,response)
    {
        response.render('index.html');
    });

module.exports = router;


