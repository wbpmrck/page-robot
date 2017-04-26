require('mocha-generators').install();
var should = require('chai').should();
var Nightmare = require('nightmare');
var server = require('./server');

describe('Nightmare', function() {
  var nightmare;
  //before all of the tests,
  before(function(done) {
    //have the test server listen on a given port
    server.listen(7500, done);
  });

  //before each test,
  beforeEach(function(){
    //create a new nightmare instance
    nightmare = Nightmare();
  });
  
  //after each test,
  afterEach(function *(){ 
    //end the nightmare instance
    yield nightmare.end();
  })

  it('should check if the selector exists', function * () {
    //yield on the chain of actions that follows
    var exists = yield nightmare
      //go to the test url
      .goto('http://localhost:7500')
      //determine if the header with the title class exists
      .exists('h1.title');

    exists.should.be.true;

    //again, yield on the chain of actions that follow
    exists = yield nightmare
      //determine if there is an anchor with the blahblahblah class
      .exists('a.blahblahblah');

    exists.should.be.false;
  });
});

