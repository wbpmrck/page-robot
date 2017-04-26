# Globally defined variables

When using `.inject()` to put a script into the current page, it seems reasonable that it would behave like any `<script>` tag, like the following:

```html
<script src='http://somecdn.tld/files/your-injected-file.js'></script>
```

...or:

```html
<script>
  //your script injected here
</script>
```

`.inject()` does not add a script tag.  Instead, the injected javascript is run through a template that puts the script inside of a function scope.  Any implicit globally defined variable will not be available on the global scope.  Consider the following Nightmare script:

```js
var Nightmare = require('nightmare'),
    path = require('path'),
    nightmare = Nightmare();

nightmare.goto('http://example.com')
    .inject('js', path.resolve(__dirname, 'inject.js'))
    .evaluate(function(){
        return globalVariable;
    })
    .end()
    .then(function(globalVariable){
        console.log('global variable: ' + globalVariable);
    });
```

The `inject.js` script injected above:

```js
var globalVariable = 'hello world!';
```

The above is executing a case similar to the following:

```js
var response = function(){
  globalVariable = 'hello world!';
}
return globalVariable;
```

Since `globalVariable` has fallen out of scope, it can no longer be accessed.  Nightmare will hang as `globalVariable` being undefined causes a runtime exception.  Implicit global variables are common to older versions of jQuery that expose `$` as a global variable instead of attaching to `window`.

## Solution
Patch global variables explicitly onto `window`.  If the injected script from above was altered like so:

```js
window.globalVariable = 'hello world!';
```

... the Nightmare script behaves as expected.

## References
- [`.inject()` Documentation](https://github.com/segmentio/nightmare#injecttype-file)
- [Nightmare #524](https://github.com/segmentio/nightmare/pull/524)
