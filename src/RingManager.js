import * as THREE from "three";
import { getPhase } from "./TimeSystem.js";

export class RingManager {
  constructor(scene, songMap = {}) {
    this.scene = scene;
    this.songMap = songMap; // ← 引数から受け取る

    this.rings = [];
    this.hovered = null;
    this.mode = "concentric";
    this.radiusScale = 1;
    this.theme = "dark";
    this.onCycle = null;
  }

  setMode(mode) {
    this.mode = mode;
  }

  setRadiusScale(scale) {
    this.radiusScale = scale;
  }

  setTheme(theme) {
  this.theme = theme;

  this.rings.forEach(r => {
    r.ringMaterial.color.set(
      theme === "dark" ? 0xffffff : 0x000000
    );

    r.planetMesh.material.color.set(
      theme === "dark" ? 0xffffff : 0x000000
    );
  });
}

  addRing(periodDays, name, periodMsOverride = null) {

  const baseRadius = 60;
  const spacing = 45;
  const radius = baseRadius + this.rings.length * spacing;

  const color = new THREE.Color(
    this.theme === "dark" ? 0xffffff : 0x000000
  );

  // ===== Ring =====
  const ringGeometry = new THREE.RingGeometry(radius - 1.2, radius + 1.2, 128);
  const ringMaterial = new THREE.MeshBasicMaterial({
    color,
    transparent: true,
    opacity: this.theme === "dark" ? 0.25 : 0.35,
    blending: THREE.AdditiveBlending
  });

  const ringMesh = new THREE.Mesh(ringGeometry, ringMaterial);
  this.scene.add(ringMesh);

  // ===== Hit =====
  const hitGeometry = new THREE.RingGeometry(radius - 8, radius + 8, 128);
  const hitMaterial = new THREE.MeshBasicMaterial({
    transparent: true,
    opacity: 0
  });

  const hitMesh = new THREE.Mesh(hitGeometry, hitMaterial);
  this.scene.add(hitMesh);

  // ===== Planet =====
  const planetGeometry = new THREE.CircleGeometry(5, 32);
  const planetMaterial = new THREE.MeshBasicMaterial({
    color,
    transparent: true,
    opacity: 0.9,
    blending: THREE.AdditiveBlending
  });

  const planetMesh = new THREE.Mesh(planetGeometry, planetMaterial);
  this.scene.add(planetMesh);

  // ===== Trail =====
  const trailMaterial = new THREE.LineBasicMaterial({
    vertexColors: true,
    transparent: true,
    blending: THREE.AdditiveBlending,
    depthWrite: false
  });

  const trailGeometry = new THREE.BufferGeometry();
  const trailLine = new THREE.Line(trailGeometry, trailMaterial);
  this.scene.add(trailLine);

  const periodMs =
    periodMsOverride !== null
      ? periodMsOverride
      : periodDays * 24 * 60 * 60 * 1000;

  const ring = {
    name,
    baseRadius: radius,
    ringMesh,
    hitMesh,
    planetMesh,
    ringMaterial,
    periodMs,
    lastPhase: 0,
    notifyEnabled: true,

    trailPoints: [],
    trailLine,
    audio: null
  };

  // ===== 🎵 音楽自動紐付け =====
  if (this.songMap[name]) {

    const audio = new Audio(this.songMap[name]);
    audio.crossOrigin = "anonymous";
    audio.loop = true;

    audio.addEventListener("loadedmetadata", () => {
      ring.periodMs = audio.duration * 1000;
    });

    // ブラウザ自動再生対策
    const tryPlay = () => {
      audio.play().catch(() => {});
      window.removeEventListener("click", tryPlay);
    };
    window.addEventListener("click", tryPlay);

    ring.audio = audio;
  }

  this.rings.push(ring);
}

  clearAll() {
  this.rings.forEach(r => {
    this.scene.remove(r.ringMesh);
    this.scene.remove(r.hitMesh);
    this.scene.remove(r.planetMesh);

    r.ringGeometry?.dispose?.();
    r.hitGeometry?.dispose?.();
    r.planetMesh.geometry?.dispose?.();
  });

  this.rings = [];
  this.hovered = null;
}

  update() {

  this.rings.forEach((r, i) => {

    let phase;

    if (r.audio && r.audio.duration) {
      phase =
        (r.audio.currentTime / r.audio.duration) * Math.PI * 2;
    } else {
      phase = getPhase(r.periodMs);
    }

    if (phase < r.lastPhase) {
      this.onCycle?.(r);
    }

    r.lastPhase = phase;

    const scaledRadius = r.baseRadius * this.radiusScale;
    const offsetPhase = phase - Math.PI / 2;

    const x = Math.cos(offsetPhase) * scaledRadius;
    const y = -Math.sin(offsetPhase) * scaledRadius;

    r.planetMesh.position.set(x, y, 0);

    r.ringMesh.scale.setScalar(this.radiusScale);
    r.hitMesh.scale.setScalar(this.radiusScale);

    if (this.mode === "free") {
      const offset = (i - 3) * 180;
      r.ringMesh.position.x = offset;
      r.hitMesh.position.x = offset;
      r.planetMesh.position.x += offset;
    } else {
      r.ringMesh.position.set(0, 0, 0);
      r.hitMesh.position.set(0, 0, 0);
    }

    r.ringMaterial.opacity =
      this.hovered === r.name ? 0.8 : 0.2;

    // ===== Trail更新 =====
    if (r.trailLine) {

      const pos = r.planetMesh.position.clone();
      r.trailPoints.push(pos);

      const maxTrailLength = 60;
      if (r.trailPoints.length > maxTrailLength) {
        r.trailPoints.shift();
      }

      const positions = [];
      const colors = [];
      const total = r.trailPoints.length;

      r.trailPoints.forEach((p, index) => {

        positions.push(p.x, p.y, p.z);

        const t = index / total;
        const alpha = Math.pow(t, 2) * 0.9;

        colors.push(1, 1, 1, alpha);
      });

      r.trailLine.geometry.setAttribute(
        "position",
        new THREE.Float32BufferAttribute(positions, 3)
      );

      r.trailLine.geometry.setAttribute(
        "color",
        new THREE.Float32BufferAttribute(colors, 4)
      );

      r.trailLine.geometry.computeBoundingSphere();
    }
  });
}

  getMeshes() {
    return this.rings.map(r => r.hitMesh);
  }

  getRingByMesh(mesh) {
    return this.rings.find(r => r.hitMesh === mesh);
  }

  setHovered(name) {
    this.hovered = name;
  }
}