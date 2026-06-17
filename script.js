import * as THREE from 'three';
import { GLTFLoader } from 'three/addons/loaders/GLTFLoader.js';

const scene = new THREE.Scene();
scene.background = new THREE.Color(0x000000);

const camera = new THREE.PerspectiveCamera(
    75,
    window.innerWidth / window.innerHeight,
    0.1,
    1000
);

const renderer = new THREE.WebGLRenderer({ antialias: true });
renderer.setSize(window.innerWidth, window.innerHeight);
document.body.appendChild(renderer.domElement);

// Lights
const ambientLight = new THREE.AmbientLight(0xffffff, 2);
scene.add(ambientLight);

const directionalLight = new THREE.DirectionalLight(0xffffff, 2);
directionalLight.position.set(5, 5, 5);
scene.add(directionalLight);

// Load avatar
const loader = new GLTFLoader();

loader.load(
    'avatar.glb',
    function (gltf) {

        const avatar = gltf.scene;

        avatar.scale.set(1, 1, 1);
        avatar.position.set(0, -1, 0);

        scene.add(avatar);

    },
    undefined,
    function (error) {
        console.error(error);
    }
);

camera.position.z = 3;

function animate() {
    requestAnimationFrame(animate);
    renderer.render(scene, camera);
}

animate();

window.addEventListener('resize', () => {

    camera.aspect = window.innerWidth / window.innerHeight;
    camera.updateProjectionMatrix();

    renderer.setSize(window.innerWidth, window.innerHeight);

});
