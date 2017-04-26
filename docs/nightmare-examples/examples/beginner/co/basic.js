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
