import * as THREE from "three";

export class SceneManager {
  constructor() {
    this.scene = new THREE.Scene();

    this.camera = new THREE.OrthographicCamera(
      window.innerWidth / -2,
      window.innerWidth / 2,
      window.innerHeight / 2,
      window.innerHeight / -2,
      1,
      1000
    );
    this.camera.position.z = 10;

    this.renderer = new THREE.WebGLRenderer({ antialias: true });
    this.renderer.setSize(window.innerWidth, window.innerHeight);

    // 初期は dark
    this.renderer.setClearColor(0x000000, 1);

    document.body.appendChild(this.renderer.domElement);

    window.addEventListener("resize", () => this.onResize());
  }

  // ★ 追加：テーマ切替用
  setBackground(theme) {
    const color = theme === "dark" ? 0x000000 : 0xffffff;
    this.renderer.setClearColor(color, 1);
  }

  onResize() {
    this.camera.left = window.innerWidth / -2;
    this.camera.right = window.innerWidth / 2;
    this.camera.top = window.innerHeight / 2;
    this.camera.bottom = window.innerHeight / -2;
    this.camera.updateProjectionMatrix();
    this.renderer.setSize(window.innerWidth, window.innerHeight);
  }

  render() {
    this.renderer.render(this.scene, this.camera);
  }
}