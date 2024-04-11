/**
 * what if, existence precedes essence?
 */
// @ts-check

import {
  changeEpochToReadable,
  createPlayer,
  createSession,
  updatePlayer,
  updateSession,
} from "../backend";

import "./style.css";

/*
  This is all the code that will talk to the backend
*/
class GameBackend {
  constructor() {
    this.currSessionId = null;
    this.startTime = 0;

    // session details
    // todo: set the session details to be accumulative -- for backend
    this.durationPlayed = 0;
    this.levelStartedAt = [];
    this.levelEndedAt = [];
  }

  async registerPlayer(name, age) {
    try {
      const userToRegister = {
        name: name,
        age: age,
        badges: [],
      };
      return await createPlayer(userToRegister);
    } catch (e) {
      throw e;
    }
  }

  async setLoginInfo() {
    try {
      this.setStartTime();
      const sessionStored = this.processSessionForCreation();
      const returnedSession = await createSession(sessionStored);
      if (this.currSessionId) return;
      this.currSessionId = returnedSession.id;
    } catch (e) {
      throw e;
    }
  }

  async updateUserSession() {
    try {
      const updatedPlayer = { badges: player.badges };
      await updatePlayer(player.id, updatedPlayer);
      const sessionUpdated = this.processSessionForUpdate();
      const returnedSession = await updateSession(
        this.currSessionId,
        sessionUpdated
      );

      // todo: tell users to wait for a while till the scores are saved

      window.alert("Points for this level were saved!");
      this.resetStartTime();
    } catch (e) {
      throw e;
    }
  }

  setStartTime() {
    !this.startTime && (this.startTime = Date.now());
  }

  resetStartTime() {
    this.startTime && (this.startTime = null);
  }

  processSessionForCreation() {
    this.levelStartedAt.push(changeEpochToReadable(this.startTime));
    const sessionToStore = {
      playerId: player.id,
      scores: player.scores,
      durationPlayed: 0,
      levelEndedAt: [],
      levelStartedAt: [...this.levelStartedAt],
    };
    return sessionToStore;
  }

  processSessionForUpdate() {
    const msToReadableTime = function (ms) {
      const mins = ms / 1000 / 60;
      if (mins < 60) return `${mins.toFixed(2)} mins`;
      else {
        const hours = Math.floor(mins / 60);

        if (hours < 24) return `${hours} hrs ${Math.floor(mins % 60)} mins`;
        else {
          const days = Math.floor(hours / 24);
          return `${days} days ${Math.floor(hours % 24)} hrs`;
        }
      }
    };
    const currTime = Date.now();
    // this.durationPlayed.push(msToReadableTime(currTime - this.startTime));
    this.durationPlayed += currTime - this.startTime;
    this.levelEndedAt.push(changeEpochToReadable(currTime));
    const processedSession = {
      durationPlayed: this.durationPlayed,
      levelEndedAt: this.levelEndedAt,
      scores: player.scores,
    };
    return processedSession;
  }
}

const playerBackend = new GameBackend(); // interact with the backend
const player = {
  id: "", // set when player is created
  name: "",
  age: 0,
  badges: [],
  scores: [[], [], [], [], []],
};

document
  .querySelector(".intro-page form")
  .addEventListener("submit", async (event) => {
    event.preventDefault();
    player.name = document.getElementById("name").value;
    player.age = Number(document.getElementById("age").value);

    // create player
    try {
      const returnedPlayer = await playerBackend.registerPlayer(
        player.name,
        player.age
      );
      player.id = returnedPlayer.id;

      try {
        // create a session
        await playerBackend.setLoginInfo();
      } catch (e) {
        console.error(e);

        // todo: we need a way to handle this error and take the user back to the intro page
        // todo: so that they can try again
        window.alert("Error setting session.");
      }
    } catch (e) {
      console.error(e);

      // todo: we need a way to handle this error and take the user back to the intro page
      // todo: so that they can try again with a different name
      window.alert(
        "Error creating player: that name is already taken. Try another one."
      );
    }

    document
      .querySelector(".intro-page form")
      .setAttribute("disabled", "disabled");

    document.querySelector(".intro-page").setAttribute("hidden", "hidden");
    document.querySelector(".game").removeAttribute("hidden");
  });

const formButton = document.querySelector(".intro-page form button");
formButton.addEventListener("mouseover", (event) => {
  formButton.classList.remove("mouseout");
  formButton.classList.add("mousein");
});
formButton.addEventListener("mouseout", (event) => {
  formButton.classList.remove("mousein");
  formButton.classList.add("mouseout");
  console.log("hehe");
});

const alphabet = [
  "A",
  "B",
  "C",
  "D",
  "E",
  "F",
  "G",
  "H",
  "I",
  "J",
  "K",
  "L",
  "M",
  "N",
  "O",
  "P",
  "Q",
  "R",
  "S",
  "T",
  "U",
  "V",
  "W",
  "X",
  "Y",
  "Z",
];

let levels = {
  level1: {
    // gif: [],
    num: 1,
    letter: [0, 1, 2, 3, 4, 5],
    done: [],
  },
  level2: {
    // gif: [],
    num: 2,
    letter: [6, 7, 8, 9, 10],
    done: [],
  },
  level3: {
    // gif: [],
    num: 3,
    letter: [11, 12, 13, 14, 15],
    done: [],
  },
  level4: {
    // gif: [],
    num: 4,
    letter: [16, 17, 18, 19, 20],
    done: [],
  },
  level5: {
    // gif: [],
    num: 5,
    letter: [21, 22, 23, 24, 25],
    done: [],
  },
};

let state = {
  level: 0,
  levelRef: null,
  clicks: 0,
  passed: 0,
  score: 0,
};

const levelNumDiv = document.querySelector(
  ".game .top .level-div .value div:nth-child(2)"
);
const scoreNumDiv = document.querySelector(
  ".game .top .score-div .value div:nth-child(2)"
);
const letterParentDiv = document.querySelector(".bottom .letters");
const vidDiv = document.querySelector(".game .gif");
const progressbarParent = document.querySelector(".game .level-progress");
const scorebarParent = document.querySelector(".game .score-progress");
const endModal = document.querySelector("dialog");
const awardsDivOne = document.querySelector("main .badges.one .award-icons");
const awardsDivTwo = document.querySelector("main .badges.two .award-icons");
const alertDiv = document.querySelector(".alert");

// puts the letters and the level number and registers event listeners
function loadLevel(level) {
  state.level = level.num;
  state.levelRef = level;
  state.clicks = 0;
  state.passed = 0;
  state.score = 0;
  state.levelRef.done = [];

  removeAllChildren(letterParentDiv);
  removeAllChildren(progressbarParent);
  removeAllChildren(scorebarParent);

  levelNumDiv.textContent = String(level.num);
  letterParentDiv.style.cssText = `grid-template-columns: repeat(${level.letter.length}, 1fr)`;
  progressbarParent.style.cssText = `grid-template-columns: repeat(${level.letter.length}, 1fr);`;
  scorebarParent.style.cssText = `grid-template-columns: repeat(${level.letter.length}, 1fr);`;

  updateScore();

  for (let i = 0; i < level.letter.length; i++) {
    let div = document.createElement("div");
    div.setAttribute("data-val", `${alphabet[level.letter[i]]}`);
    div.textContent = String(alphabet[level.letter[i]]);
    letterParentDiv.appendChild(div);

    progressbarParent.appendChild(document.createElement("div"));
    scorebarParent.appendChild(document.createElement("div"));
  }
  loadNewGif();

  putButtonEvents(letterParentDiv);
}

function removeAllChildren(div) {
  let x = Array.from(div.childNodes);
  for (let i = 0; i < x.length; i++) {
    x[i].remove();
  }
}

function putButtonEvents(parent) {
  let x = Array.from(parent.childNodes);
  for (let i = 0; i < x.length; i++) {
    x[i].addEventListener("click", () => {
      state.clicks++;
      if (x[i].textContent == vidDiv.getAttribute("data-val")) state.passed++;
      else runFailAnimation(x[i]);
      updateScore();
      updateProgressBars();
      vidDiv.querySelector("img").setAttribute("src", "");
      if (state.clicks === state.levelRef.letter.length) endLevel();
      else loadNewGif();
    });
  }
}

/**
 *
 * find new algorithm for randomizing
 *
 * no need now
 */
function loadNewGif() {
  let x = state.levelRef.letter.length - 1;
  let num = state.levelRef.letter[x] - Math.round(Math.random() * x);
  while (state.levelRef.done.includes(num)) {
    num = state.levelRef.letter[x] - Math.round(Math.random() * x);
  }
  state.levelRef.done.push(num);
  // vidDiv.querySelector('video').setAttribute("src", `./assets/gifs/${alphabet[num]}.webp`);
  // vidDiv.setAttribute("data-val", `${alphabet[num]}`);

  vidDiv
    .querySelector("img")
    .setAttribute("src", `../assets/gifs/${alphabet[num]}.webp`);
  vidDiv.setAttribute("data-val", `${alphabet[num]}`);
}

function updateScore() {
  state.score = Math.round((state.passed * 100) / state.levelRef.letter.length);
  scoreNumDiv.innerHTML = `${state.score} <span class="small">%</span>`;
}

function runFailAnimation(div) {
  div.classList.add("fail-animation");
  setTimeout(() => {
    div.classList.remove("fail-animation");
  }, 1000);
  let letter = vidDiv.getAttribute("data-val");
  let temp = document.querySelector(
    `.bottom .letters div[data-val='${letter}']`
  );
  temp.classList.add("correct-animation");
  setTimeout(() => {
    temp.classList.remove("correct-animation");
  }, 1000);

  runAlert("Testing mic one two");
}

function updateProgressBars() {
  progressbarParent.querySelector(
    `div:nth-child(${state.clicks})`
  ).style.cssText = "background-color: orange";
  progressbarParent
    .querySelector(`div:nth-child(${state.clicks})`)
    .classList.add("move");
  if (state.passed) {
    scorebarParent.querySelector(
      `div:nth-child(${state.passed})`
    ).style.cssText = "background-color: red";
    if (state.score >= 40 && state.score < 75) {
      scorebarParent.style.cssText += "border: 1px solid orange";
      for (let i = 0; i < state.passed; i++) {
        scorebarParent.childNodes[i].style.cssText +=
          "background-color: orange";
      }
    } else if (state.score >= 75) {
      scorebarParent.style.cssText += "border: 1px solid green;";
      for (let i = 0; i < state.passed; i++) {
        scorebarParent.childNodes[i].style.cssText += "background-color: green";
      }
    }
    scorebarParent
      .querySelector(`div:nth-child(${state.passed})`)
      .classList.add("move");
  }
}

function endLevel() {
  player.scores[state.level - 1].push(state.score);

  if (state.score >= 75) {
    endModal.querySelector("h1").textContent = "Yeyy! You Win!";
  } else {
    endModal.querySelector("h1").textContent = "Noo! You Lose!";
  }
  endModal.querySelector(".score > h2").textContent = `You got ${state.score}%`;

  console.log(" prexvcvdfgdsfgdfgdfgdf ");
  console.log(state);

  let temp = endModal.querySelector(".award");
  console.log(temp);


  if (!player.badges.includes(state.level)) {
    console.log("her1");
    if (state.score >= 75) {
    console.log("her333");

      temp.style.cssText = "display: flex";
      endModal
        .querySelector(".award > img")
        .setAttribute("src", `../assets/badge${state.level}.png`);
      player.badges.push(state.level);

      let div = document.createElement("div");
      div.style.cssText = `background-image: url(../assets/badge${state.level}.png)`;
      // awardsDiv.appendChild(div);
      if (state.level > 3) {
        awardsDivTwo.appendChild(div);
      } else {
        awardsDivOne.appendChild(div);
      }
    }
    else temp.style.cssText = "display: none";
  } else temp.style.cssText = "display: none";

  console.log(state);


  if (state.score >= 75 && state.level < 5) {
    endModal.querySelector(".btns > .next").removeAttribute("disabled");
  } else
    endModal.querySelector(".btns > .next").setAttribute("disabled", "true");

  endModal.addEventListener("close", handleClose);

  endModal.querySelector(".again").onclick = function () {
    endModal.removeEventListener("close", handleClose);
    loadlevelnum(state.level);
    endModal.close();
  };

  endModal.querySelector(".next").onclick = function () {
    endModal.removeEventListener("close", handleClose);
    loadlevelnum(state.level + 1);
    endModal.close();
  };
  endModal.showModal();

  // set the player info on every end of a level
  // i.e. update the badges, scores and session details
  (async () => {
    try {
      await playerBackend.updateUserSession();
      console.log("updated player and session info");

      // set the start time for the next level
      playerBackend.setStartTime();
    } catch (e) {
      console.error(e);

      // todo: we need a way to handle this error and
      // todo: tell the user that they were not logged out
      // todo: but they can move on
      window.alert("Error logging out: " + e.message);
    }
  })();
}

function handleClose() {
  if (state.level == 5) {
    loadlevelnum(state.level);
  } else if (state.score >= 75) {
    loadlevelnum(state.level + 1);
  } else {
    loadlevelnum(state.level);
  }
}

// endModal.showModal();

function loadlevelnum(num) {
  switch (num) {
    case 1:
      loadLevel(levels.level1);
      break;
    case 2:
      loadLevel(levels.level2);
      break;
    case 3:
      loadLevel(levels.level3);
      break;
    case 4:
      loadLevel(levels.level4);
      break;
    case 5:
      loadLevel(levels.level5);
      break;
  }
}

loadLevel(levels.level1);

// call off cleanup when the user tries to leave the page
window.addEventListener("beforeunload", (event) => {
  event.preventDefault(); // Cancel the event

  // Chrome requires returnValue to be set
  event.returnValue = "Are you tired of playing?";
});

// alert stuff

function runAlert(message) {
  alertDiv.querySelector(".text").textContent = message;
  alertDiv.classList.add("action");
  setTimeout(() => {
    alertDiv.classList.remove("action");
  }, 3000);
}