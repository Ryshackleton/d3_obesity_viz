// usage: node_modules/mocha/bin/mocha -w app.js test.js 
var request = require('supertest')
    , app = require('./app')
    , dbcsv = require('./routes/dbcsv')
    , chai = require('chai')
    , should = chai.should()
    , chaiHttp = require('chai-http');

chai.use(chaiHttp);

describe('Requests to the root path', function () {

  it('returns a 200 status code', function(done) {
    request(app)
      .get('/')
      .expect(200)
      .end(function(error) {
          if(error){ throw error; }
          done();
      });
  });

  it('returns HTML format', function(done) {
    request(app)
      .get('/')
      .expect('Content-Type', /html/, done);
  });

});

describe('Generic erroneous call to server', function() {
  it('returns the error page', function(done){
    request(app)
      .get('/badcall')
      .expect(404, done);
  });
  it('returns the error page in HTML format', function(done) {
    request(app)
      .get('/badcall')
      .expect('Content-Type', /html/, done);
  });
});

/* calls to /data/ */
describe('Calls to retrieve country data: /data/...', function()
{
    it('Return error on data with no parameters: /data/', function(done){
        request(app)
            .get('/data/')
            .end(function(err, res)
            {
                // there should be no errors
                should.not.exist(err);
                // there should be a 400 status code (bad request)
                res.status.should.equal(400);
                // the response should be text
                res.type.should.equal('text/html');
                done();
            });
    });
    it('Return error on data with one parameters: /data/blah', function(done){
        request(app)
            .get('/data/blah')
            .end(function(err, res)
            {
                // there should be no errors
                should.not.exist(err);
                // there should be a 400 status code (bad request)
                res.status.should.equal(400);
                // the response should be text
                res.type.should.equal('text/html');
                done();
            });
    });
    it('Return error on data with two parameters: /data/blah/blah', function(done){
        request(app)
            .get('/data/blah')
            .end(function(err, res)
            {
                // there should be no errors
                should.not.exist(err);
                // there should be a 400 status code (bad request)
                res.status.should.equal(400);
                // the response should be text
                res.type.should.equal('text/html');
                done();
            });
    });
});

var nCountries = 188;
var nCountryLocations = 219;

describe('Calls to retrieve country locations data: /data/locations/...', function()
{
    it('Return error on data/locations with too many parameters: /data/locations/blah', function(done){
        request(app)
            .get('/data/locations/blah')
            .end(function(err, res)
            {
                // there should be no errors
                should.not.exist(err);
                // there should be a 400 status code (bad request)
                res.status.should.equal(400);
                // the response should be text
                res.type.should.equal('text/html');
                done();
            });
    });
    it('Correct call for locations from server should retrieve an array of size 219: /data/locations/', function(done)
    {
        chai.request(app)
            .get('/data/locations')
            .end(function(err, res)
            {
                // there should be no errors
                should.not.exist(err);
                // there should be a 200 status code
                res.status.should.equal(200);
                // the response should be JSON
                res.type.should.equal('application/json');
                should.exist(res.body);
                var parsed = Object.keys(res.body).map(function(k)
                {
                    return res.body[k];
                });
                parsed.length.should.equal(nCountryLocations);
                done();
            });
    });
});

describe('Calls to retrieve country means data: /data/means/...', function()
{
    it('Return error if invalid variable is passed (year) /data/means/1989/obese', function(done)
    {
        chai.request(app)
            .get('/data/means/1989/obese')
            .end(function(err, res)
            {
                // there should be errors
                should.exist(err);
                // there should be a 400 status code (bad request)
                res.status.should.equal(400);
                // the response should be text
                res.type.should.equal('text/html');
                done();
            });
    });
    it('Return error if invalid variable is passed (obesity) /data/means/1990/blah', function(done)
    {
        chai.request(app)
            .get('/data/means/1990/blah')
            .end(function(err, res)
            {
                // there should be errors
                should.exist(err);
                // there should be a 400 status code (bad request)
                res.status.should.equal(400);
                // the response should be text
                res.type.should.equal('text/html');
                done();
            });
    });
    it('Return error if invalid variables are out of order /data/means/obese/1990', function(done)
    {
        chai.request(app)
            .get('/data/means/obese/1990')
            .end(function(err, res)
            {
                // there should be errors
                should.exist(err);
                // there should be a 400 status code (bad request)
                res.status.should.equal(400);
                // the response should be text
                res.type.should.equal('text/html');
                done();
            });
    });
    it('Correct call for obese values from server should retrieve an array of size 188: /data/means/1990/obese', function(done)
    {
        chai.request(app)
            .get('/data/means/1990/obese')
            .end(function(err, res)
            {
                // there should be no errors
                should.not.exist(err);
                // there should be a 200 status code
                res.status.should.equal(200);
                // the response should be JSON
                res.type.should.equal('application/json');
                should.exist(res.body);
                var parsed = Object.keys(res.body).map(function(k)
                {
                    return res.body[k];
                });
                parsed.length.should.equal(nCountries);
                done();
            });
    });
});

describe('Calls to retrieve country age group data: /data/agegroup/...', function()
{
    it('Return error if invalid variable is passed (year) /data/agegroup/notacountrycode/1990/obese', function(done)
    {
        chai.request(app)
            .get('/data/agegroup/notacountrycode/1990/obese')
            .end(function(err, res)
            {
                // there should be errors
                should.exist(err);
                // there should be a 400 status code (bad request)
                res.status.should.equal(400);
                // the response should be text
                res.type.should.equal('text/html');
                done();
            });
    });
    it('Return error if invalid variable is passed (obesity) /data/agegroup/USA/1990/blah', function(done)
    {
        chai.request(app)
            .get('/data/agegroup/USA/1990/blah')
            .end(function(err, res)
            {
                // there should be errors
                should.exist(err);
                // there should be a 400 status code (bad request)
                res.status.should.equal(400);
                // the response should be text
                res.type.should.equal('text/html');
                done();
            });
    });
    it('Return error if invalid variables are out of order /data/agegroup/USA/obese/1990', function(done)
    {
        chai.request(app)
            .get('/data/means/obese/1990')
            .end(function(err, res)
            {
                // there should be errors
                should.exist(err);
                // there should be a 400 status code (bad request)
                res.status.should.equal(400);
                // the response should be text
                res.type.should.equal('text/html');
                done();
            });
    });
    it('Correct call for age group values should retrieve 17 age groups: /data/agegroup/USA/1990/obese', function(done)
    {
        chai.request(app)
            .get('/data/agegroup/USA/1990/obese')
            .end(function(err, res)
            {
                // there should be no errors
                should.not.exist(err);
                // there should be a 200 status code
                res.status.should.equal(200);
                // the response should be JSON
                res.type.should.equal('application/json');
                should.exist(res.body);
                var parsed = Object.keys(res.body).map(function(k)
                {
                    return res.body[k];
                });
                parsed.length.should.equal(17);
                done();
            });
    });
});
