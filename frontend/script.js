/**
 * what if, existence precedes essence?
 */

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
    this.durationPlayed = 0;
    this.gameEndedAt = "";
  }

  async registerPlayer(name, age, sex) {
    try {
      const userToRegister = {
        name: name,
        age: age,
        gender: sex,
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
      if (returnedSession.durationPlayed) {
        this.durationPlayed = this.convertReadbleTimeToMs(
          returnedSession.durationPlayed,
        );
      }

      // if some scores are already stored, update the player's scores
      if (
        returnedSession.scores &&
        Array.isArray(returnedSession.scores) &&
        returnedSession.scores.some((score) => score.length > 0)
      ) {
        player.scores = returnedSession.scores;
      }
      this.currSessionId = returnedSession.id;
    } catch (e) {
      throw e;
    }
  }

  async updateUserSession() {
    try {
      runAlert("Saving your scores...");
      const updatedPlayer = { badges: player.badges };
      await updatePlayer(player.id, updatedPlayer);
      const sessionUpdated = this.processSessionForUpdate();
      const returnedSession = await updateSession(
        this.currSessionId,
        sessionUpdated,
      );
      runAlert("Scores saved successfully!");
      this.resetStartTime();
    } catch (e) {
      throw e;
    }
  }

  convertReadbleTimeToMs(timeStr) {
    // if time looks like "30 mins" or "2 hrs"
    const time = timeStr.split(" ")[0];
    if (timeStr.includes("mins")) {
      return Number(time) * 60 * 1000;
    }
    if (timeStr.includes("hrs")) {
      return Number(time) * 60 * 60 * 1000;
    }
  }

  setStartTime() {
    this.startTime === 0 && (this.startTime = Date.now());
  }

  resetStartTime() {
    this.startTime && (this.startTime = 0);
  }

  processSessionForCreation() {
    const sessionToStore = {
      playerId: player.id,
      scores: player.scores,
      durationPlayed: this.durationPlayed,
      gameEndedAt: this.gameEndedAt,
      gameStartedAt: changeEpochToReadable(this.startTime),
    };
    return sessionToStore;
  }

  processSessionForUpdate() {
    const msToReadableTime = function (ms) {
      const mins = ms / 1000 / 60;
      if (mins < 60) return `${mins.toFixed(2)} mins`;
      else {
        const hours = Math.floor(mins / 60);
        return `${hours.toFixed(2)} hrs`;
      }
    };
    const currTime = Date.now();
    this.gameEndedAt = changeEpochToReadable(currTime);
    this.durationPlayed += currTime - this.startTime;
    const processedSession = {
      durationPlayed: msToReadableTime(this.durationPlayed),
      gameEndedAt: this.gameEndedAt,
      scores: player.scores,
    };
    return processedSession;
  }
}

const playerBackend = new GameBackend(); // interact with the backend
const player = {
  id: "", // set when player is created
  name: "",
  sex: undefined, // 0 for female, 1 for male
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

    if (document.getElementById("female").checked) player.sex = 0;
    else player.sex = 1;

    // create player

    let testForFailure = false;
    runAlert("Creating player...", 1000);
    try {
      const returnedPlayer = await playerBackend.registerPlayer(
        player.name,
        player.age,
        player.sex,
      );
      player.id = returnedPlayer.id;

      // if a player has some badges, update the player's badges
      if (
        Array.isArray(returnedPlayer.badges) &&
        returnedPlayer.badges.length > 0
      ) {
        player.badges = returnedPlayer.badges;
        showBadgesFetchedFromBackEnd();
      }

      try {
        await playerBackend.setLoginInfo();
        // runAlert("Player created successfully!");
      } catch (e) {
        console.error(e);
        runAlert(
          "Error creating session: Try checking your internet connection and try again.",
        );

        // todo: we need a way to handle this error and take the user back to the intro page
        // todo: so that they can try again -- frontend

        testForFailure = true;

        return;
      }
    } catch (e) {
      // note: if anything goes wrong during player creation, try to check this
      // code block and debug it
      console.error(e);
    }

    if (testForFailure) return;

    document
      .querySelector(".intro-page form")
      .setAttribute("disabled", "disabled");

    cleanBadgesArray(player.badges);
    document.querySelector(".intro-page").setAttribute("hidden", "hidden");
    document.querySelector(".game").removeAttribute("hidden");

    runAlert("Match the sign with the correct letter. Earn 75% points to win a badge and complete a level", 10000);
  });

function showBadgesFetchedFromBackEnd() {
  cleanBadgesArray(player.badges);
  for (let i = 0; i < player.badges.length; i++) {
    let div = document.createElement("div");
    div.style.cssText = `background-image: url(./badge${player.badges[i]}.png)`;
    if (player.badges[i] > 3) {
      awardsDivTwo.appendChild(div);
    } else {
      awardsDivOne.appendChild(div);
    }
  }
}

function cleanBadgesArray(array) {
  for (let x = 0; x < array.length; x++) {
    for (let y = x + 1; y < array.length;) {
      if (array[y] == array[x]) {
        array.splice(y, 1);
        continue;
      }
      y++;
    }
  }
}

const formButton = document.querySelector(".intro-page form button");
formButton.addEventListener("mouseover", (event) => {
  formButton.classList.remove("mouseout");
  formButton.classList.add("mousein");
});
formButton.addEventListener("mouseout", (event) => {
  formButton.classList.remove("mousein");
  formButton.classList.add("mouseout");
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
  ".game .top .level-div .value div:nth-child(2)",
);
const scoreNumDiv = document.querySelector(
  ".game .top .score-div .value div:nth-child(2)",
);
const letterParentDiv = document.querySelector(".bottom .letters");
const vidDiv = document.querySelector(".game .gif");
const progressbarParent = document.querySelector(".game .level-progress");
const scorebarParent = document.querySelector(".game .score-progress");
const endModal = document.querySelector("dialog");
const awardsDivOne = document.querySelector("main .badges.one .award-icons");
const awardsDivTwo = document.querySelector("main .badges.two .award-icons");
const alertDiv = document.querySelector(".alert");

if (isIPadorTablet())
  runAlert("Try landscape mode on iPads and Tablets!", 4000); //no longer needed

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

  vidDiv.querySelector("img").setAttribute("src", `./${alphabet[num]}.gif`);
  // vidDiv.querySelector("img").setAttribute("src", `./${alphabet[num]}.webp`);
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
    `.bottom .letters div[data-val='${letter}']`,
  );
  temp.classList.add("correct-animation");
  setTimeout(() => {
    temp.classList.remove("correct-animation");
  }, 1000);
}

function updateProgressBars() {
  progressbarParent.querySelector(
    `div:nth-child(${state.clicks})`,
  ).style.cssText = "background-color: orange";
  progressbarParent
    .querySelector(`div:nth-child(${state.clicks})`)
    .classList.add("move");
  if (state.passed) {
    scorebarParent.querySelector(
      `div:nth-child(${state.passed})`,
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
    endModal.querySelector("h1").textContent = "Excellent Job!";
  } else {
    endModal.querySelector("h1").textContent = "Good Trial";
  }
  endModal.querySelector(".score > h2").textContent = `You got ${state.score}%`;

  let temp = endModal.querySelector(".award");

  if (!player.badges.includes(state.level)) {
    if (state.score >= 75) {
      temp.style.cssText = "display: flex";
      endModal
        .querySelector(".award > img")
        .setAttribute("src", `./badge${state.level}.png`);
      player.badges.push(state.level);

      let div = document.createElement("div");
      div.style.cssText = `background-image: url(./badge${state.level}.png)`;
      // awardsDiv.appendChild(div);
      if (state.level > 3) {
        awardsDivTwo.appendChild(div);
      } else {
        awardsDivOne.appendChild(div);
      }
    } else temp.style.cssText = "display: none";
  } else temp.style.cssText = "display: none";

  if (state.score >= 75 && state.level < 5) {
    endModal.querySelector(".btns div > .next").removeAttribute("disabled");
  } else
    endModal
      .querySelector(".btns div > .next")
      .setAttribute("disabled", "true");

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

  endModal.querySelector(".restart").onclick = function () {
    endModal.removeEventListener("close", handleClose);
    loadlevelnum(1);
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
      runAlert(
        "Error updating player info: Try checking your internet connection",
      );
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
  // event.preventDefault(); // Cancel the event
  // Chrome requires returnValue to be set
  // event.returnValue = "Are you tired of playing?";
});

// alert stuff

function runAlert(message, time = 3000) {
  alertDiv.querySelector(".text").textContent = message;
  alertDiv.classList.add("action");
  alertDiv.style.animationDuration = `${time/1000}` + 's';
  setTimeout(() => {
    alertDiv.classList.remove("action");
  }, time);
}

function isIPadorTablet() {
  if (window.screen.height < 1370 && window.screen.height > 1020) {
    if (window.screen.width < 1030 && window.screen.width > 760) {
      return true;
    }
  }
  return false;
}
