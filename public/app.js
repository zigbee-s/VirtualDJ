const socket = io();

//input fields
const roomCodeInp = document.getElementById('roomCodeInp');
const roomCode = roomCodeInp.value;
const usersInput = document.getElementById('users');
const audio_player = document.getElementById('audio_player')

const socketData = {
    roomCode: "",
    userName: "",
    usersArray: []
};



socket.emit('connected',roomCode);
socket.on('connected',(roomData)=>{
    socketData.roomCode = roomData.roomCode;
    usersInput.innerHTML="";
    socketData.usersArray = roomData.usersArray;
    socketData.usersArray.forEach(userName => {
        usersInput.innerHTML += `<li>${userName}</li>`; 
    });
})



const uploadFileInp = document.getElementById('uploadFileInp');
uploadFileInp.addEventListener('click',uploadSongHandler);





socket.on('message',message => {
    alert(message);
});

console.log(roomCode);

socket.on('started-song',hash_code =>{
    playMusic(hash_code);
})


function selected(hash_code){
    console.log("clicked");
    let data ={
        roomCode: roomCode,
        hash_code: hash_code,
    };
    socket.emit('started-song',data);
}

//Functions
function uploadSongHandler(){
    socket.emit('songUploaded',roomCode);
}

function playMusic(hash_code){
    console.log("we are here: "+hash_code);
    audio_player.muted =true;
    audio_player.setAttribute('src', '/audio/'+ hash_code);
}

