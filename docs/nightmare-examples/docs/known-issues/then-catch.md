# `then...catch`
The internal `.then()` method to Nightmare does not work precisely like native Promise `.then()`, instead _always_ opting to take the success and rejection callback for the promise.  This was probably done to make sure `vo`, `co`, and possibly `mocha-generators` would work nicely with Nightmare.

The side effect of this is minor, causing exceptions internal to `.then()` to behave differently to their Promise counterparts.  Consider: 

```js
var Nightmare = require('nightmare');
var nightmare = Nightmare();
nightmare
  .goto('http://example.com')
  .wait('body')
  .evaluate(function() {
    return document.title;
  })
  .then(function(title) {
    console.oops(title);
  }, function(err) {
    console.log('second argument error');
  });
```
In an ordinary promise, the rejection argument would not get called, yet in Nightmare, it does.

## Solution
Alter the `.then()` implementation to call `.then(fulfill, reject)` instead of `.then(fulfill).catch(reject)`.  As yet, PR is unsubmitted.

## References
- [Nightmare #527](https://github.com/segmentio/nightmare/issues/527) - discusses how `.then()` in Nightmare doesn't exactly match Promise's `.then()`
- [MDN Promise documentation](https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Global_Objects/Promise)
