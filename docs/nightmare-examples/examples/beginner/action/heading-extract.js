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
  
