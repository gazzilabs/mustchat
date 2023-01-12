 const express = require('express'),
    http = require('http'),
    app = express(),
    server = http.createServer(app),
    io = require('socket.io')(server);

app.get('/', (req, res) => {
    res.sendFile(__dirname+'/index.html');
});

var numUsers=0;
var usernames=[];
io.on('connection', function (socket) {
    var addedUser = false;
    socket.on('join', function (username) {
        if (addedUser) return;
        socket.username = username;
        ++numUsers;
        addedUser = true;
        usernames.push(socket.username);
        console.log(socket.username + "님이 접속하셨습니다.");
        console.log('접속한 사용자수 : '+numUsers+'명');
        socket.broadcast.emit('userjoinedthechat', socket.username + "님이 접속하셨습니다.");
        updateUsernames();
    });

    function updateUsernames(){
        io.sockets.emit('usernames', usernames);
    }

    socket.on('messagedetection', (senderNickname, messageContent) => {
        // 서버 콘솔상에 메시지 보여주기
        console.log(senderNickname + " :" + messageContent);
        //message object 생성
        let message = {"message": messageContent, "senderNickname": senderNickname}
        // 클라이언트(Web, Android)로 메시지 전송
        io.emit('message', message); // 나를 포함한 모든 클라이언트에게 전송
    });

    socket.on('disconnect', function () {
        if (addedUser) {
            --numUsers;
            usernames.splice(usernames.indexOf(socket.username), 1);
        }
        console.log(socket.username+"님이 퇴장했습니다");
        console.log('접속한 사용자수 : '+numUsers+'명');
        socket.broadcast.emit("userdisconnect", socket.username + "님이 퇴장했습니다");
        // 나를 제외한 모든 클라이언트에게 전송
        updateUsernames();
    });

});

server.listen(4000, () => {
    console.log('Node chat app is running on port 4000');
});