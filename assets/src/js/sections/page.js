import * as THREE from 'three'
import { OrbitControls } from 'three/addons/controls/OrbitControls.js'
import { Plane } from './inc/elements/Plane'
import wood from '../../images/wood.jpeg'

// import GUI from 'lil-gui';

// import { ColorGUIHelper } from './inc/ColorGUIHelper';
// import chacker from '../../images/checker.png'

const canvas = document.querySelector('#c')
const renderer = new THREE.WebGLRenderer({ antialias: true, canvas, logarithmicDepthBuffer: true })
const camera = new THREE.PerspectiveCamera(45, 2, 0.1, 1000);
const scene = new THREE.Scene();

camera.position.set(0.19, 12.21, 36.58)
camera.lookAt(0, 0, 0)

const controls = new OrbitControls(camera, canvas);
controls.target.set(0.37, 0.23, 9.29);
controls.update();


const resizeRendererToDisplaySize = (renderer) => {

    const canvas = renderer.domElement;
    const pixelRatio = window.devicePixelRatio;
    const width  = Math.floor( canvas.clientWidth  * pixelRatio );
    const height = Math.floor( canvas.clientHeight * pixelRatio );

    const needResize = canvas.width !== width || canvas.height !== height;
    needResize && renderer.setSize(width, height, false)

    return needResize;
}


const size = 40;
const divisions = 40;

const gridHelper = new THREE.GridHelper( size, divisions );
scene.add( gridHelper );



// const geometry = new THREE.BoxGeometry( 10, 10, 4 )

// const m1 = new THREE.MeshBasicMaterial({color: 0xFF0000})
//console.log(wood)
const plane = new Plane({
    width: 10,
    height: 10,
    depth: 4,
    texture: wood,
    camera,
    onClick: ( mesh ) => console.log(mesh)
})

// //const mesh = new THREE.Mesh(geometry, m1);
scene.add(plane)



const render = (time) => {

    
    time *= 0.001;  // converte il tempo in secondi
    
    requestAnimationFrame(render)

    
    if ( resizeRendererToDisplaySize(renderer) ) {
        const canvas = renderer.domElement;
        camera.aspect = canvas.clientWidth / canvas.clientHeight;
        camera.updateProjectionMatrix();
    }

    renderer.render(scene, camera)
}

requestAnimationFrame(render)