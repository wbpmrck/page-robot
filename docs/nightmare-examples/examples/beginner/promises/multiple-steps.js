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
