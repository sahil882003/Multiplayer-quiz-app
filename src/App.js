import React from "react";
import { useState, useEffect } from "react";
import io from "socket.io-client";

import { InfinitySpin } from 'react-loader-spinner'
const socket = io.connect("http://localhost:3001");
function App() {
  const [text, settext] = useState("");
  const [subject, setsubject] = useState("maths")
  const [roomid, setroomid] = useState(-2);
  const [user, setuser] = useState("");
  const [opponent, setopponent] = useState("");
  const [questions, setquestions] = useState([]);
  const [answers, setanswers] = useState({})
  const [score, setscore] = useState(0);

  const [success, setsuccess] = useState("");
  var id = 0;
  useEffect(() => {
    socket.off("connected").on("connected", data => {

      if (data.user1 === text) {


        setopponent(data.user2);
        setuser(data.user1);
      }
      else {


        setopponent(data.user1);
        setuser(data.user2);
      }

      setroomid(data.roomid);
      setquestions(data.questions);


    });
    socket.off("completed").on("completed", (data) => {
      setscore(data[text]);
      if (data[text] > data[opponent]) {
        setsuccess("won");
      }
      else if (data[text] < data[opponent]) {
        setsuccess("loss")
      }
      else {
        setsuccess("draw");
      }


    });

   



  }, [text, opponent])

  function handletext(e) {
    e.preventDefault();

    settext(e.target.value);
  }
  function handleclick(e) {
    e.preventDefault();
    setroomid(-1);

    socket.emit("find", { name: text, subject: subject });

  }
  function handlesubject(e) {
    e.preventDefault();
    setsubject(e.target.value);

  }

  function submission(e) {
    e.preventDefault();
    setscore(-1);
    socket.emit("check", { answers: answers, subject: subject, roomid: roomid, name: text });
  }

  function handleradio(e) {
    const obj = answers;
    obj[e.target.name] = e.target.value;

    setanswers(obj);



  }


  function home(e) {
    e.preventDefault();
    settext("");
    setsubject("maths");
    setroomid(-2);
    setuser("");
    setopponent("")
    setscore(0);
    setquestions([]);
    setanswers({});
    setsuccess("");
    socket.emit("free", { roomid: roomid, name: text });
    


  }
  return (

    <div className="Myroot">
      {roomid >= 0 && (
        <div className="user-details">
          <span className="user-info  white-text">user: <span className="user-name  white-text">{user}</span></span>
          <span className="opponent-info  white-text">opponent: <span className="opponent-name  white-text">{opponent}</span></span>
        </div>
      )}
      {!(roomid >= 0) && success.length === 0 && (
        <div className="search-section glass">
          {(roomid !== -1) &&
            <div>
              <input className="search-input" type="text" onChange={handletext} value={text} />
              <select className="search-select" id="subject" value={subject} onChange={handlesubject}>
                <option value="maths" style={{color:"black"}}>maths</option>
                <option value="science" style={{color:"black"}}>science</option>
                <option value="physics" style={{color:"black"}}>physics</option>
              </select>
              <div className="search-button-wrapper">
                <button className="search-button" onClick={handleclick}>search player</button>
              </div>
            </div>
          }
          {

            roomid === -1 &&
            <div className="search-user">
              <div style={{textAlign:"center"}}>
              <InfinitySpin
                width='200'
                color="white"
              />
              </div>
              <span className="loading-message white-text">Searching for player....</span>
            </div>


          }
        </div>
      )}




      {success.length === 0 && !(questions.length === 0) && !(score === -1) &&

        questions.map((data, i) => {
          return (
            <div className="question-container glass">
              <h3 key={id++} className="question white-text">{questions[i].question}</h3>
              {
                data.options.map((option, j) => {
                  return (
                    <div key={id++} className="option-container">
                      <input
                        key={id++}
                        type="radio"
                        className="option-radio"
                        name={i}
                        value={j}

                        onChange={handleradio}
                      ></input>
                      <label key={id++} className="option-label white-text">{option}</label>
                      <br key={id++} />
                    </div>
                  )
                })
              }
            </div>
          )
        })
      }

      {!(questions.length === 0) && success.length === 0 && (score !== -1) &&
        <div className="submit-button-container">
          <button className="submit-button" onClick={submission}>Submit</button>
        </div>
      }
      {score === -1 &&
        <div className="waiting-screen glass">
            <div style={{textAlign:"center",marginTop:"8%"}}>
              <InfinitySpin
                width='200'
                color="white"
              />
              </div>
          <span className="waiting-message white-text">Waiting for opponent's response...</span>
        </div>
      }
      {!(success.length === 0) &&
        <div className="after-game glass">
          <div className="after-game-wrapper">
            {success === "won" && <h1 className="game-result white-text">You won</h1>}
            {success === "loss" && <h1 className="game-result white-text">You lose</h1>}
            {success === "draw" && <h1 className="game-result white-text">Draw Match</h1>}

            <div className="home-botton-container">
              <button className="home-button" onClick={home}>Home Page</button>
            </div>
          </div>

        </div>
      }
    </div>

  );
}

export default App;
