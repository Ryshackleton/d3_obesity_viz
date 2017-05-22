/**
 * Created by ryshackleton on 5/21/17.
 */

var express = require('express')
    , router = express.Router()
    , Baby = require('babyparse')
    , path = require('path')
    , fs = require("fs")
    // file locations /data/file.csv, /data is in root directory, one directory above this one
    , countryGeoJSONFile = path.join(__dirname,'..','data', 'countries.topo.notrans.json')
    , locationsFile = path.join(__dirname, '..', 'data', 'locations.csv')
    , countrymeansFile = path.join(__dirname, '..', 'data', 'IHME_GBD_COUNTRY_MEANS.CSV')
    , ageGroupFilePrefix = path.join(__dirname, '..', 'data', 'IHME_GBD_BOTHSEX_')
    , ageGroupFileSuffix = '.CSV'
;

function genericErrorResponse() { return 'Bad Request: request should be /data/means/..., /data/agegroup/..., or /data/locations/...'; }

router.route('/')
    .get(function(request,response){
        response.status(400).send(genericErrorResponse());
    });

router.route('/worldgeojson/')
    .get(function(request,response){
        try
        {
            fs.readFile(countryGeoJSONFile, function (err, data) {
                // send the response as a json string
                response.json(JSON.parse(data));
            });
        }
        catch(e)
        {
            response.status(400).send('Bad Request: '+e.message);
        }
        
    });
router.route('/locations/')
    .get(function(request,response){
        try
        {
            const babyOpts = {
                header: true,
                delimiter: ",",
                complete: parseResponse // callback on complete of read csv file
            };
        
            fs.readFile(locationsFile, function (err, data) {
                Baby.parse(data.toString(), babyOpts );
            });
        
            // parses file for year and obesity values
            function parseResponse(results,err) {
                if (err) {
                    throw err;
                }
            
                // send the response as a json string
                response.json(results.data);
            }
        }
        catch(e)
        {
            response.status(400).send('Bad Request: '+e.message);
        }
        
    });

router.route('/means/:year/:obese')
    .get( function(request,response)
    {
        // parameter checking
        if(!(request.params.obese === "obese" || request.params.obese === "overweight"))
        {
            response.status(400).send('Bad Request: ' + "obesity parameter must be 'obese' or 'overweight'");
            return;
        }
        if(!(+request.params.year >= 1990 && +request.params.year <= 2013) )
        {
            response.status(400).send('Bad Request: ' + "year parameter must be an integer between 1990-2013");
            return;
        }
        
        try
        {
            const babyOpts = {
                header: true,
                delimiter: ",",
                complete: parseResponse // callback on complete of read csv file
            };
    
            fs.readFile(countrymeansFile, function (err, data) {
                Baby.parse(data.toString(), babyOpts );
            });
            
            // parses file for year and obesity values
            function parseResponse(results,err) {
                if (err) {
                    throw err;
                }
                // pass in the contents of a csv file
                var ungrouped = Object.keys(results.data).map(function(key)
                {
                    return results.data[key];
                });
    
                var parsed = ungrouped.reduce(function(grouped, d)
                {
                    if(d.location !== undefined
                        && d.metric === request.params.obese
                        && d.year === request.params.year )
                    {
                        grouped.push(
                            {
                                "year" : d.year,
                                "countrycode": d.location,
                                "countryname": d.location_name,
                                "mean": +d.mean,
                                "obese_overweight": d.metric
                            }
                        );
                    }
                    return grouped;
                }, []);
    
                // send the response as a json string
                response.json(parsed);
            }
        }
        catch(e)
        {
            response.status(400).send('Bad Request: '+e.message);
        }
    });


router.route('/agegroup/:countrycode/:year/:obese')
    .get( function(request,response)
    {
        // parameter checking
        if(!(request.params.obese === "obese" || request.params.obese === "overweight"))
        {
            response.status(400).send('Bad Request: ' + "obesity parameter must be 'obese' or 'overweight'");
            return;
        }
        if(!(+request.params.year >= 1990 && +request.params.year <= 2013) )
        {
            response.status(400).send('Bad Request: ' + "year parameter must be an integer between 1990-2013");
            return;
        }
        
        try
        {
            var babyOpts = {
                header: true,
                delimiter: ",",
                complete: parseResponse // callback on complete of read csv file
            };
            
            fs.readFile(ageGroupFilePrefix + request.params.year + ageGroupFileSuffix, function (err, data) {
                Baby.parse(data.toString(), babyOpts );
            });
            
            // parses file for year and obesity values
            function parseResponse(results,err) {
                if (err) {
                    throw err;
                }
                // pass in the contents of a csv file
                var ungrouped = Object.keys(results.data).map(function(key)
                {
                    return results.data[key];
                });
                
                var parsed = ungrouped.reduce(function(grouped, d)
                {
                    if(d.location === request.params.countrycode
                        && d.metric === request.params.obese
                        && d.year === request.params.year
                        && !d.age_group.includes("standard")
                    )
                    {
                        grouped.push(
                            {
                                "year" : d.year,
                                "countrycode": d.location,
                                "countryname": d.location_name,
                                "obese_overweight": d.metric,
                                "mean": +d.mean,
                                "age_group": d.age_group
                            }
                        );
                    }
                    return grouped;
                }, []);
                
                // send the response as a json string
                if( parsed.length )
                    response.json(parsed);
                else
                    response.status(400).send('Bad Request: ' + request.params.countrycode + " not found");
            }
        }
        catch(e)
        {
            response.status(400).send('Bad Request: '+e.message);
        }
    });

router.route('/:incorrect/')
    .get(function(request,response){
        response.status(400).send(genericErrorResponse());
    });

router.route('/:incorrect/:incorrect')
    .get( function(request,response)
    {
        try
        {
            response.status(400).send(genericErrorResponse());
        }
        catch(e)
        {
            response.status(400).send(genericErrorResponse());
        }
    });

module.exports = router;
