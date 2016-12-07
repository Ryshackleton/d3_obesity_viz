// usage: node_modules/mocha/bin/mocha -w app.js test.js 
var request = require('supertest');
var app = require('./app');

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

describe('Generic erroneous call to server', function(done) {
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


