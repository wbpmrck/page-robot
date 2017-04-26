var nightmare = require('nightmare')();
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
    console.log(href);
    return nightmare.end();
  })
  .then();
