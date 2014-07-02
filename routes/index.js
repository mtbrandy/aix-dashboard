/*
 * Server-side (node.js) logic for AIX Dashboard.
 */

var express = require('express');
var router = express.Router();
var child = require('child_process');

/* Define route to GET home page. */
router.get('/', function(req, res) {
  res.render('index', { title: 'AIX Dashboard' });
});

/* Each route corresponds to an AIX command and the data format of the
 * response message (text or JSON). */
var cmdList = [
  { route: 'config',      cmd: 'prtconf',                   cb: textResp },
  { route: 'filesystems', cmd: 'df -Pm',                    cb: jsonResp },
  { route: 'logins',      cmd: 'w',                         cb: jsonResp },
  { route: 'npms',        cmd: 'npm list --depth 0 --json', cb: npmResp },
  { route: 'oslevel',     cmd: 'oslevel -r',                cb: textResp },
  { route: 'packages',    cmd: 'lslpp -cl',                 cb: jsonResp },
  { route: 'ps',          cmd: 'ps -ef',                    cb: textResp },
  { route: 'ps',          cmd: 'ps -fu %s',                 cb: textResp },
  { route: 'uname',       cmd: 'uname -a',                  cb: textResp },
  { route: 'uptime',      cmd: 'uptime',                    cb: textResp },
  { route: 'user',        cmd: 'lsuser -c %s',              cb: jsonResp },
];

/* Define routes to GET formatted command output. */
cmdList.forEach(function(entry) {
  var route = '/' + entry.route;
  /* Append any required arguments to the route. */
  var nargs = entry.cmd.split('%').length - 1;
  for (var i = 0; i < nargs; i++) {
    route += '/:arg' + i;
  }
  router.get(route, function(req, res) {
    var cmd = entry.cmd;
    /* Insert argument values into the command string. */
    for (var i = 0; i < nargs; i++) {
      cmd = cmd.replace(/%s/, req.params['arg' + i]);
    }
    /* Execute the command and direct the result to the
     * corresponding callback routine. */
    child.exec(cmd, function(error, stdout, stderr) {
       entry.cb(entry.route, res, error, stdout, stderr);
    });
  });
});

/* Simple reply with the output text. */
function textResp(route, res, error, stdout, stderr) {
  res.send(error ? stderr : stdout);
}

/* Reply with an array of objects encoded as JSON. */
function jsonResp(route, res, error, stdout, stderr) {
  var objArray = [];
  var h = jsonRespHandlers[route];
  if (!error) {
    /* Construct array of objects from command output. */
    var lines = stdout.split('\n');
    var fields = h.getHeaders(lines);
    lines = h.getLines(lines);
    lines.forEach(function(line) {
      var obj = {};
      var values = h.getValues(line);
      for (var i = 0; i < fields.length; i++) {
        obj[fields[i]] = values[i];
      }
      objArray.push(obj);
    });
  }
  res.send(objArray);
}

/* Convert JSON output from npm command to our simple table format. */
function npmResp(route, res, error, stdout, stderr) {
  var objArray = [];
  if (!error) {
    var data = JSON.parse(stdout);
    var deps = data.dependencies;
    for (var module in deps) {
      var obj = {};
      obj.Module = module;
      obj.Version = deps[module].version;
      objArray.push(obj);
    }
  }
  res.send(objArray);
}

/* For each JSON route, define method to extract header and value
 * information from command output. */
jsonRespHandlers = {
  filesystems : {
    getHeaders: function(lines) {
      return [ 'Filesystem', 'MB-blocks', 'Used', 'Available',
               'Capacity', 'Mounted on' ];
    },
    getLines:   function(lines) { return lines.slice(1, lines.length - 1); },
    getValues:  function(line)  { return line.replace(/  */g, ',').split(','); },
  },
  packages : {
    getHeaders: function(lines) { return lines[0].slice(1).split(':'); },
    getLines:   function(lines) { return lines.slice(1, lines.length - 1); },
    getValues:  function(line)  { return line.split(':').slice(1); },
  },
  user : {
    getHeaders: function(lines) { return lines[0].slice(1).split(':'); },
    getLines:   function(lines) { return lines.slice(1, lines.length - 1); },
    getValues:  function(line)  { return line.split(':'); },
  },
  logins : {
    getHeaders: function(lines) { return lines[1].replace(/  */g, ',').split(','); },
    getLines:   function(lines) { return lines.slice(2, lines.length - 1); },
    getValues:  function(line)  { return line.replace(/  */g, ',').split(','); },
  },
};

/*
 * Define route to POST message.
 */
router.post('/message', function(req, res) {
    var message = req.body;
    var cmd = '';
    cmd += 'printf "\\nAIX Dashboard says: \\"' + message.text + '\\"\\n"';
    cmd += '> /dev/' + message.tty;
    child.exec(cmd, function(error, stdout, stderr) {
      res.send(error ? { msg: stderr } : { msg: '' });
    });
});

module.exports = router;
