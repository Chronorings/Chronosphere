import * as THREE from "three";
import { getPhase } from "./TimeSystem.js";

export class RingManager {
  constructor(scene) {
    this.scene = scene;
    this.rings = [];
    this.hovered = null;
    this.mode = "concentric";
    this.radiusScale = 1;
    this.theme = "dark";
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

    const ringGeometry = new THREE.RingGeometry(radius - 1.2, radius + 1.2, 128);
    const ringMaterial = new THREE.MeshBasicMaterial({
      color,
      transparent: true,
      opacity: this.theme === "dark" ? 0.25 : 0.35,
      blending: THREE.AdditiveBlending
    });

    const ringMesh = new THREE.Mesh(ringGeometry, ringMaterial);
    this.scene.add(ringMesh);

    const hitGeometry = new THREE.RingGeometry(radius - 8, radius + 8, 128);
    const hitMaterial = new THREE.MeshBasicMaterial({
      transparent: true,
      opacity: 0
    });

    const hitMesh = new THREE.Mesh(hitGeometry, hitMaterial);
    this.scene.add(hitMesh);

    const planetGeometry = new THREE.CircleGeometry(5, 32);
    const planetMaterial = new THREE.MeshBasicMaterial({
      color,
      transparent: true,
      opacity: 0.9,
      blending: THREE.AdditiveBlending
    });

    const planetMesh = new THREE.Mesh(planetGeometry, planetMaterial);
    this.scene.add(planetMesh);

    const periodMs =
     periodMsOverride !== null
      ? periodMsOverride
      : periodDays * 24 * 60 * 60 * 1000;

    this.rings.push({
      name,
      baseRadius: radius,
      ringMesh,
      hitMesh,
      planetMesh,
      ringMaterial,
      periodMs
    });
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
    const phases = [];

    this.rings.forEach((r, i) => {

      const scaledRadius = r.baseRadius * this.radiusScale;
      const phase = -getPhase(r.periodMs);

      const offsetPhase = phase + Math.PI / 2;

      const x = Math.cos(offsetPhase) * scaledRadius;
      const y = Math.sin(offsetPhase) * scaledRadius;

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

      r.ringMaterial.opacity = this.hovered === r.name ? 0.8 : 0.2;
    });

    return phases;
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