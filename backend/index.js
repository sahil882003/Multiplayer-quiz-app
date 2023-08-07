const express = require('express');
const app = express();
const cors = require("cors");
app.use(cors());
const http = require('http');
const server = http.createServer(app);
const { Server } = require("socket.io");
const { questions, answers } = require("./questions");



const io = new Server(server, {
    cors: {
        origin: "*",
        methods: ["GET", "POST"]
    }
});

var count = 0;

const math = [];
const science = [];
const physics = [];
const scores = [];



io.on("connection", (socket) => {
    console.log("a user connected")
    socket.on("find", (data) => {
        const activeuser = {
            name: data.name,
            socket: socket
        }
        if (data.subject === "maths") {
            math.push(activeuser);
            if (math.length >= 2) {
                math[0].socket.join(count);
                math[1].socket.join(count);

                io.to(count).emit("connected", { user1: math[0].name, user2: math[1].name, roomid: count, questions: questions.maths });
                count++;
                math.splice(0, 2);
            }
        }
        else if (data.subject == "science") {
            science.push(activeuser);
            if (science.length >= 2) {
                science[0].socket.join(count);
                science[1].socket.join(count);

                io.to(count).emit("connected", { user1: science[0].name, user2: science[1].name, roomid: count, questions: questions.science });
                count++;
                science.splice(0, 2);
            }
        }
        else {
            physics.push(activeuser);
            if (physics.length >= 2) {
                physics[0].socket.join(count);
                physics[1].socket.join(count);

                io.to(count).emit("connected", { user1: physics[0].name, user2: physics[1].name, roomid: count, questions: questions.physics });
                count++;
                physics.splice(0, 2);
            }
        }


    })
    function listener(data) {
        var useranswers = data.answers;
        var correctanswers;
        var score = 0;
        if (data.subject === "maths") {
            correctanswers = answers.maths;
        }
        else if (data.subject === "science") {
            correctanswers = answers.science;
        }
        else {
            correctanswers = answers.physics;
        }

        for (var i = 0; i < correctanswers.length; i++) {

            if (useranswers[i] == undefined)
                continue;
            if (correctanswers[i] === parseInt(useranswers[i]) + 1)
                score++;
        }
        var rescore = scores.find((score) => {
            if (score.roomid === data.roomid)
                return true;
            else
                return false;
        });
        if (rescore === undefined) {
            rescore = {
                roomid: data.roomid,

            };
            rescore[data.name] = score;
            scores.push(rescore);
        }
        else {
            rescore[data.name] = score;
        }



        if (Object.keys(rescore).length === 3) {

            io.to(data.roomid).emit("completed", rescore);
        }
    }
    socket.on("check", listener);
    socket.on("free", (data) => {

        var index = scores.findIndex((score) => {

            if (score.roomid === data.roomid) {
                return true;
            }
            else {
                return false;
            }
        });
        if (index !== -1) {
            scores.splice(index, 1);
        }
       
    })

    socket.on("disconnect", () => {
        
        console.log("a user disconnected");

    })

})


server.listen(3001, () => {
    console.log("server is on and running at port 3001");
})