/*
 * Client-side (browser) logic for source code viewer.
 */

$(document).ready(function() {
  /* Populate left pane (#fileList). */
  $.get('/source/find', function(text) {
    var body = '';
    var files = text.split('\n');
    var viewer = [];
    files.pop();

    /* Show dashboard files first. */
    body += '<table><tr>';
    body += '<th>Dashboard Source</th>';
    body += '</tr>';
    files.forEach(function(file) {
      if (file.search('source') >= 0) {
        viewer.push(file);
      } else {
        body += '<tr><td><li><a href="#" class="linkView" rel="' + file + '">';
        body += file;
        body += '</a></td></tr>';
      }
    });
    body += '</table>';

    /* Then show the files for this viewer. */
    if (viewer.length) {
      body += '<br><table><tr>';
      body += '<th>Code Viewer Source</th>';
      body += '</tr>';
      viewer.forEach(function(file) {
        body += '<tr><td><li><a href="#" class="linkView" rel="' + file + '">';
        body += file;
        body += '</a></td></tr>';
      });
      body += '</table>';
    }
    $('#fileList').html(body);

    /* Display first file in list on page load. */
    viewFile(files[0]);
  });

  /* Define link actions. */
  $('#fileList').on('click', 'td a.linkView', function() {
    viewFile($(this).attr('rel'));
  });
});

var pretty = 'https://google-code-prettify.googlecode.com/svn/loader/run_prettify.js';

/* Retrieve and display requested file (#fileName/#fileContents). */
function viewFile(file) {
  $('#fileName').html(file);
  $.get('src/' + file, function(text) {
    text = text.replace(/</g, '&lt;');
    text = text.replace(/>/g, '&gt;');
    var body = '';
    body += '<pre class="prettyprint">' + text + '</pre>';
    body += '<script src=' + pretty + '></script>';
    $('#fileContents').html(body);
  }, 'text');
}
