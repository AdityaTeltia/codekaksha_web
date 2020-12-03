const path = require('path');
require('dotenv').config()
const express = require('express');
var ExpressPeerServer = require('peer').ExpressPeerServer;
const app = express();

const http = require('http');

const socketio = require('socket.io');

var { nanoid } = require("nanoid");
var ID = nanoid(4);

console.log(process.env.CLIENT_ID)
console.log(process.env.CLIENT_SECRET)


const server = http.createServer(app);

const io = socketio(server);


function onConnection(socket) {
	socket.on('join-room',(roomId,userId)=>{
		socket.join(roomId)
		console.log("heel")
		socket.to(roomId).broadcast.emit('user-connected',userId)
	})
	socket.on('drawing', (data) => socket.broadcast.emit('drawing', data));
	socket.on('message', (evt) => {
		console.log(evt);
		socket.broadcast.emit('message', evt);
	});
	// socket.on('catch_user', (stream) => {
	// 	socket.emit('user-connected', stream);
	// });
}

io.on('connection', onConnection);
const PORT = process.env.PORT || 3000;
const host = '0.0.0.0';
console.log(ID);
// app.set('view engine', 'ejs');
app.get('/', (req, res) => {
	console.log("helklo")
	res.redirect(`${ID}`);
});

app.get('/:index', (req, res) => {
	
	res.render('index', { roomId: req.params.room });
});
app.set('views', path.join(__dirname, 'public'));
app.engine('html', require('ejs').renderFile);
app.set('view engine', 'html');
app.use(express.static(path.join(__dirname, 'public')));
server.listen(PORT, host, function () {
	console.log('Server started.......');
});

var options = {
    debug: true,
    allow_discovery: true
}
let peerServer = ExpressPeerServer(server, options)
app.use('/peerjs', peerServer);

// var options = {
//     debug: true
// }
// app.use('/api', ExpressPeerServer(server, options));