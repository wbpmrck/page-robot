# Defining reusable parts with `.use()`

`.use()` is intended to provide a handy way to add groups of actions commonly executed together to the queue without calling them individually.  This also allows for complex, composable actions.

## Grouping Actions

As an example, say we wanted to group the navigation, typing in a search bar, and the clicking of the form submission into one single repeatable action.  Consider:

```js
var Nightmare = require('nightmare');
var nightmare = Nightmare()

//define a function to be used
var yahooTopResult = function(search) {
  //return a closure that takes the nightmare instance as the only argument
  return function(nightmare) {
    //using the given nightmare instance,
    nightmare
      //goto the yahoo homepage
      .goto('http://yahoo.com')
      //search for the given search term
      .type('form[action*="/search"] [name=p]', search)
      //search
      .click('form[action*="/search"] [type=submit]')
      //wait for the results
      .wait('#web')
      //get the text and href of the first result
      .evaluate(function() {
        var element = document.querySelector('#web a');
        return {
          text: element.innerText,
          href: element.href
        };
      });
  };
};

nightmare
  //use the `yahooTopResult` function to add actions to search for "github nightmare"
  .use(yahooTopResult('github nightmare'))
  //print the result
  .then(function(result) {
    console.log(result)
  })
  //use the `yahooTopResult` function again to search for "electron"
  .then(() => nightmare.use(yahooTopResult('electron')))
  //print the result and end
  .then(function(result){
    console.log(result);
    return nightmare.end();
  })
  .then(() => console.log('done'))
  .catch(function(error) {
    console.error('Search failed:', error);
  });
```

This works by a Nightmare instance passing a reference to itself to `.use()` to have actions (in this case, `goto`, `type`, `click`, `wait`, and `evaluate`) added to the queue prior to execution.

## References

- [`.use()` documentation](https://github.com/segmentio/nightmare#useplugin)
- [runnable `.use()` examples](https://github.com/rosshinkley/nightmare-examples/tree/master/examples/beginner/use)
