# Using `mocha-generators`

`mocha-generators` can be used for flow control while testing under `mocha`.  This allows `yield` to be used during testing, as well as grants the ability to use generators for `before`, `beforeEach`, `after`, and `afterEach`.  Currently, it is what Nightmare uses for unit testing.

Consider the following vanilla `mocha` test, which determines existence or nonexistence of elements:

```js
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

```

The above could be rewritten using generators for readability:

```js
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

```

## References
- [Runnable `mocha-generator` examples](https://github.com/rosshinkley/nightmare-examples/tree/master/examples/beginner/mocha-generators) - note you will need `mocha` installed
- [`mocha`](https://mochajs.org/)
- [MDN `function*` documentation](https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Statements/function*)
- [MDN `yield` documentation](https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Operators/yield)
- [Nightmare tests](https://github.com/segmentio/nightmare/blob/master/test/index.js)
