# Using `.action()`

The `.action()` method allows the Nightmare prototype to be extended to include custom actions.  There are two main ways to use `.action()` - one, creating a method that calls `nightmare.evaluate_now` that acts like a named `.evaluate()` function; and two, creating a method that calls a custom Electron action.

## Defining a custom action with `.evaluate_now()`

Let's say you found yourself commonly executing an `.evaluate()` to perform an action.  For example, say we wanted to extract text from elements returned for a given selector:

```js
var Nightmare = require('nightmare');

//define a new Nightmare method named "textExtract"
//note that it takes a selector as a parameter
Nightmare.action('textExtract', function(selector, done) {
  //`this` is the Nightmare instance
  this.evaluate_now((selector) => {
    //query the document for all elements that match `selector`
    //note that `document.querySelectorAll` returns a DOM list, not an array
    //as such, convert the result to an Array with `Array.from`
    //return the array result
    return Array.from(document.querySelectorAll(selector))
      //extract and return the text for each element matched
      .map((element) => element.innerText);
  //pass done as the first argument, other arguments following
  }, done, selector)
});

//create a nightmare instance
var nightmare = Nightmare();
nightmare
  //go to a url
  .goto('http://example.com')
  //extract text, in this case for all headings
  .textExtract('h1, h2, h3, h4, h5, h6')
  //execute the command chain, extracting the headings
  .then((headings) => {
    //log the result
    console.log(headings);
  })
  //... do other actions...
  //end the nightmare instance
  .then(nightmare.end())
  .catch((e) => console.dir(e));
```

Please note:

- In the context of a method defined with `.action()`, `this` is bound to the Nightmare instance.
- The DOM list from `document.querySelectorAll` is an array-like, and because of that needs to be converted to an `Array` before being able to leverage array methods (`.map()` in this case).
- Parameters for `evaluate_now` are passed _after_ the `done` callback.

## Defining a custom action with an Electron method

Not all actions can be done with a simple evaluate.  Sometimes, it is necessary to use Electron's internals to perform an action that is not predefined in Nightmare.  For example, say we wanted to clear the cache between navigation:

```js
var Nightmare = require('nightmare');

//define a new Nightmare action named "clearCache"
Nightmare.action('clearCache',
  //define the action to run inside Electron
  function(name, options, parent, win, renderer, done) {
    //call the IPC parent's `respondTo` method for clearCache...
    parent.respondTo('clearCache', function(done) {
      //clear the session cache and call the action's `done`
      win.webContents.session.clearCache(done);
    });
    //call the action creation `done`
    done();
  },
  function(done) {
    //use the IPC child's `call` to call the action added to the Electron instance
    this.child.call('clearCache', done);
  });

//create a nightmare instance
var nightmare = Nightmare();

nightmare
  //go to a url
  .goto('http://example.com')
  //clear the cache
  .clearCache()
  //go to another url
  .goto('http://google.com')
  //perform other actions
  .then(() => {
    //...
  })
  //... other actions...
  .then(nightmare.end())
  .catch((e) => console.dir(e));
```

#### Electron method parameters

- **name** - the action name.
- **options** - the options hash that Electron was started with.
- **parent** - the IPC process used to communicate back to the Nightmare instance.
- **win** - a reference to the `browserWindow` instance from Electron.
- **renderer** - a reference to the Electron renderer.
- **done** - the callback method to call when the action setup is complete.

There is also an ambient reference to `require` so you can pull in libraries as you see fit.  Note that `require` will require from the Electron install location, so it is very likely you'll need to supply a relative or absolute path for the library you need.

#### IPC methods

- `nightmare.child.call(name, [args,] done)` - This method calls the `method` through the IPC process to the Electron process.  There is also some internal sugar to prevent multiple calls to the same method from getting results from a different call.
- `IPC.respondTo(name, done)` - This responds to the `child.call()` name, calling `done` when complete as a callback.  Note that data can be passed through `done` as a normal callback would.

## `.action()` must be called before instantiation

Be sure that the action is added to the Nightmare prototype before you create your instance of Nightmare.  Otherwise, the action will not be added to the instance.

## References

- [`Array.from`](https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Global_Objects/Array/from)
- [`document.querySelectorAll`](https://developer.mozilla.org/en-US/docs/Web/API/Document/querySelectorAll)
- [`.action()` documentation](https://github.com/segmentio/nightmare#nightmareactionname-electronactionelectronnamespace-actionnamespace)
- [runnable `.action()` examples](https://github.com/rosshinkley/nightmare-examples/tree/master/examples/beginner/action)
- [v3 plugin update proposal](https://github.com/segmentio/nightmare/issues/593#issuecomment-217209512)
