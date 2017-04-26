var express = require('express');
var path = require('path');
var serve = require('serve-static');
var app = module.exports = express();
app.use(serve(path.resolve(__dirname, 'evaluation')));
if (!module.parent) app.listen(7500);
