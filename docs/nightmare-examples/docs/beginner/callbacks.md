# Callbacks

> **WARNING:** This functionality is not directly supported.  Use at your own risk.

Using `.run()`, plain callbacks can be used to control Nightmare.  The following example searches for `github nightmare` at Yahoo and returns the first HREF in the search results:

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
  //run the queue of commands specified
  .run(function(error, result) {
    if (error) {
      console.error(error);
    } else {
      console.log(result);
    }
  });
```

## References
- [Runnable callback examples](https://github.com/rosshinkley/nightmare-examples/tree/master/examples/beginner/callbacks)
- [Nightmare #516](https://github.com/segmentio/nightmare/issues/516) - much of the content here was borrowed from [@Mr0grog](https://github.com/Mr0grog)'s excellent explanation.
