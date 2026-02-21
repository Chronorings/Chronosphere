import * as THREE from "three";
import { SceneManager } from "./Scene.js";
import { RingManager } from "./RingManager.js";
import { UI } from "./UI.js";

const sceneManager = new SceneManager();
const ringManager = new RingManager(sceneManager.scene);

let isModalOpen = false;
let currentTheme = "dark";

// 初期背景
document.body.style.background = "#000";

// ========================
// グローバル通知フラグ
// ========================

let globalNotificationsEnabled = true;

// ========================
// 初期時環
// ========================

ringManager.addRing(1 / 86400, "Second");
ringManager.addRing(1 / 1440, "Minute");
ringManager.addRing(1 / 24, "Hour");
ringManager.addRing(1, "Day");

// ========================
// 通知制御フラグ（追加差分）
// ========================

let notificationsEnabled = true;

// ========================
// 周回通知UI（追加差分）
// ========================

const toastContainer = document.createElement("div");
Object.assign(toastContainer.style, {
  position: "fixed",
  top: "20px",
  right: "20px",
  display: "flex",
  flexDirection: "column",
  gap: "10px",
  zIndex: "10000",
  pointerEvents: "none"
});
document.body.appendChild(toastContainer);

function showCycleToast(name) {

  const toast = document.createElement("div");
  toast.innerText = `${name} completed one cycle`;

  Object.assign(toast.style, {
    padding: "12px 18px",
    borderRadius: "16px",
    background: "rgba(255,255,255,0.15)",
    backdropFilter: "blur(20px)",
    border: "1px solid rgba(255,255,255,0.3)",
    color: "white",
    fontFamily: "system-ui",
    opacity: "0",
    transform: "translateY(-10px)",
    transition: "all 0.4s ease"
  });

  toastContainer.appendChild(toast);

  requestAnimationFrame(() => {
    toast.style.opacity = "1";
    toast.style.transform = "translateY(0)";
  });

  setTimeout(() => {
    toast.style.opacity = "0";
    toast.style.transform = "translateY(-10px)";
    setTimeout(() => toast.remove(), 400);
  }, 3000);
}

// ========================
// 多言語データ
// ========================

const multilingualMap = {
  Second: ["Second"],
  Minute: ["Minute"],
  Hour:   ["Hour"],
  Day:    ["Day"],
};

// ========================
// 多言語レイヤー
// ========================

const languageLayer = document.createElement("div");
const languageParticles = [];
Object.assign(languageLayer.style, {
  position: "fixed",
  inset: "0",
  pointerEvents: "none",
  overflow: "hidden",
  zIndex: "0"
});
document.body.appendChild(languageLayer);

let hoverStartTime = 0;
let activeRingName = null;

// ========================
// 時間処理
// ========================

function parseTimeInput(input) {
  input = input.trim().toLowerCase();

  if (/^\d+:\d+:\d+$/.test(input)) {
    const [h, m, s] = input.split(":").map(Number);
    return (h * 3600 + m * 60 + s) * 1000;
  }

  if (/^\d+$/.test(input)) {
    return parseInt(input) * 1000;
  }

  let totalSeconds = 0;
  const regex = /(\d+)(d|h|m|s)/g;
  let match;

  while ((match = regex.exec(input)) !== null) {
    const value = parseInt(match[1]);
    const unit = match[2];
    if (unit === "d") totalSeconds += value * 86400;
    if (unit === "h") totalSeconds += value * 3600;
    if (unit === "m") totalSeconds += value * 60;
    if (unit === "s") totalSeconds += value;
  }

  return totalSeconds * 1000;
}

function formatTime(ms) {

  const totalSeconds = Math.floor(ms / 1000);

  const days = Math.floor(totalSeconds / 86400);
  const hours = Math.floor((totalSeconds % 86400) / 3600);
  const minutes = Math.floor((totalSeconds % 3600) / 60);
  const seconds = totalSeconds % 60;

  return [
    days.toString().padStart(2, "0"),
    hours.toString().padStart(2, "0"),
    minutes.toString().padStart(2, "0"),
    seconds.toString().padStart(2, "0")
  ].join(":");
}

// ========================
// モーダルUI（既存維持）
// ========================

function createIOSInput(placeholder, value = "") {
  const input = document.createElement("input");
  input.placeholder = placeholder;
  input.value = value;

  Object.assign(input.style, {
    padding: "10px 14px",
    borderRadius: "14px",
    background: "rgba(255,255,255,0.15)",
    border: "1px solid rgba(255,255,255,0.25)",
    color: "white",
    outline: "none",
    fontFamily: "system-ui"
  });

  return input;
}

function createIOSButton(label) {
  const btn = document.createElement("button");
  btn.innerText = label;

  Object.assign(btn.style, {
    padding: "10px",
    borderRadius: "16px",
    background: "rgba(255,255,255,0.25)",
    border: "none",
    color: "white",
    cursor: "pointer",
    fontFamily: "system-ui"
  });

  return btn;
}

function createGlassWindow() {

  isModalOpen = true;

  const overlay = document.createElement("div");
  Object.assign(overlay.style, {
    position: "fixed",
    inset: "0",
    background: "rgba(0,0,0,0.45)",
    display: "flex",
    alignItems: "center",
    justifyContent: "center",
    zIndex: "9999"
  });

  const box = document.createElement("div");
  Object.assign(box.style, {
    padding: "28px",
    borderRadius: "28px",
    backdropFilter: "blur(30px)",
    background: "rgba(255,255,255,0.12)",
    border: "1px solid rgba(255,255,255,0.25)",
    minWidth: "280px",
    color: "white",
    display: "flex",
    flexDirection: "column",
    gap: "14px",
    position: "relative"
  });

  const close = document.createElement("div");
  close.innerText = "×";
  Object.assign(close.style, {
    position: "absolute",
    top: "10px",
    right: "14px",
    cursor: "pointer",
    fontSize: "18px",
    opacity: "0.6"
  });

  close.onclick = () => {
    overlay.remove();
    isModalOpen = false;
  };

  overlay.onclick = () => {
    overlay.remove();
    isModalOpen = false;
  };

  box.onclick = (e) => e.stopPropagation();

  box.appendChild(close);
  overlay.appendChild(box);
  document.body.appendChild(overlay);

  return { overlay, box };
}

// ========================
// 詳細表示
// ========================

function showDetailCard(ring) {

  const { overlay, box } = createGlassWindow();

  const title = document.createElement("div");
  title.innerText = ring.name;
  title.style.fontSize = "18px";

  const time = document.createElement("div");
  time.innerText = formatTime(ring.periodMs);
  time.style.opacity = "0.7";

  const divider = document.createElement("div");
  divider.style.height = "1px";
  divider.style.background = "rgba(255,255,255,0.3)";
  divider.style.margin = "8px 0";

  // 通知トグル（リング個別）

  const notifyToggle = createIOSSwitch(ring.notifyEnabled);

  notifyToggle.querySelector("div").innerText = "All Notification";

  const track = notifyToggle.querySelector("div:nth-child(2)");

  track.onclick = () => {

    ring.notifyEnabled = !ring.notifyEnabled;

    track.style.background =
      ring.notifyEnabled ? "#34C759" : "rgba(255,255,255,0.3)";

  const knob = track.firstChild;

  knob.style.left =
    ring.notifyEnabled ? "22px" : "2px";
};

box.append(title, time);

// ← ここに移動
box.appendChild(notifyToggle);

box.append(divider, editBtn, deleteBtn);

  const editBtn = createIOSButton("Edit");
  const deleteBtn = createIOSButton("Delete");

  editBtn.onclick = () => {
    overlay.remove();
    showEditDialog(ring);
  };

  deleteBtn.onclick = () => {
    overlay.remove();
    showDeleteDialog(ring);
  };

  box.append(title, time, divider, editBtn, deleteBtn);
}

// ========================
// Edit / Delete
// ========================

function showEditDialog(ring) {

  const { overlay, box } = createGlassWindow();

  const nameInput = createIOSInput("Name", ring.name);
  const timeInput = createIOSInput("Time", formatTime(ring.periodMs));
  const saveBtn = createIOSButton("Save");

  saveBtn.onclick = () => {
    const ms = parseTimeInput(timeInput.value);
    if (ms > 0) {
      ring.name = nameInput.value;
      ring.periodMs = ms;
    }
    overlay.remove();
    isModalOpen = false;
  };

  box.append(nameInput, timeInput, saveBtn);
}

function showDeleteDialog(ring) {

  const { overlay, box } = createGlassWindow();

  const message = document.createElement("div");
  message.innerText = `Do you want to delete "${ring.name}" ?`;

  const cancelBtn = createIOSButton("Cancel");
  const confirmBtn = createIOSButton("Delete");

  cancelBtn.onclick = () => {
    overlay.remove();
    isModalOpen = false;
  };

  confirmBtn.onclick = () => {
    ring.ringMesh.removeFromParent();
    ring.hitMesh.removeFromParent();
    ring.planetMesh.removeFromParent();
    ringManager.rings =
      ringManager.rings.filter(r => r !== ring);
    overlay.remove();
    isModalOpen = false;
  };

  box.append(message, cancelBtn, confirmBtn);
}

// ========================
// UI接続（Theme統合）
// ========================

const ui = new UI(
  null,
  (scale) => ringManager.setRadiusScale(scale),
  (name, timeInput) => {
    const ms = parseTimeInput(timeInput);
    if (ms > 0) {
      ringManager.addRing(1, name, ms);
    }
  },
  () => {
    ringManager.clearAll();
  }
);

// ========================
// 通知トグルUI（追加差分）
// ========================

function createIOSSwitch(initialState = true) {

  const container = document.createElement("div");
  Object.assign(container.style, {
  display: "flex",
  alignItems: "center",
  justifyContent: "space-between", // ← 左右に分離
  gap: "10px",
  marginTop: "10px",
  width: "100%",                   // ← 横幅いっぱいに
  fontFamily: "system-ui",
  color: "white",
  fontSize: "13px",
  position: "relative",
  zIndex: "10001"   // ← 追加
});

  const label = document.createElement("div");
  label.innerText = "Notification";
  label.style.opacity = notificationsEnabled ? "0.85" : "0.4";

  const switchTrack = document.createElement("div");
  Object.assign(switchTrack.style, {
    width: "46px",
    height: "26px",
    borderRadius: "13px",
    background: initialState ? "#34C759" : "rgba(255,255,255,0.3)",
    position: "relative",
    cursor: "pointer",
    opacity: "1",
    transition: "background 0.2s ease"
  });

  const knob = document.createElement("div");
  Object.assign(knob.style, {
    width: "22px",
    height: "22px",
    borderRadius: "50%",
    background: "white",
    position: "absolute",
    top: "2px",
    left: initialState ? "22px" : "2px",
    opacity: "1",
    transition: "left 0.2s ease"
  });

  switchTrack.appendChild(knob);

  switchTrack.onclick = () => {

  globalNotificationsEnabled = !globalNotificationsEnabled;

  switchTrack.style.background =
    globalNotificationsEnabled ? "#34C759" : "rgba(255,255,255,0.3)";

  knob.style.left =
    globalNotificationsEnabled ? "22px" : "2px";
};

  container.appendChild(label);
  container.appendChild(switchTrack);

  return container;
}

// UIの左下コンテナに追加
// ========================
// 通知トグルを Scale と Add の間に挿入
// ========================

const switchElement = createIOSSwitch(true);

// Addボタンを探す（テキストで判定）
const addButton = Array.from(ui.container.querySelectorAll("button"))
  .find(btn => btn.innerText.includes("Add"));

if (addButton) {
  ui.container.insertBefore(switchElement, addButton);
} else {
  // 万一見つからない場合は末尾に追加
  ui.container.appendChild(switchElement);
}

// ========================
// 周回通知接続（追加差分）
// ========================

ringManager.onCycle = (ring) => {

  if (!globalNotificationsEnabled) return;
  if (!ring.notifyEnabled) return;

  showCycleToast(ring.name);
};

// ========================
// Raycaster
// ========================

const raycaster = new THREE.Raycaster();
const mouse = new THREE.Vector2();

window.addEventListener("mousemove", (event) => {

  mouse.x = (event.clientX / window.innerWidth) * 2 - 1;
  mouse.y = -(event.clientY / window.innerHeight) * 2 + 1;

  if (isModalOpen) return;

  raycaster.setFromCamera(mouse, sceneManager.camera);
  const intersects =
    raycaster.intersectObjects(ringManager.getMeshes());

  if (intersects.length > 0) {

    const ring =
      ringManager.getRingByMesh(intersects[0].object);

    ringManager.setHovered(ring.name);

    if (activeRingName !== ring.name) {
      activeRingName = ring.name;
      hoverStartTime = performance.now();
      languageLayer.innerHTML = "";
    }

  } else {
    ringManager.setHovered(null);
    activeRingName = null;
    languageLayer.innerHTML = "";
  }
});

window.addEventListener("click", () => {

  if (isModalOpen) return;

  raycaster.setFromCamera(mouse, sceneManager.camera);

  const intersects =
    raycaster.intersectObjects(ringManager.getMeshes());

  if (intersects.length > 0) {

    const ring =
      ringManager.getRingByMesh(intersects[0].object);

    showDetailCard(ring);
  }
});

// ========================
// フォント分類
// ========================

function getFontByWord(word) {

  if (/[\u3040-\u30ff\u4e00-\u9faf]/.test(word)) {
    return 'serif';
  }

  if (/[\uac00-\ud7af]/.test(word)) {
    return 'serif';
  }

  if (/ñ|é|á|í|ó|ú/i.test(word)) {
    return 'serif';
  }

  return 'sans-serif';
}

// ========================
// アニメーション
// ========================

function animate() {
  requestAnimationFrame(animate);
  ringManager.update();
  const delta = 16; // 簡易固定（十分滑らか）

for (let i = languageParticles.length - 1; i >= 0; i--) {

  const p = languageParticles[i];

  p.life += delta;

  // フェードイン（最初の500ms）
  if (p.life < 500) {
    p.opacity = p.life / 500 * 0.1;
  }

  // フェードアウト（最後の1000ms）
  else if (p.life > p.maxLife - 1000) {
    p.opacity =
      ((p.maxLife - p.life) / 1000) * 0.1;
  }

  else {
    p.opacity = 0.1;
  }

  // 横移動
  p.x += p.vx * 0.016;

  p.element.style.left = p.x + "px";
  p.element.style.opacity = p.opacity;

  // 寿命終了
  if (p.life >= p.maxLife) {
    p.element.remove();
    languageParticles.splice(i, 1);
  }
}

  // 多言語増殖
  if (activeRingName) {

    const elapsed = performance.now() - hoverStartTime;
    const spawnCount = Math.floor(elapsed / 500);
    const words = multilingualMap[activeRingName] || [activeRingName];

    for (let i = languageLayer.childElementCount; i < spawnCount; i++) {

      if (words.length === 0) break;

      const span = document.createElement("div");
        span.innerText =
        words[Math.floor(Math.random() * words.length)];

        const size = 24 + Math.random() * 120;

        const startX = Math.random() * window.innerWidth;
        const startY = Math.random() * window.innerHeight;

        Object.assign(span.style, {
         position: "absolute",
         left: startX + "px",
         top: startY + "px",
         fontSize: size + "px",
         opacity: "0",
         color: "white",
         fontFamily: getFontByWord(span.innerText),
         whiteSpace: "nowrap",
         transition: "none"
});

languageLayer.appendChild(span);

languageParticles.push({
  element: span,
  x: startX,
  y: startY,
  vx: 10 + Math.random() * 20,   // 横移動速度
  opacity: 0,
  life: 0,
  maxLife: 5000 + Math.random() * 3000
});
    }
  }
  sceneManager.render();
}

animate();
