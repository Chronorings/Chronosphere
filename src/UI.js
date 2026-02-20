export class UI {
  constructor(onThemeChange, onScaleChange, onAdd, onDeleteAll) {
    this.onThemeChange = onThemeChange;
    this.onScaleChange = onScaleChange;
    this.onAdd = onAdd;
    this.onDeleteAll = onDeleteAll;

    this.currentTheme = "dark";

    this.injectSliderStyles(); 

    this.createContainer();
    this.createScaleSlider();
    this.createAddButton();
    this.createDeleteAllButton();
    this.createCopyright();
  }

  // =========================
  // Container
  // =========================
  createContainer() {
    this.container = document.createElement("div");

    Object.assign(this.container.style, {
      position: "absolute",
      left: "20px",
      bottom: "20px",
      padding: "18px 22px",
      borderRadius: "26px",
      backdropFilter: "blur(20px)",
      boxShadow: "0 12px 40px rgba(0,0,0,0.45)",
      fontFamily: "system-ui",
      display: "flex",
      flexDirection: "column",
      gap: "16px",
      minWidth: "240px",
      zIndex: "1000",
      transition: "all 0.3s ease"
    });

    this.applyThemeStyles();
    document.body.appendChild(this.container);
  }

  applyThemeStyles() {
    const dark = this.currentTheme === "dark";

    this.container.style.background = dark
      ? "rgba(255,255,255,0.08)"
      : "rgba(0,0,0,0.06)";

    this.container.style.border = dark
      ? "1px solid rgba(255,255,255,0.18)"
      : "1px solid rgba(0,0,0,0.15)";

    this.container.style.color = dark ? "white" : "black";
  }

  injectSliderStyles() {

  if (document.getElementById("glass-slider-style")) return;

  const style = document.createElement("style");
  style.id = "glass-slider-style";

  style.innerHTML = `
  .glass-slider {
    -webkit-appearance: none;
    width: 100%;
    height: 6px;
    border-radius: 999px;
    background: rgba(255,255,255,0.15);
    outline: none;
    transition: background 0.3s ease;
  }

  .glass-slider::-webkit-slider-thumb {
    -webkit-appearance: none;
    width: 18px;
    height: 18px;
    border-radius: 50%;
    background: rgba(255,255,255,0.9);
    box-shadow: 0 0 12px rgba(255,255,255,0.4);
    cursor: pointer;
    transition: transform 0.2s ease;
  }

  .glass-slider::-webkit-slider-thumb:hover {
    transform: scale(1.15);
  }

  .glass-slider::-moz-range-thumb {
    width: 18px;
    height: 18px;
    border-radius: 50%;
    background: rgba(255,255,255,0.9);
    box-shadow: 0 0 12px rgba(255,255,255,0.4);
    cursor: pointer;
  }
  `;

  document.head.appendChild(style);
}

  // =========================
  // Scale
  // =========================
  createScaleSlider() {

  const label = document.createElement("div");
  label.innerText = "Scale";
  label.style.fontSize = "13px";
  label.style.opacity = "0.7";

  const slider = document.createElement("input");
  slider.type = "range";
  slider.className = "glass-slider";

  slider.min = 1.0;
  slider.max = 2.5;
  slider.step = 0.01;
  slider.value = 1;

  slider.addEventListener("input", () => {
    if (this.onScaleChange) {
      this.onScaleChange(parseFloat(slider.value));
    }
  });

  this.container.append(label, slider);
}

  // =========================
  // Theme Toggle
  // =========================
  createThemeToggle() {
    const wrapper = document.createElement("div");
    wrapper.style.display = "flex";
    wrapper.style.justifyContent = "space-between";
    wrapper.style.alignItems = "center";

    const label = document.createElement("div");
    label.innerText = "Theme";
    label.style.fontSize = "13px";
    label.style.opacity = "0.7";

    const toggle = document.createElement("div");
    toggle.style.width = "52px";
    toggle.style.height = "28px";
    toggle.style.borderRadius = "999px";
    toggle.style.position = "relative";
    toggle.style.cursor = "pointer";
    toggle.style.transition = "background 0.3s ease";

    const knob = document.createElement("div");
    knob.style.width = "22px";
    knob.style.height = "22px";
    knob.style.borderRadius = "50%";
    knob.style.position = "absolute";
    knob.style.top = "3px";
    knob.style.left = "3px";
    knob.style.transition = "transform 0.3s ease";

    const updateToggleVisual = () => {
      const dark = this.currentTheme === "dark";
      toggle.style.background = dark
        ? "rgba(255,255,255,0.25)"
        : "rgba(0,0,0,0.25)";
      knob.style.background = dark ? "white" : "black";
      knob.style.transform = dark
        ? "translateX(0)"
        : "translateX(24px)";
    };

    toggle.onclick = () => {
      this.currentTheme =
        this.currentTheme === "dark" ? "light" : "dark";

      this.applyThemeStyles();
      updateToggleVisual();

      if (this.onThemeChange) {
        this.onThemeChange(this.currentTheme);
      }
    };

    updateToggleVisual();

    toggle.appendChild(knob);
    wrapper.append(label, toggle);
    this.container.appendChild(wrapper);
  }

  // =========================
  // Add Button
  // =========================
  createAddButton() {
  const addBtn = document.createElement("button");
  addBtn.innerText = "Add Ring";

  const applyButtonTheme = () => {
    const dark = this.currentTheme === "dark";

    addBtn.style.color = dark ? "white" : "black";
    addBtn.style.background = dark
      ? "rgba(255,255,255,0.25)"
      : "rgba(0,0,0,0.2)";
  };

  Object.assign(addBtn.style, {
    padding: "8px",
    borderRadius: "14px",
    border: "none",
    cursor: "pointer",
    transition: "all 0.3s ease"
  });

  applyButtonTheme();

  // テーマ変更時にも再適用
  const originalOnThemeChange = this.onThemeChange;
  this.onThemeChange = (theme) => {
    if (originalOnThemeChange) originalOnThemeChange(theme);
    applyButtonTheme();
  };

  addBtn.onclick = () => this.showAddDialog();
  this.container.appendChild(addBtn);
}

// =========================
// Delete All Button
// =========================
createDeleteAllButton() {
  const deleteBtn = document.createElement("button");
  deleteBtn.innerText = "Delete All";

  const applyButtonTheme = () => {
    const dark = this.currentTheme === "dark";

    deleteBtn.style.color = dark ? "white" : "black";
    deleteBtn.style.background = dark
      ? "rgba(255,255,255,0.25)"
      : "rgba(0,0,0,0.2)";
  };

  Object.assign(deleteBtn.style, {
    padding: "8px",
    borderRadius: "14px",
    border: "none",
    cursor: "pointer",
    transition: "all 0.3s ease"
  });

  applyButtonTheme();

  // テーマ変更時に再適用
  const originalOnThemeChange = this.onThemeChange;
  this.onThemeChange = (theme) => {
    if (originalOnThemeChange) originalOnThemeChange(theme);
    applyButtonTheme();
  };

  deleteBtn.onclick = () => this.showDeleteAllDialog();

  this.container.appendChild(deleteBtn);
}

  // =========================
  // Add Panel
  // =========================
  showAddDialog() {

    if (document.getElementById("add-panel")) return;

    const dark = this.currentTheme === "dark";

    const panel = document.createElement("div");
    panel.id = "add-panel";

    Object.assign(panel.style, {
      position: "fixed",
      left: "20px",
      bottom: "220px",
      padding: "20px",
      borderRadius: "24px",
      backdropFilter: "blur(30px)",
      background: dark
        ? "rgba(255,255,255,0.12)"
        : "rgba(0,0,0,0.08)",
      border: dark
        ? "1px solid rgba(255,255,255,0.25)"
        : "1px solid rgba(0,0,0,0.15)",
      color: dark ? "white" : "black",
      fontFamily: "system-ui",
      display: "flex",
      flexDirection: "column",
      gap: "12px",
      zIndex: "1000",
      minWidth: "240px"
    });

    const close = document.createElement("div");
    close.innerText = "×";
    close.style.position = "absolute";
    close.style.top = "8px";
    close.style.right = "12px";
    close.style.cursor = "pointer";
    close.onclick = () => panel.remove();

    const nameInput = document.createElement("input");
    nameInput.placeholder = "Name";

    const timeInput = document.createElement("input");
    timeInput.placeholder = "00:01:30 / 1m30s / 90s";

    [nameInput, timeInput].forEach(input => {
      Object.assign(input.style, {
        padding: "8px 12px",
        borderRadius: "12px",
        background: dark
          ? "rgba(255,255,255,0.15)"
          : "rgba(0,0,0,0.1)",
        border: dark
          ? "1px solid rgba(255,255,255,0.25)"
          : "1px solid rgba(0,0,0,0.2)",
        color: dark ? "white" : "black",
        outline: "none"
      });
    });

    const addBtn = document.createElement("button");
    addBtn.innerText = "Add";

    Object.assign(addBtn.style, {
      padding: "8px",
      borderRadius: "14px",
      background: dark
        ? "rgba(255,255,255,0.25)"
        : "rgba(0,0,0,0.2)",
      border: "none",
      color: dark ? "white" : "black",
      cursor: "pointer"
    });

    const handleAdd = () => {
  if (this.onAdd) {
    this.onAdd(
      nameInput.value || "Custom",
      timeInput.value
    );
  }
  panel.remove();
};

addBtn.onclick = handleAdd;

    // Enterキー対応
    timeInput.addEventListener("keydown", (e) => {
     if (e.key === "Enter") {
      handleAdd();
  }
});

    addBtn.onclick = () => {
      if (this.onAdd) {
        this.onAdd(
          nameInput.value || "Custom",
          timeInput.value
        );
      }
      panel.remove();
    };

    panel.append(close, nameInput, timeInput, addBtn);
    document.body.appendChild(panel);
  }

  // =========================
// Delete All Dialog
// =========================
showDeleteAllDialog() {

  if (document.getElementById("delete-all-panel")) return;

  const dark = this.currentTheme === "dark";

  const panel = document.createElement("div");
  panel.id = "delete-all-panel";

  Object.assign(panel.style, {
    position: "fixed",
    left: "20px",
    bottom: "223px",
    padding: "20px",
    borderRadius: "24px",
    backdropFilter: "blur(30px)",
    background: dark
      ? "rgba(255,255,255,0.12)"
      : "rgba(0,0,0,0.08)",
    border: dark
      ? "1px solid rgba(255,255,255,0.25)"
      : "1px solid rgba(0,0,0,0.15)",
    color: dark ? "white" : "black",
    fontFamily: "system-ui",
    display: "flex",
    flexDirection: "column",
    gap: "12px",
    zIndex: "1000",
    minWidth: "240px"
  });

  const close = document.createElement("div");
  close.innerText = "×";
  close.style.position = "absolute";
  close.style.top = "8px";
  close.style.right = "12px";
  close.style.cursor = "pointer";
  close.onclick = () => panel.remove();

  const message = document.createElement("div");
  message.innerText = "Delete all rings?";
  message.style.fontSize = "14px";

  const buttons = document.createElement("div");
  buttons.style.display = "flex";
  buttons.style.gap = "10px";

  const cancelBtn = document.createElement("button");
  cancelBtn.innerText = "Cancel";

  const confirmBtn = document.createElement("button");
  confirmBtn.innerText = "Delete";

  [cancelBtn, confirmBtn].forEach(btn => {
    Object.assign(btn.style, {
      flex: "1",
      padding: "8px",
      borderRadius: "14px",
      border: "none",
      cursor: "pointer",
      background: dark
        ? "rgba(255,255,255,0.25)"
        : "rgba(0,0,0,0.2)",
      color: dark ? "white" : "black"
    });
  });

  confirmBtn.style.background = dark
    ? "rgba(255,120,120,0.35)"
    : "rgba(180,0,0,0.25)";

  cancelBtn.onclick = () => panel.remove();

  confirmBtn.onclick = () => {
    if (this.onDeleteAll) {
      this.onDeleteAll();
    }
    panel.remove();
  };

  buttons.append(cancelBtn, confirmBtn);
  panel.append(close, message, buttons);

  document.body.appendChild(panel);
}

  // =========================
  // Copyright
  // =========================
  createCopyright() {

  if (document.getElementById("chronorings-copy")) return;

  const copy = document.createElement("div");
  copy.id = "chronorings-copy";
  copy.innerText = "©2026 Chronorings.";

  Object.assign(copy.style, {
    position: "fixed",          // absolute → fixed 推奨
    left: "50%",
    bottom: "12px",
    transform: "translateX(-50%)",
    fontSize: "11px",
    letterSpacing: "1px",
    opacity: "0.35",
    color: "white",
    pointerEvents: "none",
    fontFamily: "-apple-system, BlinkMacSystemFont, system-ui",
    zIndex: "2000"              // ← 重要
  });

  document.body.appendChild(copy);
}
}