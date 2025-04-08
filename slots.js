const weightedSymbols = [
  ...Array(20).fill("🍓"),
  ...Array(15).fill("🍊"),
  ...Array(10).fill("🍒"),
  ...Array(8).fill("🍉"),
  ...Array(6).fill("🍋"),
  ...Array(4).fill("🍇"),
  ...Array(2).fill("💰"),
];

const multipliers = {
  "🍓": 1,
  "🍊": 1.5,
  "🍒": 2,
  "🍉": 2.5,
  "🍋": 3,
  "🍇": 4,
  "💰": 10,
};

let balance = 20.0;
let spinAudio = new Audio("spin.wav");
spinAudio.volume = 0.75;
spinAudio.loop = true;

const winAudio = new Audio("win.wav");

function getRandomSymbol() {
  const index = Math.floor(Math.random() * weightedSymbols.length);
  return weightedSymbols[index];
}

function updateSlotVisual(slotId, symbol) {
  const slot = document.getElementById(slotId);
  const slotItem = slot.querySelector(".slot-item");
  slotItem.textContent = symbol;
}

function startSpinning() {
  const slots = document.querySelectorAll(".slot");
  slots.forEach((slot) => slot.classList.add("spinning"));

  spinAudio.currentTime = 0;
  spinAudio.play();

  document.getElementById("spinButton").disabled = true;
}

function stopSpinning(s1, s2, s3, delay = 0) {
  setTimeout(() => {
    const slots = document.querySelectorAll(".slot");
    slots.forEach((slot) => slot.classList.remove("spinning"));

    updateSlotVisual("slot1", s1);
    updateSlotVisual("slot2", s2);
    updateSlotVisual("slot3", s3);

    spinAudio.pause();

    document.getElementById("spinButton").disabled = false;
  }, delay);
}

function stopSlot(slotId, symbol, delay) {
  setTimeout(() => {
    const slot = document.getElementById(slotId);
    const slotItem = slot.querySelector(".slot-item");

    slot.classList.remove("spinning");

    slotItem.style.animation = "slotStop 0.3s ease-out forwards";

    slotItem.textContent = symbol;

    setTimeout(() => {
      slotItem.style.animation = "";
      slotItem.style.transform = "translateY(0) scale(1)";
    }, 500);
  }, delay);
}

function spin() {
  const bid = parseFloat(document.getElementById("bid").value);
  const message = document.getElementById("message");

  if (balance < bid) {
    message.textContent = "Not enough balance!";
    return;
  }

  balance -= bid;
  document.getElementById("balance").textContent = balance.toFixed(2);

  startSpinning();

  const spinningInterval = setInterval(() => {
    document.querySelectorAll(".slot").forEach((slot) => {
      const slotItem = slot.querySelector(".slot-item");
      slotItem.textContent = getRandomSymbol();
    });
  }, 100);

  const s1 = getRandomSymbol();
  const s2 = getRandomSymbol();
  const s3 = getRandomSymbol();

  setTimeout(() => {
    clearInterval(spinningInterval);

    stopSlot("slot1", s1, 0);
    stopSlot("slot2", s2, 300);
    stopSlot("slot3", s3, 600);

    let win = 0;
    let winMessage = "";
    let winClass = "";
    let winText = "";

    if (s1 === s2 && s2 === s3) {
      const multiplier = multipliers[s1] * 2 || 0;
      win = bid * multiplier;

      if (s1 === "💰") {
        winMessage = "💰 MEGA JACKPOT! 💰";
        winClass = "jackpot-win";
        winText = "MEGA WIN!";
      } else if (multiplier >= 12) {
        winMessage = "MAJOR WIN! Three matching symbols!";
        winClass = "big-win";
        winText = "BIG WIN!";
      } else {
        winMessage = "Three matching symbols!";
        winClass = "medium-win";
        winText = "ROW!";
      }
    }
    else if (s1 === s2 || s2 === s3) {
      const matchSymbol = s1 === s2 ? s1 : s2;
      const multiplier = multipliers[matchSymbol] * 0.5 || 0;
      win = bid * multiplier;

      if (multiplier >= 6) {
        winMessage = "Nice! Two high-value symbols!";
        winClass = "medium-win";
        winText = "NICE WIN!";
      } else {
        winMessage = "Nice! Two matching symbols!";
        winClass = "small-win";
        winText = "WIN!";
      }
    }
    else if (s1 === "💰" || s2 === "💰" || s3 === "💰") {
      win = bid * 0.8;
      winMessage = "Money bag bonus!";
      winClass = "small-win";
      winText = "BONUS!";
    }

    if (win > 0) {
      setTimeout(() => {
        winAudio.currentTime = 0;
        winAudio.play();

        const slots = document.querySelectorAll(".slot");
        slots.forEach((slot) => {
          slot.classList.add(winClass);
        });

        const infoContainer = document.querySelector(".info");
        const winTextElement = document.createElement("div");
        winTextElement.classList.add("win-text");
        winTextElement.textContent = winText;
        winTextElement.style.animation =
          "winTextAnimation 1.5s ease-out forwards";
        infoContainer.appendChild(winTextElement);

        balance += win;
        document.getElementById("balance").textContent = balance.toFixed(2);

        setTimeout(() => {
          slots.forEach((slot) => {
            slot.classList.remove(winClass);
          });
          infoContainer.removeChild(winTextElement);
        }, 2000);
      }, 1000);
    }

    setTimeout(() => {
      document.getElementById("balance").textContent = balance.toFixed(2);
      document.getElementById("lastWin").textContent = win.toFixed(2);
      message.textContent = winMessage;

      spinAudio.pause();

      document.getElementById("spinButton").disabled = false;

      if (balance < 0.4) {
        message.textContent = "You don't have enough balance. Game over!";
      }
    }, 1100);
  }, 900);
}
