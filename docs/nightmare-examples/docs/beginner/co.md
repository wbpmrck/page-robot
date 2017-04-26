# Using `co`

[`co`](https://github.com/tj/co) is a flow library allowing for non-blocking code.  With Nightmare, you can use it to `yield` call chains.  The following example searches for `github nightmare` at Yahoo and returns the first HREF in the search results:

```js
var Nightmare = require('nightmare'),
  co = require('co'),
  nightmare = Nightmare({
    show: true
  });

var run = function*() {
  //declare the result and wait for Nightmare's queue defined by the following chain of actions to complete
  var result = yield nightmare
    //load a url
    .goto('http://yahoo.com')
    //simulate typing into an element identified by a CSS selector
    //here, Nightmare is typing into the search bar
    .type('input[title="Search"]', 'github nightmare')
    //click an element identified by a CSS selector
    //in this case, click the search button
    .click('#uh-search-button')
    //wait for an element identified by a CSS selector
    //in this case, the body of the results
    .wait('#main')
    //execute javascript on the page
    //here, the function is getting the HREF of the first search result
    .evaluate(function() {
      return document.querySelector('#main .searchCenterMiddle li a')
        .href;
    });


  //queue and end the Nightmare instance along with the Electron instance it wraps
  yield nightmare.end();

  //return the HREF
  return result;
};

//use `co` to execute the generator function
co(run)
  .then(function(result) {
    console.log(result);
  }, function(err) {
    console.log(err);
  });
```

Nightmare internally (partially) implements promises by exposing `.then()`.  This allows it to be `yield`able for use under `co`.

## Parameters
Parameters in `co` are passed by using `co.wrap()`.  The following example is the same as above, with the selector for the link `href` passed in.  This also shows how to pass parameters from the parent Nightmare process to the child Electron process through `.evaluate()`:

```js
var Nightmare = require('nightmare'),
  co = require('co'),
  nightmare = Nightmare({
    show: true
  });

//the generator accepts the selector to get the first search result
var run = function * (selector) {
  //declare the result and wait for Nightmare's queue defined by the following chain of actions to complete
  var result = yield nightmare
    //load a url
    .goto('http://yahoo.com')
    //simulate typing into an element identified by a CSS selector
    //here, Nightmare is typing into the search bar
    .type('input[title="Search"]', 'github nightmare')
    //click an element identified by a CSS selector
    //in this case, click the search button
    .click('#uh-search-button')
    //wait for an element identified by a CSS selector
    //in this case, the body of the results
    .wait('#main')
    //execute javascript on the page
    //here, the function is getting the HREF of the first match do the selector parameter
    //note the selector is passed in as the second argument to evaluate
    .evaluate(function(selector) {
      return document.querySelector(selector)
        .href;
    }, selector);

  //queue and end the Nightmare instance along with the Electron instance it wraps
  yield nightmare.end();

  //return the HREF
  return result;
};

//use `co.wrap()` to execute the generator function, allowing parameters to be passed to the generator
co.wrap(run)('#main .searchCenterMiddle li a')
  .then(function(result) {
    console.log(result);
  }, function(err) {
    console.log(err);
  });
```

## References
- [co](https://github.com/tj/co)
- [Original Yahoo example](https://github.com/segmentio/nightmare#examples)
- [Runnable `co` examples](https://github.com/rosshinkley/nightmare-examples/tree/master/examples/beginner/co)
- [MDN `function*` documentation](https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Statements/function*)
- [MDN `yield` documentation](https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Operators/yield)
