const socket = io();

//input fields
const roomCodeInp = document.getElementById('roomCodeInp');
const roomCode = roomCodeInp.value;

const audio_player = document.getElementById('audio_player')
socket.emit('connected',roomCode);
socket.on('connected',()=>{
    location.replace('http://localhost:3000/index/' + roomCode);
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

