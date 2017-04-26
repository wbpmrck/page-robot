# Asynchronous operations and loops

## Multiple operations on a single Nightmare instance
Nightmare is designed to have a single queue running against a single Electron instance.  Think of it like a web browser with a single tab - it can only navigate to one URL at a time and conduct actions against that one URL.  Actions are chained off of a Nightmare instance, and then executed with `.then()`.  For example:

```js
nightmare.goto('http://example.com')
    .title()
    .then(function(title){
        console.log(title);
    });
```

This example queues a navigation operation, then queues a request for the title of the page.  Finally, `.then()` is called to execute the operations that have been queued.

If titles from two pages were desired, there might be a temptation to do the following:

```js
nightmare.goto('http://example.com')
    .title()
    .then(function(title){
        console.log(title);
    });

nightmare.goto('http://example2.com')
    .title()
    .then(function(title){
        console.log(title);
    });
```
The expectation might be:

1. Go to `example.com`.
1. Get the title.
1. Print the title.
1. Go to `example2.com`.
1. Get the title.
1. Print the title.

Since the calls are both asynchronous, though, the actual call order would look something like:

1. Go to `example.com`.
1. Get the title.
1. Go to `example2.com`.
1. Get the title.
1. Print the title.
1. Print the title.

This example has two problems.  One, the queues are run independently.  The first queue will be mid-execution when the second queue is kicked off.  This creates a kind of race condition for the Electron process: remember, there is only one browser window now trying to perform two discrete sets of tasks.  The second has to do with how Nightmare sends and receives messages - Nightmare registers listeners for most operations, but it cannot distinguish between two calls of the same operation.  This example misbehaves because of design decisions made in Nightmare.

Executing the operations in series requires arranging them to execute in sequential order.  One way of correcting the above example:

```js
nightmare.goto('http://example.com')
  .title()
  .then(function(title) {
    console.log(title);
    nightmare.goto('http://google.com')
      .title()
      .then(function(title) {
        console.log(title);
      });
  });
```
The operations are now executed sequentially, producing the desired output.

## Loops
Executing loops magnifies the problems above.  Taking the above example, say titles for multiple domains was desired.  Consider:

```js
var urls = ['http://example.com', 'http://example2.com', 'http://example3.com'];

var results = [];
urls.forEach(function(url) {
  nightmare.goto(url)
    .wait('body')
    .title()
    .then(function(result) {
      results.push(result);
    });
});
console.dir(results)
```

This has the same problems as before: Nightmare is executing multiple queues against the same instance.  The above has a new wrinkle in that there could be an arbitrary nummber of URLs to go to.  The results will likely be empty as none of the Nightmare chains have had time to finish executing.

### Vanilla JS
A variable number of queues can be solved through `Array.reduce`.  Consider:

```js
var urls = ['http://example1.com', 'http://example2.com', 'http://example3.com'];
urls.reduce(function(accumulator, url) {
  return accumulator.then(function(results) {
    return nightmare.goto(url)
      .wait('body')
      .title()
      .then(function(result){
        results.push(result);
        return results;
      });
  });
}, Promise.resolve([])).then(function(results){
    console.dir(results);
});
```
The above executes each Nightmare queue in series, adding the results to an array.  The resulting accumulated array is resolved to the final `.then()` call where the results are printed.

### Using `vo`
A flow control library can also solve a variable number of queues.  Consider:

```js
var Nightmare = require('nightmare'),
  vo = require('vo'),
  nightmare = Nightmare();

var run = function * () {
  var urls = ['http://www.yahoo.com', 'http://example.com', 'http://w3c.org'];
  var titles = [];
  for (var i = 0; i < urls.length; i++) {
    var title = yield nightmare.goto(urls[i])
      .wait('body')
      .title();
    titles.push(title);
  }
  return titles;
}

vo(run)(function(err, titles) {
  console.dir(titles);
});
```


## References
- [Nightmare #465](https://github.com/segmentio/nightmare/pull/465) - a PR to fix multiple instances of Nightmare using the same `waitTimeout` value
- [Nightmare #522](https://github.com/segmentio/nightmare/issues/522) - Nightmare looping issue iterating over an array
- [Nightmare #533](https://github.com/segmentio/nightmare/issues/533) - Nightmare looping issue with a vanilla `for`
