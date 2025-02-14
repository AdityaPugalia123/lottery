import React, { useEffect, useRef } from "react";
import { useState } from "react";
function Grid() {
  useEffect(() => {
    fetch("https://lottery-server-c94n.onrender.com/users/1")
      .then((result) => {
        return result.json();
      })
      .then((data) => {
        setGameStatus("Not running");
        setArr1([...data.player1]);
        setArr2([...data.player2]);
        setRandomArr([...data.randomArr]);
        setWinner([...data.winner]);
        console.log(data);
      })
      .catch((err) => {
        console.log(err);
      });
  }, []);
  let [gameStatus, setGameStatus] = useState("Not running");
  let [arr1, setArr1] = useState([]);
  let [arr2, setArr2] = useState([]);
  let [popup, setpopup] = useState(false);
  let [message, setMessage] = useState("");
  let [randomArr, setRandomArr] = useState([]);
  const timerRef = useRef(null);
  let [winner, setWinner] = useState([]);
  function handle() {
    if (gameStatus == "Running") {
      randomGenerator();
    } else {
      clearInterval(timerRef.current);
    }
  }
  function postData() {
    fetch("https://lottery-server-c94n.onrender.com/users/1", {
      method: "PATCH",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        gameStatus: "Not running",
        randomArr: randomArr,
        winner: winner,
      }),
    })
      .then((result) => {
        return result.json();
      })
      .then((data) => {
        console.log(data);
      })
      .catch((err) => {
        console.log(err);
      });
  }
  function reset() {
    if (winner.length > 0) {
      // setGameStatus("Not running");
      // setArr1(["", "", "", "", "", "", "", "", ""]);
      // setArr2(["", "", "", "", "", "", "", "", ""]);
      randomArr = [];
      winner = [];
      setpopup(false);
      setRandomArr([]);
      setWinner([]);
      setMessage("");
    }
    setGameStatus("Not running");
    clearInterval(timerRef.current);
    postData();
  }
  function checkForDuplicates(arr, player) {
    let temp = [];
    for (let i = 0; i < arr.length; i++) {
      temp[i] = 0;
    }
    for (let i = 0; i < arr.length; i++) {
      if (arr[i] == "") {
        return `Please enter all distinct values between 1 to 9`;
      }
      temp[arr[parseInt(i)] - 1]++;
    }
    for (let i = 0; i < arr.length; i++) {
      if (temp[i] > 1) {
        return `Player ${player} please enter ${i + 1} only once`;
      }
    }
  }
  function handlechange1(e, index) {
    arr1[index] = parseInt(Math.abs(e.target.value % 10));
    if (arr1[index] == 0) {
      arr1[index] = 1;
    }
    setArr1([...arr1]);
  }
  function handlechange2(e, index) {
    arr2[index] = parseInt(Math.abs(e.target.value % 10));
    if (arr2[index] == 0) {
      arr2[index] = 1;
    }
    setArr2([...arr2]);
  }
  function checkWin(arr, randomArr) {
    for (let i = 0; i < 9; i += 3) {
      if (
        randomArr.includes(arr[i]) &&
        randomArr.includes(arr[i + 1]) &&
        randomArr.includes(arr[i + 2])
      ) {
        return true;
      }
    }

    for (let i = 0; i < 3; i++) {
      if (
        randomArr.includes(arr[i]) &&
        randomArr.includes(arr[i + 3]) &&
        randomArr.includes(arr[i + 6])
      ) {
        return true;
      }
    }
    return false;
  }
  function randomGenerator() {
    if (winner.length > 0) {
      return;
    }
    let random;
    random = Math.floor(Math.random() * 9) + 1;
    while (randomArr.includes(random)) {
      random = Math.floor(Math.random() * 9) + 1;
    }
    randomArr.push(random);
    setRandomArr([...randomArr]);

    if (checkWin(arr1, randomArr)) {
      winner.push(1);
    }
    if (checkWin(arr2, randomArr)) {
      winner.push(2);
    }

    setWinner([...winner]);
    if (winner.length == 1) {
      setMessage(`winner is player ${winner[0]}`);
      setpopup(true);
      clearInterval(timerRef.current);
      postData();
      return;
    }
    if (winner.length == 2) {
      setMessage("Draw");
      setpopup(true);
      clearInterval(timerRef.current);
      postData();
      return;
    }
  }
  function handleClick() {
    if (gameStatus == "Not running" && winner.length == 0) {
      let str = checkForDuplicates(arr1, 1);
      if (str) {
        setpopup(true);
        setMessage(str);
        return;
      }
      str = checkForDuplicates(arr2, 2);
      if (str) {
        setpopup(true);
        setMessage(str);
        return;
      }
      fetch("https://lottery-server-c94n.onrender.com/users/1", {
        method: "PATCH",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          gameId: "1",
          player1: arr1,
          player2: arr2,
          randomArr: randomArr,
          gameStatus: "Running",
          winner: winner,
        }),
      })
        .then((result) => {
          console.log(result.json());
        })
        .then((data) => {
          console.log(data);
        })
        .catch((err) => {
          console.log(err);
        });

      gameStatus = "Running";
      setGameStatus("Running");
      handle();
      timerRef.current = setInterval(() => {
        handle();
      }, 1500);
    } else {
      randomGenerator();
    }
  }
  return (
    <>
      <div>
        <>
          <div>
            <h1 className="label">Lottery Game</h1>
          </div>
          <div className="container">
            {[0, 1, 2].map((row) => (
              <div key={row}>
                {[0, 1, 2].map((col) => {
                  const index = row * 3 + col;
                  return (
                    <input
                      key={index}
                      className={`${
                        randomArr.includes(arr1[index]) ? "red" : "input"
                      }`}
                      type="number"
                      value={arr1[index]}
                      onChange={(e) => handlechange1(e, index)}
                      disabled={randomArr.length > 0}
                    />
                  );
                })}
              </div>
            ))}
          </div>
        </>
      </div>
      <div>
        <div className="container2">
          {[0, 1, 2].map((row) => (
            <div key={row}>
              {[0, 1, 2].map((col) => {
                const index = row * 3 + col;
                return (
                  <input
                    key={index}
                    className={`${
                      randomArr.includes(arr2[index]) ? "red" : "input"
                    }`}
                    type="number"
                    value={arr2[index]}
                    onChange={(e) => handlechange2(e, index)}
                    disabled={randomArr.length > 0}
                  />
                );
              })}
            </div>
          ))}
        </div>
      </div>
      <div className="outer">
        <div
          className="popup"
          style={{ display: `${popup ? "block" : "none"}` }}
        >
          <i className="far fa-check-circle"></i>
          <h2>{message}</h2>
          <br />
          <button
            id="closebtn"
            onClick={() => {
              if (winner.length > 0) {
                setGameStatus("Not running");
              }
              setpopup(false);
            }}
          >
            Close
          </button>
        </div>
      </div>
      <button
        className="StartButton"
        type="button"
        disabled={gameStatus == "Running"}
        onClick={() => {
          handleClick();
        }}
      >
        Start
      </button>
      <button
        className="StopButton"
        type="button"
        onClick={() => {
          reset();
        }}
      >
        Stop
      </button>
    </>
  );
}

export default Grid;
