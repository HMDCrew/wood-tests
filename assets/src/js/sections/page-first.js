import * as THREE from 'three';
import {OrbitControls} from 'three/addons/controls/OrbitControls.js';

const canvas = document.querySelector('#c')
const renderer = new THREE.WebGLRenderer({ antialias: true, canvas })
const camera = new THREE.PerspectiveCamera(40, 2, 0.1, 1000);
const scene = new THREE.Scene();

camera.position.z = 120

const geometry = new THREE.BoxGeometry(1, 1, 1);
// const material = new THREE.MeshPhongMaterial({color: 0x44aa88});
// const cube = new THREE.Mesh(geometry, material);
// scene.add(cube);


const color = 0xFFFFFF;
const intensity = 3;
const light = new THREE.DirectionalLight(color, intensity);
light.position.set(-1, 2, 4);
scene.add(light);


function makeInstance(geometry, color, x) {
    const material = new THREE.MeshPhongMaterial({color});
   
    const cube = new THREE.Mesh(geometry, material);
    scene.add(cube);
   
    cube.position.x = x;
   
    return cube;
}

const cubes = [
    makeInstance(geometry, 0x44aa88,  0),
    makeInstance(geometry, 0x8844aa, -2),
    makeInstance(geometry, 0xaa8844,  2),
];

function resizeRendererToDisplaySize(renderer) {
    const canvas = renderer.domElement;
    const pixelRatio = window.devicePixelRatio;
    const width  = Math.floor( canvas.clientWidth  * pixelRatio );
    const height = Math.floor( canvas.clientHeight * pixelRatio );
    const needResize = canvas.width !== width || canvas.height !== height;
    if (needResize) {
      renderer.setSize(width, height, false);
    }
    return needResize;
}


function render(time) {
    time *= 0.001;  // converte il tempo in secondi

    if (resizeRendererToDisplaySize(renderer)) {
        const canvas = renderer.domElement;
        camera.aspect = canvas.clientWidth / canvas.clientHeight;
        camera.updateProjectionMatrix();
    }

    cubes.forEach((cube, ndx) => {
        const speed = 1 + ndx * .1;
        const rot = time * speed;
        cube.rotation.x = rot;
        cube.rotation.y = rot;
    });
    
    // cube.rotation.x = time;
    // cube.rotation.y = time;
   
    renderer.render(scene, camera);
   
    requestAnimationFrame(render);
}

requestAnimationFrame(render)