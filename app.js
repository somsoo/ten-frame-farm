let audioCtx = null;
let soundOn = true;

const PITCHES = [
  261.63, // C4 (1)
  293.66, // D4 (2)
  329.63, // E4 (3)
  349.23, // F4 (4)
  392.00, // G4 (5 - gold)
  440.00, // A4 (6)
  493.88, // B4 (7)
  523.25, // C5 (8)
  587.33, // D5 (9)
  659.25  // E5 (10 - full)
];

function playNote(count) {
  if (!soundOn) return;
  if (!audioCtx) audioCtx = new (window.AudioContext || window.webkitAudioContext)();
  if (audioCtx.state === 'suspended') audioCtx.resume();
  const freq = PITCHES[Math.min(count - 1, PITCHES.length - 1)] || 440;

  const osc = audioCtx.createOscillator();
  const gain = audioCtx.createGain();
  osc.type = 'triangle';
  osc.frequency.setValueAtTime(freq, audioCtx.currentTime);
  gain.gain.setValueAtTime(0.12, audioCtx.currentTime);
  gain.gain.exponentialRampToValueAtTime(0.0001, audioCtx.currentTime + 0.35);
  osc.connect(gain);
  gain.connect(audioCtx.destination);
  osc.start();
  osc.stop(audioCtx.currentTime + 0.35);
}

function playFanfare() {
  if (!soundOn) return;
  [523.25, 659.25, 783.99, 1046.5].forEach((freq, idx) => {
    setTimeout(() => {
      const osc = audioCtx.createOscillator();
      const gain = audioCtx.createGain();
      osc.type = 'sine';
      osc.frequency.setValueAtTime(freq, audioCtx.currentTime);
      gain.gain.setValueAtTime(0.15, audioCtx.currentTime);
      gain.gain.exponentialRampToValueAtTime(0.0001, audioCtx.currentTime + 0.3);
      osc.connect(gain);
      gain.connect(audioCtx.destination);
      osc.start();
      osc.stop(audioCtx.currentTime + 0.3);
    }, idx * 100);
  });
}

// State
let frameCells = Array(10).fill(null); // array of animal emojis
let completedBundles = 0;
let currentMode = 'free'; // 'free', 'quest', 'subitize'
let targetQuestCount = 7;

const tenFrameGrid = document.getElementById('tenFrameGrid');
const countDisplay = document.getElementById('countDisplay');
const complementHint = document.getElementById('complementHint');
const btnClearBarn = document.getElementById('btnClearBarn');
const btnSound = document.getElementById('btnSound');
const bundleCount = document.getElementById('bundleCount');
const bundleIcons = document.getElementById('bundleIcons');
const questBox = document.getElementById('questBox');
const questTitle = document.getElementById('questTitle');
const btnCheckQuest = document.getElementById('btnCheckQuest');

btnSound.addEventListener('click', () => {
  soundOn = !soundOn;
  btnSound.textContent = soundOn ? '소리 켜짐 🔔' : '소리 꺼짐 🔕';
});

function renderGrid() {
  tenFrameGrid.innerHTML = '';
  frameCells.forEach((animal, idx) => {
    const cell = document.createElement('div');
    cell.className = 'frame-cell';
    if (animal) {
      cell.classList.add('filled');
      cell.textContent = animal;
    }
    cell.addEventListener('click', () => {
      if (frameCells[idx]) {
        frameCells[idx] = null;
        updateUI();
      }
    });
    tenFrameGrid.appendChild(cell);
  });
  updateUI();
}

function addAnimal(emoji) {
  const emptyIdx = frameCells.findIndex(c => c === null);
  if (emptyIdx !== -1) {
    frameCells[emptyIdx] = emoji;
    const currentCount = frameCells.filter(c => c !== null).length;
    playNote(currentCount);

    if (currentCount === 10) {
      playFanfare();
      completedBundles++;
      bundleCount.textContent = completedBundles;
      const b = document.createElement('span');
      b.textContent = '🏠';
      bundleIcons.appendChild(b);
      setTimeout(() => {
        alert("와! 10마리가 가득 차서 10 묶음 헛간이 완성되었습니다! 🎉");
      }, 300);
    }
    renderGrid();
  } else {
    alert("울타리가 10마리로 꽉 찼습니다! 울타리를 비우고 새 헛간을 만들어보세요.");
  }
}

function updateUI() {
  const count = frameCells.filter(c => c !== null).length;
  countDisplay.textContent = `${count} 마리`;

  const comp = 10 - count;
  if (count === 10) {
    complementHint.textContent = "10마리가 꽉 찼어요! 완벽한 10 묶음입니다!";
  } else if (count === 5) {
    complementHint.textContent = "1줄(5마리) 완성! 10마리까지 5마리 남았어요!";
  } else {
    complementHint.textContent = `10마리를 채우려면 ${comp}마리가 더 필요해요!`;
  }
}

document.querySelectorAll('.animal-card').forEach(btn => {
  btn.addEventListener('click', () => {
    const type = btn.dataset.animal;
    const map = { chick: '🐥', pig: '🐷', sheep: '🐑', duck: '🦆' };
    addAnimal(map[type] || '🐥');
  });
});

btnClearBarn.addEventListener('click', () => {
  frameCells = Array(10).fill(null);
  renderGrid();
});

// Mode Switching
const tabFree = document.getElementById('tabFree');
const tabQuest = document.getElementById('tabQuest');
const tabSubitize = document.getElementById('tabSubitize');

function setMode(mode) {
  currentMode = mode;
  [tabFree, tabQuest, tabSubitize].forEach(t => t.classList.remove('active'));
  questBox.classList.add('hidden');

  if (mode === 'free') {
    tabFree.classList.add('active');
  } else if (mode === 'quest') {
    tabQuest.classList.add('active');
    questBox.classList.remove('hidden');
    startNewQuest();
  } else if (mode === 'subitize') {
    tabSubitize.classList.add('active');
    startSubitizingFlash();
  }
}

tabFree.addEventListener('click', () => setMode('free'));
tabQuest.addEventListener('click', () => setMode('quest'));
tabSubitize.addEventListener('click', () => setMode('subitize'));

function startNewQuest() {
  targetQuestCount = Math.floor(Math.random() * 9) + 1; // 1~9
  questTitle.textContent = `목표: 동물 ${targetQuestCount}마리를 울타리에 넣어보세요!`;
  frameCells = Array(10).fill(null);
  renderGrid();
}

btnCheckQuest.addEventListener('click', () => {
  const count = frameCells.filter(c => c !== null).length;
  if (count === targetQuestCount) {
    playFanfare();
    alert(`정답입니다! 정확히 ${count}마리를 채웠어요! 🌟`);
    startNewQuest();
  } else {
    alert(`현재 ${count}마리입니다. ${targetQuestCount}마리가 되도록 맞춰보세요!`);
  }
});

function startSubitizingFlash() {
  const flashCount = Math.floor(Math.random() * 8) + 2;
  frameCells = Array(10).fill(null);
  for (let i = 0; i < flashCount; i++) frameCells[i] = '🐥';
  renderGrid();

  setTimeout(() => {
    frameCells = Array(10).fill(null);
    renderGrid();
    setTimeout(() => {
      const userAns = prompt("방금 몇 마리가 있었나요?");
      if (parseInt(userAns, 10) === flashCount) {
        alert(`대단해요! 정답 ${flashCount}마리를 정확히 보았습니다! 👁️✨`);
      } else {
        alert(`아쉬워요! 정답은 ${flashCount}마리였습니다.`);
      }
      setMode('free');
    }, 100);
  }, 1000);
}

renderGrid();
