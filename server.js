const {makeid} = require('./utils');
const path = require('path');
const fs = require('fs');
const multer = require('multer');
const express = require('express');
const socketio = require('socket.io');
const http = require('http');
const session = require('express-session');

const AWS = require('aws-sdk');
AWS.config.update({region: 'us-east-1'});

const { v4: uuidv4 } = require('uuid');

//Setting up the server
const app = express();
const server = http.createServer(app);
const io = socketio(server);

//Assigning port for node to listen to
const PORT = process.env.PORT || 3000;

server.listen(PORT,()=>{console.log(`Listening to port ${PORT}`)});


//Stores data about all the rooms
const rooms = [];

//Listening on socket
io.on('connection',(socket)=>{
    socket.on('create-room',handleCreateRoom);
    socket.on('join-room', handleJoinRoom);
    socket.on('connected', handleConnect);
    socket.on('started-song', handlePlaySong);

    //Functions
    function handleCreateRoom(userName){
        //Getting a random room number from makeid function
        
        if(userName == ""){
            socket.emit('message','Please enter a valid username');
            return;
        }

        const roomCode = makeid(5);

        //Creating and adding room object to the rooms list
        rooms[roomCode] = {
            roomCode: roomCode,
            usersArray: [],
        }

        // Adding user to user array
        rooms[roomCode].usersArray.push(userName);
        console.log(rooms[roomCode]);

        //Joining a room
        socket.join(roomCode);
        socket.emit("joined",roomCode);    
    }


    function handleJoinRoom(data){
        //Check whether the room exists
        const roomCode = data.roomCode;
        if(rooms[roomCode]){

            //Checking whether client has entered the User Name
            if(data.user == ""){
                socket.emit('message','Please enter a valid username');
                return;
            }

            rooms[roomCode].usersArray.push(data.user);
            socket.emit("joined",roomCode);
            
        }
        else{
            socket.emit("message",`The room ${roomCode} doesn't exist`);
        }}


    function handleConnect(roomCode){
        socket.join(roomCode);
        io.to(roomCode).emit('connected',rooms[roomCode]);

    }

    function handlePlaySong(data){
        io.to(data.roomCode).emit('started-song',data.hash_code);
    }

})
//set ejs framework
app.set('view engine','ejs');
app.use(express.static('./public'));

var userSession = [];

var songs_data =[];


var hash_table = [];

var AWS_BUCKET_NAME = "gsongs-party"

const s3 = new AWS.S3({
    accessKeyId: process.env.AWS_ID,
    secretAccessKey: process.env.AWS_SECRET
});

const storage = multer.memoryStorage({
    destination: function(req, file, callback){
        callback(null, '')
    }
})

const upload = multer({storage}).single('image');


app.get('/',(req,res) => {
    res.render("form");
});


app.get('/audio/:id',(req,res)=>{
    var hash_code = req.params.id;
    console.log("hash_code: "+hash_code);
    console.log("table: "+hash_table);

    const audioStream = s3.getObject({
        Bucket: AWS_BUCKET_NAME,
        Key: hash_code + ".mp3"
    }).createReadStream();

    res.set('content-type', 'audio/mp3');
    res.set('accept-ranges', 'bytes');
    
    audioStream.pipe(res);
});

app.get('/index/:id',(req,res)=>{
    res.render("index", {data : {songsData: songs_data, roomCode: req.params.id}})
})

app.post('/upload/:id', upload, (req,res) => {
    let myFile = req.file.originalname.split(".");
    const fileType = myFile[myFile.length -1];
    const hash_code = uuidv4();

    const params = {
        Bucket: AWS_BUCKET_NAME,
        Key: `${hash_code}.${fileType}`,
        Body: req.file.buffer
    };

    s3.upload(params, (error,data) => {
        if(error){
            console.log(error);
        }
        else{
            songs_data.push({
                hash_code: hash_code,
                songs_name: myFile[0]
            });
            
            hash_table[hash_code] = myFile[0];
            res.redirect(`/index/${req.params.id}`);
        }
    })
})

