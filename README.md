# aix-dashboard

Example web app for AIX using node.js


## Installing

Download the AIX binary for the IBM SDK for Node.js from [IBM developerWorks](http://www.ibm.com/developerworks/web/nodesdk) and install.

Ensure you have the GNU Standard C++ Library (libstdc++) from the [Open Source Software Archive for AIX](http://www.bullfreeware.com/toolbox.php).

Clone the repository if you haven't already, and cd into it:

    git clone git://github.com/mtbrandy/aix-dashboard
    cd aix-dashboard

Install the NPM dependencies:

    npm install

## Running

Start the server on the default port (3000):

    npm start

You may optionally provide the port:

    PORT=<port> npm start

The server is now listening for connections.  Point your browser at http://_hostname_:_port_ and enjoy!
