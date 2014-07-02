/*
 * Server-side (node.js) logic for source code viewer.
 */

var express = require('express');
var router = express.Router();
var child = require('child_process');

var files = [ 'package.json', 'bin', 'app.js', 'routes', 'views', 'public' ];

/* Define route to GET home page. */
router.get('/', function(req, res) {
  res.render('source', { title: 'Source' });
});

/* Define route to GET source file list. */
router.get('/find', function(req, res) {
  var cmd = 'find ' + files.join(' ') + ' -type f | grep -v \\~';
  child.exec(cmd, function(error, stdout, stderr) {
    res.send(error ? stderr : stdout);
  })
});

module.exports = router;
