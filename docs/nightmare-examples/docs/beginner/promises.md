# Using Promises
Native promises are the preferred method for using Nightmare.  The following example searches for `github nightmare` at Yahoo and returns the first HREF in the search results:


```js
var Nightmare = require('nightmare'),
  nightmare = Nightmare({
    show: true
  });

nightmare
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
  })
  //end the Nightmare instance along with the Electron instance it wraps
  .end()
  //run the queue of commands specified, followed by logging the HREF
  .then(function(result) {
    console.log(result);
  })
  //catch errors if they happen
  .catch(function(error){
    console.error('an error has occurred: ' + error);
  });
```

## Running multiple steps
Promises are useful for chaining multiple steps together using `.then()`.  Say we wanted to change the Yahoo example to get the first link from the first _and_ second result page:

```js
var Nightmare = require('nightmare'),
  nightmare = Nightmare({
    show: true
  });

nightmare
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
  })
  //run the queue of commands specified, followed by logging the HREF
  .then(function(result) {
    console.log(result);
  })
  .then(function() {
    //since Nightmare has an internal `.then()`, return the instance returned by the final call in the chain
    return nightmare
      //click the next button to get the next page of search results
      .click('.next')
      //get the first HREF from the second page of results
      .evaluate(function() {
        return document.querySelector('#main .searchCenterMiddle li a')
          .href;
      })
  })
  .then(function(result) {
    //log the second page search result's HREF
    console.log(result);
    
    //queue ending the Nightmare instance along with the Electron instance it wraps
    //again, return the instance to leverage the internal `.then()`
    return nightmare.end();
  })
  //run the queue of commands specified
  //in this case, `.end()`
  .then(function() {
    console.log('done');
  })
  //catch errors if they happen
  .catch(function(error){
    console.error('an error has occurred: ' + error);
  });
```

Note that the Nightmare instance is getting returned.  Again, Nightmare exposes an internally defined version of `.then()` that can be leveraged to get the desired behavior.

## References
- [Runnable `Promise` examples](https://github.com/rosshinkley/nightmare-examples/tree/master/examples/beginner/promises)
- [`then...catch` issues](https://github.com/rosshinkley/nightmare-examples/blob/master/docs/known-issues/then-catch.md)
- [Original Yahoo example](https://github.com/segmentio/nightmare#examples)
- [MDN Promise documentation](https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Global_Objects/Promise)
