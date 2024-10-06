import * as THREE from 'three';
import GUI from 'lil-gui';
import {OrbitControls} from 'three/addons/controls/OrbitControls.js';

import AxisGridHelper from './inc/AxisGridHelper'


const gui = new GUI()


const canvas = document.querySelector('#c')
const renderer = new THREE.WebGLRenderer({ antialias: true, canvas })
const camera = new THREE.PerspectiveCamera(40, 2, 0.1, 1000);
const scene = new THREE.Scene();

camera.position.set(0, 50, 0);
camera.up.set(0, 0, 1);
camera.lookAt(0, 0, 0);


// const color = 0xFFFFFF;
// const intensity = 3;
// const light = new THREE.DirectionalLight(color, intensity);
// light.position.set(-1, 2, 4);
// scene.add(light);


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

const color = 0xFFFFFF;
const intensity = 3;
const light = new THREE.PointLight(color, intensity);
scene.add(light);


// un array di oggetti la cui rotazione deve essere aggiornata
const objects = [];
 
// usa solo una sfera per tutto
const radius = 1;
const widthSegments = 6;
const heightSegments = 6;
const sphereGeometry = new THREE.SphereGeometry( radius, widthSegments, heightSegments )


const solarSystem = new THREE.Object3D();
scene.add(solarSystem);
objects.push(solarSystem);


const sunMaterial = new THREE.MeshPhongMaterial({emissive: 0xFFFF00});
const sunMesh = new THREE.Mesh(sphereGeometry, sunMaterial);
sunMesh.scale.set(5, 5, 5);  // rendi grande il sole
// scene.add(sunMesh);
solarSystem.add(sunMesh);
objects.push(sunMesh);


const earthOrbit = new THREE.Object3D();
earthOrbit.position.x = 10;
solarSystem.add(earthOrbit);
objects.push(earthOrbit);

const earthMaterial = new THREE.MeshPhongMaterial({color: 0x2233FF, emissive: 0x112244});
const earthMesh = new THREE.Mesh(sphereGeometry, earthMaterial);
// earthMesh.position.x = 10;
// scene.add(earthMesh);
// sunMesh.add(earthMesh);
// solarSystem.add(earthMesh);
earthOrbit.add(earthMesh);
objects.push(earthMesh);



const moonOrbit = new THREE.Object3D();
moonOrbit.position.x = 2;
earthOrbit.add(moonOrbit);
 
const moonMaterial = new THREE.MeshPhongMaterial({color: 0x888888, emissive: 0x222222});
const moonMesh = new THREE.Mesh(sphereGeometry, moonMaterial);
moonMesh.scale.set(.5, .5, .5);
moonOrbit.add(moonMesh);
objects.push(moonMesh);



function makeAxisGrid(node, label, units) {
    const helper = new AxisGridHelper(THREE, node, units);
    gui.add(helper, 'visible').name(label);
}

makeAxisGrid(solarSystem, 'solarSystem', 25);
makeAxisGrid(sunMesh, 'sunMesh');
makeAxisGrid(earthOrbit, 'earthOrbit');
makeAxisGrid(earthMesh, 'earthMesh');
makeAxisGrid(moonOrbit, 'moonOrbit');
makeAxisGrid(moonMesh, 'moonMesh');



function render(time) {
    time *= 0.001;  // converte il tempo in secondi

    if (resizeRendererToDisplaySize(renderer)) {
        const canvas = renderer.domElement;
        camera.aspect = canvas.clientWidth / canvas.clientHeight;
        camera.updateProjectionMatrix();
    }


    objects.forEach((obj) => {
        obj.rotation.y = time;
    })
   

    renderer.render(scene, camera)
    requestAnimationFrame(render)
}

requestAnimationFrame(render)