import * as THREE from 'three';
import { GLTFLoader } from 'three/addons/loaders/GLTFLoader.js';

/* =========================
   THREE.JS SETUP
========================= */

const scene = new THREE.Scene();
scene.background = new THREE.Color(0x202020);

const camera = new THREE.PerspectiveCamera(
    75,
    window.innerWidth / window.innerHeight,
    0.1,
    1000
);

camera.position.set(0, 1.5, 5);

const renderer = new THREE.WebGLRenderer({ antialias: true });
renderer.setSize(window.innerWidth, window.innerHeight);
document.body.appendChild(renderer.domElement);

/* LIGHTS */
scene.add(new THREE.AmbientLight(0xffffff, 3));

const light = new THREE.DirectionalLight(0xffffff, 5);
light.position.set(5, 10, 5);
scene.add(light);

/* DEBUG OBJECTS */
const cube = new THREE.Mesh(
    new THREE.BoxGeometry(),
    new THREE.MeshNormalMaterial()
);
cube.position.set(-2, 1, 0);
scene.add(cube);

const sphere = new THREE.Mesh(
    new THREE.SphereGeometry(0.5, 16, 16),
    new THREE.MeshBasicMaterial({ color: 0x00ffcc })
);
sphere.position.set(2, 1, 0);
scene.add(sphere);

/* =========================
   LOAD MODEL
========================= */
let avatar;
let hips, spine, head;

const loader = new GLTFLoader();
const debug = document.getElementById("debug");

loader.load('./avatar.glb', (gltf) => {

    avatar = gltf.scene;

    // ---- DEBUG BONES ----
    let boneList = "BONES FOUND:<br>";

    avatar.traverse((obj) => {
        if (obj.isBone) {
            boneList += obj.name + "<br>";
        }
    });

    if (debug) {
        debug.innerHTML = boneList;
    }

    // ---- SCALE + CENTER (NOW INSIDE LOAD) ----
    const box = new THREE.Box3().setFromObject(avatar);
    const size = box.getSize(new THREE.Vector3());
    const scale = 2 / size.y;

    avatar.scale.set(scale, scale, scale);
    scene.add(avatar);

});
/* =========================
   ANIMATION LOOP
========================= */

function animate() {
    requestAnimationFrame(animate);

    cube.rotation.x += 0.01;
    cube.rotation.y += 0.01;

    sphere.rotation.y += 0.01;

    renderer.render(scene, camera);
}

animate();

/* =========================
   MEDIA PIPE POSE
========================= */
const videoElement = document.getElementById('video');

/* =========================
   POSE SETUP
========================= */

const pose = new Pose({
    locateFile: (file) =>
        `https://cdn.jsdelivr.net/npm/@mediapipe/pose/${file}`
});

pose.setOptions({
    modelComplexity: 1,
    smoothLandmarks: true,
    minDetectionConfidence: 0.5,
    minTrackingConfidence: 0.5
});

/* =========================
   RECEIVE RESULTS
========================= */

pose.onResults((results) => {
    if (!results.poseLandmarks || !avatar) return;

    const lm = results.poseLandmarks;

    const scale = 5;

    const leftShoulder = lm[11];
    const rightShoulder = lm[12];
    const nose = lm[0];

    const centerX = (leftShoulder.x + rightShoulder.x) / 2 - 0.5;
    const centerY = (leftShoulder.y + rightShoulder.y) / 2 - 0.5;
if (hips) {
    hips.position.x = centerX * 5;
    hips.position.y = -centerY * 5;
}

if (head) {
    head.rotation.y = (nose.x - 0.5) * 2;
}
});

/* =========================
   CAMERA FEED (IMPORTANT)
========================= */

const mpCamera = new Camera(videoElement, {
    onFrame: async () => {
        await pose.send({ image: videoElement });
    },
    width: 640,
    height: 480
});

mpCamera.start();