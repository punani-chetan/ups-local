const ws = require('ws');

// const socketIo = require('socket.io');
// const io = socketIo(server);
// const socket = require('./socket')(io);

const port = 9001;
// process.env.PORT for production
server.listen(port, () => console.log('server started on ' + port));

const wss = new ws.Server({ server });

wss.on('connection', (ws) => {

  //connection is up, let's add a simple simple event
  ws.on('message', (message) => {

      //log the received message and send it back to the client
     // console.log('received: %s', message);
      ws.send(`${message}`);
  });
});