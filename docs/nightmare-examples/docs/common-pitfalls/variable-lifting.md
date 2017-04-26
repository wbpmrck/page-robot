# Variable Lifting and `.evaluate()`

Variables defined in a Nightmare script cannot be closed over using `.evaluate()` since the enclosing scope where the `.evaluate()` function is defined is not the scope where the function is actually executed.  Consider:

```js
var selector = 'a';
nightmare
  .goto('http://yahoo.com')
  .type('form[action*="/search"] [name=p]', 'github nightmare')
  .click('form[action*="/search"] [type=submit]')
  .wait('#main')
  .evaluate(function() {
    return document.querySelector(selector)
      .href;
  })
  .then((href) => {
    //do something with href...
  })
  ...
};
```

The `.evaluate()` function is stringified and passed to Electron where it is parsed back into a function and finally executed in the site client context.  This means the original reference to `selector` is lost, and will be `undefined` when executed.  The `selector` variable needs to be passed along with the function in order to work:

```js
var selector = 'a';
nightmare
  .goto('http://yahoo.com')
  .type('form[action*="/search"] [name=p]', 'github nightmare')
  .click('form[action*="/search"] [type=submit]')
  .wait('#main')
  .evaluate(function(selector) {
    return document.querySelector(selector)
      .href;
  }, selector)
  .then((href) => {
    //do something with href...
  })
  ...
};
```

## References
- [`.evaluate()` documentation](https://github.com/segmentio/nightmare#evaluatefn-arg1-arg2)
