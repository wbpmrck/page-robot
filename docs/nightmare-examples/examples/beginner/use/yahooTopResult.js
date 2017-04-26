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
