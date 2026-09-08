/* 3D fan globe (Three.js) for the Worldwide Fan Map preview section. */
(function () {
  const CITIES = [
    [25.76, -80.19], [34.05, -118.24], [40.71, -74.0], [19.43, -99.13], [41.39, 2.17], [40.42, -3.7],
    [-34.6, -58.38], [-23.55, -46.63], [4.71, -74.07], [51.51, -0.13], [48.86, 2.35], [52.52, 13.4],
    [41.9, 12.5], [35.68, 139.69], [37.57, 126.98], [-33.87, 151.21], [25.2, 55.27], [19.08, 72.88],
    [-26.2, 28.05], [30.04, 31.24], [55.75, 37.62], [1.35, 103.82], [43.65, -79.38], [18.47, -69.9],
    [-12.05, -77.04], [-33.45, -70.67], [10.48, -66.9], [14.6, -90.5], [23.13, -82.38], [18.44, -66.0]
  ];
  let renderer, scene, camera, globe, pins, raf, host;

  function toXYZ(lat, lon, r) {
    const phi = (90 - lat) * Math.PI / 180, theta = (lon + 180) * Math.PI / 180;
    return new THREE.Vector3(-r * Math.sin(phi) * Math.cos(theta), r * Math.cos(phi), r * Math.sin(phi) * Math.sin(theta));
  }

  function build() {
    renderer = new THREE.WebGLRenderer({ antialias: true, alpha: true });
    renderer.setPixelRatio(Math.min(2, window.devicePixelRatio || 1));
    scene = new THREE.Scene();
    camera = new THREE.PerspectiveCamera(38, 1, 0.1, 100);
    camera.position.set(0, 0.25, 3.6);
    scene.add(new THREE.AmbientLight(0x6f7bff, 0.9));
    const sun = new THREE.DirectionalLight(0xffffff, 1.4); sun.position.set(5, 3, 4); scene.add(sun);

    globe = new THREE.Group();
    const tex = new THREE.TextureLoader().load("media/earth.jpg");
    const earth = new THREE.Mesh(new THREE.SphereGeometry(1, 64, 64),
      new THREE.MeshPhongMaterial({ map: tex, color: 0x9aa4ff, specular: 0x222244, shininess: 8 }));
    globe.add(earth);
    const glow = new THREE.Mesh(new THREE.SphereGeometry(1.06, 64, 64),
      new THREE.MeshBasicMaterial({ color: 0x5b6cff, transparent: true, opacity: 0.18, side: THREE.BackSide, blending: THREE.AdditiveBlending }));
    globe.add(glow);

    pins = [];
    const pinGeo = new THREE.SphereGeometry(0.008, 10, 10);
    const ringGeo = new THREE.RingGeometry(0.012, 0.022, 32);
    CITIES.forEach(([lat, lon], i) => {
      const jitter = () => (Math.random() - 0.5) * 6;
      const n = 2 + Math.floor(Math.random() * 4);
      for (let k = 0; k < n; k++) {
        const pos = toXYZ(lat + (k ? jitter() : 0), lon + (k ? jitter() : 0), 1.005);
        const hot = k === 0 && i % 3 === 0;
        const pin = new THREE.Mesh(pinGeo, new THREE.MeshBasicMaterial({ color: hot ? 0xffd233 : 0xff4fa3 }));
        pin.position.copy(pos); globe.add(pin);
        const ring = new THREE.Mesh(ringGeo, new THREE.MeshBasicMaterial({ color: hot ? 0xffd233 : 0xff4fa3, transparent: true, opacity: 0.8, side: THREE.DoubleSide }));
        ring.position.copy(pos); ring.lookAt(pos.clone().multiplyScalar(2)); globe.add(ring);
        pins.push({ ring, t: Math.random() * Math.PI * 2, speed: 0.6 + Math.random() * 0.8 });
      }
    });
    globe.rotation.y = -1.2;
    scene.add(globe);
  }

  function resize() {
    if (!host) return;
    const w = host.clientWidth || 300, h = host.clientHeight || 300;
    renderer.setSize(w, h, false);
    camera.aspect = w / h; camera.updateProjectionMatrix();
  }

  function loop() {
    if (!host || !host.isConnected) { host = null; raf = null; return; }
    globe.rotation.y += 0.0035;
    const now = performance.now() / 1000;
    pins.forEach((p) => {
      const s = 1 + 0.9 * ((Math.sin(now * p.speed * 2 + p.t) + 1) / 2);
      p.ring.scale.setScalar(s); p.ring.material.opacity = 0.9 - 0.7 * (s - 1) / 0.9;
    });
    renderer.render(scene, camera);
    raf = requestAnimationFrame(loop);
  }

  window.mountGlobe = function (el) {
    if (!el || typeof THREE === "undefined") return;
    if (!renderer) build();
    host = el;
    el.appendChild(renderer.domElement);
    resize();
    if (!raf) raf = requestAnimationFrame(loop);
  };
  window.addEventListener("resize", () => { if (host) resize(); });
})();
