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
