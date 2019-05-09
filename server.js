#!/usr/bin/env node
var playerLimit = 4;
var currentNoOfPlayers = 0;
/**
 * Module dependencies.
 */
var app = require("../app");
var debug = require("debug")("comp2930-team2:server");
var http = require("http");

var players = {};
///Code below will be put into different channels in the future to implement another game
var count = 0;
// var increaseX = 200;
// var times = 0;
const numberOfPlayers = 4;
const Game1_XYCoordinates = [{
        x: 110,
        y: 225,
        isTaken: false
    }, {
        x: 310,
        y: 225,
        isTaken: false
    },
    {
        x: 510,
        y: 225,
        isTaken: false
    }, {
        x: 710,
        y: 225,
        isTaken: false
    }
];


//TODO: //////////////////////////////////
//1. Implement limited number of max players ..
//How to get the variable e.g. numberOfPlayers from game.js?
//emit from game.js doesn't work...=> It can't come from the client side. use namespace instead.
//2. Give the players different colors..
//3. Is there way to get the initial spawn location coordinates from game.js?
//4. Use namespace(multiple channel feature of socket.io) to implement different game
/////////////////////////////////////////


/**
 * Get port from environment and store in Express.
 */

var port = normalizePort(process.env.PORT || "3000");
app.set("port", port);

/**
 * Create HTTP server.
 */

var server = http.Server(app);
var io = require('socket.io').listen(server);


/**
 * Listen on provided port, on all network interfaces.
 */

server.listen(port);
server.on("error", onError);
server.on("listening", onListening);

/**
 * Normalize a port into a number, string, or false.
 */

function normalizePort(val) {
    var port = parseInt(val, 10);

    if (isNaN(port)) {
        // named pipe
        return val;
    }

    if (port >= 0) {
        // port number
        return port;
    }

    return false;
}

/**
 * Event listener for HTTP server "error" event.
 */

function onError(error) {
    if (error.syscall !== "listen") {
        throw error;
    }

    var bind = typeof port === "string" ? "Pipe " + port : "Port " + port;

    // handle specific listen errors with friendly messages
    switch (error.code) {
        case "EACCES":
            console.error(bind + " requires elevated privileges");
            process.exit(1);
            break;
        case "EADDRINUSE":
            console.error(bind + " is already in use");
            process.exit(1);
            break;
        default:
            throw error;
    }
}

/**
 * Event listener for HTTP server "listening" event.
 */

function onListening() {
    var addr = server.address();
    var bind = typeof addr === "string" ? "pipe " + addr : "port " + addr.port;
    debug("Listening on " + bind);
}


//on the new user connection do the following
/// /////////
/// A1
/// server is up and running
/// server is made here. 
/// //////

/// Connected A901



io.on('connection', function(socket) {
    console.log('a user connected: ' + socket.id);
    let x, y, playerNo;


    // console.log(Object.keys(io.sockets.sockets));
    //Make new player by new connection on random x,y coordinates.
    // if(count+1 <= numberOfPlayers){
        
    if (currentNoOfPlayers < playerLimit){
        for (let i = 0; i < playerLimit; i++){
            if (!Game1_XYCoordinates[i].isTaken){
                Game1_XYCoordinates[i].isTaken = true; 
                playerNo = i;
        ///A3 creating player object.
        /// playerNo = count
        ///socket.id unique id given to the new player. 
        ///we have to pass into the game 
        /// if the room is full it wont add.

                players[socket.id] = {
                    playerNo: i,
                    playerId: socket.id,
                    // player spawn location x,y
                    // x: 110 + (increaseX * (times++)),
                    x:  Game1_XYCoordinates[i].x,
                    y:  Game1_XYCoordinates[i].y
                };
                console.log("new player added");
                currentNoOfPlayers++;

                break;
            }
        }
    } 
    else {
        console.log("room is full");
    }

    

    // send the players object to the new player
    ///A8 when the new player connects to the game, it sees whose already ther,
    ///this line sending the current player to the game.  players in an array.  pass in array of players.
    socket.emit('currentPlayers', players);
    // update all other players of the new player
    ///passing a new player object to the client by emiting.
    ///A5 sending it to the game file.
    socket.broadcast.emit('newPlayer', players[socket.id]);

    //user disconnect
    // when a player disconnects, remove them from our players object

    ///A10 disconnect. disconnect is a built in message which is connect and disconnect
    ///as well as creating your own name tag.
    ///using your own disconnect name tag, get rid of the players so its disconnected
    ///
    socket.on('disconnect', function() {
        console.log('count : ' + playerNo + ' / user disconnected: ', socket.id);
        if (Game1_XYCoordinates[playerNo]!=undefined) {
            Game1_XYCoordinates[playerNo].isTaken = false;
            delete players[socket.id];
            currentNoOfPlayers--;
            io.emit('disconnect', socket.id);
        } else {
            console.log("no disconnection");
        }

        // emit a message to all players to remove this player
    });

    // when a player moves, update the player data
    ///A11
    ///A13 recieves it, 
    ///then sends it to the other players in socket.broadcast.emit*'playermoved'
    socket.on('playerMovement', function(movementData) {
        players[socket.id].x = movementData.x;
        players[socket.id].y = movementData.y;
        // emit a message to all players about the player that moved
        socket.broadcast.emit('playerMoved', players[socket.id]);
    });

});


function getRandomInt(min, max) {
    return Math.floor(Math.random() * (max - min) + min);
}

function printPlayers(coordinates) {
    for (let i = 0; i < coordinates.length; i++) {
        console.log(coordinates[i].isTaken);
    }   
}
