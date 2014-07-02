/*
 * Client-side (browser) logic for AIX Dashboard.
 */

/* Each button corresponds to the path of a GET request.
 * Group requests by the data format (text, table, object). */
var textActionList = [
  { button: 'Config',   route: function() { return 'config'; } },
  { button: 'OSLevel',  route: function() { return 'oslevel'; } },
  { button: 'PS',       route: function() { return 'ps'; } },
  { button: 'UserPS',   route: function() {
      return 'ps/' + $('#userInfo input#inputUserName').val(); }
  },
];
var tableActionList = [
  { button: 'FS',       route: function() { return 'filesystems'; } },
  { button: 'Logins',   route: function() { return 'logins'; } },
  { button: 'Packages', route: function() { return 'packages'; } },
  { button: 'NPMs',     route: function() { return 'npms'; } },
];
var objectActionList = [
  { button: 'UserInfo', route: function() {
      return 'user/' + $('#userInfo input#inputUserName').val(); }
  },
];

/* On page load ... */
$(document).ready(function() {
  /* Populate status information (#identity/#uptime). */
  $.get('/uname',  function(text) { $('#identity').html(text); });
  $.get('/uptime', function(text) { $('#uptime').html(text); });

  /* Link to source code viewer (#navigation). */
  $('#navigation').html('<a href="/source" target="_blank">[view source]</a>');

  /* Initialize output pane with some helpful text. */
  displayStatus('Choose an action above');

  /* Define button actions for each format type. */
  textActionList.forEach(function(entry) {
    $('#btn' + entry.button).on('click', function() {
      retrieveText(entry.route());
    });
  });
  tableActionList.forEach(function(entry) {
    $('#btn' + entry.button).on('click', function() {
      retrieveTable(entry.route());
    });
  });
  objectActionList.forEach(function(entry) {
    $('#btn' + entry.button).on('click', function() {
      retrieveObject(entry.route());
    });
  });

  /* Define 'Send' button action. */
  $('#btnSendMessage').on('click', sendMessage);
});

/*
 * Convenience routines to populate output pane (#cmdOutput).
 */
function displayOutput(html) {
  $('#cmdOutput').html(html);
}

function displayStatus(text) {
  displayOutput('<i>' + text + '</i>');
}

/*
 * Retrieve and display raw text information.
 */
function retrieveText(route) {
  if (route[route.length - 1] == '/') { displayStatus('Invalid input.'); return; }
  displayStatus('Retrieving data...');
  $.get('/' + route, function(text) {
    displayOutput('<pre>' + text + '</pre>');
  });
}

/*
 * Retrieve and display JSON data in table format.
 * This logic expects to receive an array of objects.
 */
function retrieveTable(route) {
  if (route[route.length - 1] == '/') { displayStatus('Invalid input.'); return; }
  displayStatus('Retrieving data...');
  $.getJSON('/' + route, function(data) {
    if (data == undefined || data.length == 0) {
      displayStatus('No data.');
    } else {
      var body = '';
      var obj = data[0];
      var columns = [];

      body += '<table id="list">';
      body += '<tr>';
      for (var field in obj) {
        columns.push(field);
        body += '<th>' + field + '</th>';
      }
      body += '</tr>';
      data.forEach(function(obj) {
        body += '<tr>';
        columns.forEach(function(field) {
          body += '<td>' + obj[field] + '</td>';
        });
        body += '</tr>';
      });
      body += '</table>';

      displayOutput(body);
    }
  });
}

/*
 * Retrieve and display JSON data in field/value format.
 * This logic expects to receive an array consisting of a single object.
 */
function retrieveObject(route) {
  if (route[route.length - 1] == '/') { displayStatus('Invalid input.'); return; }
  displayStatus('Retrieving data...');
  $.getJSON('/' + route, function(data) {
    if (data == undefined || data.length != 1) {
      displayStatus('No data.');
    } else {
      var body = '';
      var obj = data[0];
      body += '<table id="object">';
      for (var field in obj) {
        body += '<tr>';
        body += '<th>' + field + ':</th>';
        body += '<td>' + obj[field] + '</td>';
        body += '</tr>';
      }
      body += '</table>';
      displayOutput(body);
    }
  });
}

function sendMessage() {
  var message = {
    text: $('#messageInfo input#inputMessageText').val(),
    tty:  $('#messageInfo input#inputMessageTTY').val()
  };

  if (message.text === '' || message.tty === '') {
    displayStatus('Invalid input.');
    return;
  }

  /* Use AJAX to post the object to our message service. */
  $.ajax({
    type: 'POST',
    data: message,
    url: '/message',
    dataType: 'JSON'
  }).done(function( response ) {
    if (response.msg === '') {
      displayStatus('Message delivered.');
    } else {
      displayOutput('<pre>' + response.msg + '</pre>');
    }
  });
}
