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
  afterEach(function(done){ 
    //end the nightmare instance
    nightmare.end(done);
  })

  it('should check if the selector exists', function(done) {
    nightmare
      //go to the test url
      .goto('http://localhost:7500')
      //determine if the header with the title class exists
      .exists('h1.title')
      //execute the chain
      .then((exists) => {
        //assert existence
        exists.should.be.true;
      })
      .then(() => {
        //return a nightmare-thennable to check if an anchor with the blahblahblah class exists
        return nightmare.exists('a.blahblahblah')
      })
      .then((exists) => {
        //assert nonexistence
        exists.should.be.false;
      })
      //done
      .then(() => done());
  });
});

