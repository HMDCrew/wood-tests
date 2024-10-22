import { GridHelper, Clock, IcosahedronGeometry, MeshLambertMaterial, Mesh, Sphere, Vector3, CapsuleGeometry, MeshBasicMaterial, Box3 } from 'three'
// import * as CANNON from 'cannon-es'
// import CannonUtils from 'cannon-utils'
import Stats from 'three/addons/libs/stats.module.js'

import { Capsule } from 'three/addons/math/Capsule.js'
import { Octree } from 'three/addons/math/Octree.js'
import { OctreeHelper } from 'three/addons/helpers/OctreeHelper.js'

import { createCamera } from './components/camera.js'
import { createScene } from './components/scene.js'
import { createControls } from './components/controls.js'
import { postProcessing } from './components/postProcessing.js'
import { createRenderer } from './systems/renderer.js'
import { Resizer } from './systems/Resizer.js'
import { Player } from './components/Player.js'

const maxFPS = 60
const frameDelay = 1000 / maxFPS
let lastFrameTime = 0;

const map = new URL('../gltf/map/lowpoly__fps__tdm__game__map.glb', import.meta.url)
const robo = new URL('../gltf/drone/untitled.glb', import.meta.url)

/*

controller touch => https://codepen.io/HoraceShmorace/pen/BawmVzO
skin => https://jsfiddle.net/q30eybp4/
explosion => https://codepen.io/mjurczyk/pen/rNQRbwx


https://codepen.io/AlainBarrios/pen/vYEezGJ
https://fennec-hub.github.io/ThreeOrbitControlsGizmo/

mesh => https://hofk.de/main/discourse.threejs/2024/UnstretchedCapsuleUVs/UnstretchedCapsuleUVs.html
whater => https://madebyevan.com/webgl-water/
deformation => https://codepen.io/boytchev/full/VwVjOre

helps:
    https://hofk.de/main/discourse.threejs/
    https://hofk.de/main/discourse.threejs/2019/Xindex2019.html
    https://hofk.de/main/discourse.threejs/2019/index2019.html
    https://hofk.de/main/discourse.threejs/2018/Xindex2018.html
*/


export class MyWorld {

    canvas
    renderer
    camera
    scene

    constructor() {


        this.canvas   = document.querySelector( '#c' )
        this.renderer = createRenderer( this.canvas )


        this.stats = new Stats()
		this.stats.domElement.style.position = 'absolute'
		this.stats.domElement.style.top = '0px'
		this.canvas.parentNode.appendChild( this.stats.domElement )


        this.camera    = createCamera()
        this.scene     = createScene()
        this.controls  = createControls( this.camera, this.canvas )
        this.composer  = postProcessing( this.scene, this.camera, this.renderer )
        this.player    = new Player( this.scene )



        const GRAVITY = 30;

        const NUM_SPHERES = 100;
        const SPHERE_RADIUS = 0.2;

        const STEPS_PER_FRAME = 5;

        // const sphereGeometry = new IcosahedronGeometry( SPHERE_RADIUS, 5 );
        // const sphereMaterial = new MeshLambertMaterial( { color: 0xdede8d } );

        // const spheres = [];
        // let sphereIdx = 0;

        // for ( let i = 0; i < NUM_SPHERES; i ++ ) {

        //     const sphere = new Mesh( sphereGeometry, sphereMaterial );
        //     sphere.castShadow = true;
        //     sphere.receiveShadow = true;

        //     this.scene.add( sphere );

        //     spheres.push( {
        //         mesh: sphere,
        //         collider: new Sphere( new Vector3( 0, - 100, 0 ), SPHERE_RADIUS ),
        //         velocity: new Vector3()
        //     } );
        // }



        const worldOctree = new Octree()
        this.playerCollider = new Capsule( new Vector3( 0, 0.35, 0 ), new Vector3( 0, 1, 0 ), 0.35 )

        const geometry = new CapsuleGeometry( 0.1, 0.1, 4, 8 ); 
        const material = new MeshBasicMaterial( {color: 0x00ff00} ); 
        const material2 = new MeshBasicMaterial( {color: 0x0000ff} ); 
        const capsule = new Mesh( geometry, material );
        const capsule2 = new Mesh( geometry, material2 );
        capsule.position.set(0, 0.35, 0)
        this.scene.add( capsule );
        capsule2.position.set(0, 1, 0)
        this.scene.add( capsule2 );


        const playerVelocity = new Vector3()
        const playerDirection = new Vector3()

        let playerOnFloor = false
        let mouseTime = 0

        this.keyStates = {}

        const vector1 = new Vector3()
        const vector2 = new Vector3()
        const vector3 = new Vector3()




        this.clock     = new Clock()
        this.mixer

        this.testing()

        // this.renderer.setAnimationLoop( time => this.render( time ) )
        requestAnimationFrame( time => this.render( time ) )

        new Resizer(this.camera, this.renderer, this.composer )
    }


    testing() {

        const gridHelper = new GridHelper( 40, 40 )
        this.scene.add( gridHelper )


        // this.player.addGLTF( map.href )

        this.player.addGLTF( robo.href, true ).then(
            ({ gltf, mixer }) => {

                const model = gltf.scene
                this.mixer = mixer

                model.position.setX( -1.741 )
                model.position.setY( 1.054 )
                model.position.setZ( 7.112 )
                model.scale.set( 0.3, 0.3, 0.3 )
                //model.rotation.set( 0, -1.5, 0, "XYZ" )

                const box = new Box3().setFromObject(model)
                const boxSize = box.getSize(new Vector3()).length()
                const boxCenter = box.getCenter(new Vector3())

                this.playerCollider.start.copy(boxCenter)
                this.playerCollider.end.copy(boxCenter)
                this.playerCollider.radius = boxSize/1.5

                //this.camera.add(model)

                // document.addEventListener( 'keydown', ev => this.keyStates[ ev.code ] = true )
                // document.addEventListener( 'keyup', ev => this.keyStates[ ev.code ] = false )
    
                document.body.addEventListener( 'mousemove', ( event ) => {
    
                    // if ( document.pointerLockElement === document.body ) {
    
                    //     this.camera.rotation.y -= event.movementX / 500;
                    //     this.camera.rotation.x -= event.movementY / 500;
    
                    // }
    
                } );
                // // document.addEventListener('keydown', e => {

                // //     switch ( e.code ) {
                // //         case "KeyW":
                // //             model.rotation.set( 0, -1.5, 0, "XYZ" )
                // //             break;
                // //         case "KeyA":
                            
                // //             break;
                // //         case "KeyS":
                            
                // //             break;
                // //         case "KeyD":
                // //             model.rotation.set( 3.14, -0.06, 3.14, "XYZ" )
                // //             break;
                    
                // //         default:
                // //             model.position.x += 0.01
                // //             //console.log(model.rotation)
                // //             break;
                // //     }
                // // })
            }
        )
    }


    render( time ) {

        requestAnimationFrame( time => this.render( time ) )

        const elapsed = time - lastFrameTime

        if (elapsed > frameDelay) {

            this.stats.update()

            this.controls.update()

            if (this.mixer) this.mixer.update(this.clock.getDelta())

            this.renderer.render( this.scene, this.camera )
            this.composer.render()

            lastFrameTime = time - (elapsed % frameDelay);
        }
    }
}

new MyWorld()