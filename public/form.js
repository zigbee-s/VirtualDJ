const socket = io();

//Divs
const formDiv = document.getElementById('input-form');
const songListDiv = document.getElementById('song-list');

//Input boxes
const usernameInput = document.getElementById('username-input');
const joinRoomInput = document.getElementById('join-room-input');
const createRoomInput = document.getElementById('new-roomCode');

//Buttons
const joinBtn = document.getElementById('join-btn');
const createBtn = document.getElementById('create-btn');


const socketData = {
    roomCode: "",
    userName: "",
};


//Listininng For emits

// For any basic messages from server, mainly errors
socket.on('message',message => {
    alert(message);
});

socket.on('joined', roomCode => {
    location.replace('/index/' + roomCode);
})




//Button Handlers
joinBtn.addEventListener('click',joinButtonHandler);
createBtn.addEventListener('click',createButtonHandler);



// Functions
function createButtonHandler(){
    socket.emit("create-room");
}

function joinButtonHandler(){
    socketData.userName = usernameInput.value;
    let data = {
        roomCode : joinRoomInput.value,
        user : socketData.userName,
    }
    socket.emit("join-room",data);
};

function httpGetAsync(theUrl, callback)
{
    var xmlHttp = new XMLHttpRequest();
    xmlHttp.onreadystatechange = function() { 
        if (xmlHttp.readyState == 4 && xmlHttp.status == 200)
            callback(xmlHttp.responseText);
    }
    xmlHttp.open("GET", theUrl, true); // true for asynchronous 
    xmlHttp.send(null);
}


