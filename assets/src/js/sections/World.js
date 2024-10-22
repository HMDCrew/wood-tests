import {
    WebGLRenderer,
    PerspectiveCamera,
    Scene,
    GridHelper,
    Vector2,
    Box3,
    PMREMGenerator,
    Raycaster,
    Clock,
    Group,
    AnimationMixer,
    SkeletonHelper,
    
} from 'three'

import { TransformControls } from 'three/addons/controls/TransformControls.js'

import { GUI } from 'three/addons/libs/lil-gui.module.min.js'

// PostProcessing
import { EffectComposer } from 'three/addons/postprocessing/EffectComposer.js'
import { RenderPass } from 'three/addons/postprocessing/RenderPass.js'
import { OutputPass } from 'three/addons/postprocessing/OutputPass.js'
import { ShaderPass } from 'three/examples/jsm/postprocessing/ShaderPass.js'
import { GTAOPass } from 'three/addons/postprocessing/GTAOPass.js'
import { RoomEnvironment } from 'three/addons/environments/RoomEnvironment.js'
import { UnrealBloomPass } from 'three/addons/postprocessing/UnrealBloomPass.js'
import { FXAAShader } from 'three/addons/shaders/FXAAShader.js'

import { GLTFLoader } from 'three/addons/loaders/GLTFLoader.js'
import { OrbitControls } from 'three/addons/controls/OrbitControls.js'

import { RigidBody, World } from '@dimforge/rapier3d'

const maxFPS = 30
const frameDelay = 1000 / maxFPS
let lastFrameTime = 0;

const map = new URL('../../gltf/map/lowpoly__fps__tdm__game__map.glb', import.meta.url)
const robo = new URL('../../gltf/drone/untitled.glb', import.meta.url)

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

    shared
    canvas
    renderer
    camera
    scene
    composer

    groundBody

    constructor() {
        
        this.canvas = document.querySelector( '#c' )

        this.renderer = new WebGLRenderer({ antialias: true, canvas: this.canvas, /* logarithmicDepthBuffer: true */ })
        this.renderer.setPixelRatio( window.devicePixelRatio )
        this.renderer.setSize( window.innerWidth, window.innerHeight )

        /// this.renderer.setClearColor( 0xe3e3e3, 1 )

        this.camera    = new PerspectiveCamera( 45, 2, 0.1, 1000 )
        this.controls  = new OrbitControls( this.camera, this.canvas )
        this.scene     = new Scene()
        this.clock     = new Clock()
        this.composer  = new EffectComposer( this.renderer )
        this.loader    = new GLTFLoader()
        this.meshes    = new Group()
        this.mouse     = new Vector2()
        this.raycaster = new Raycaster()

        this.scene.add( this.meshes )

        this.gizmo     = new TransformControls( this.camera, this.canvas )

        const helepr = this.gizmo.getHelper()
        this.scene.add( helepr )

        this.canvas.addEventListener( 'mousemove',        ev => this.onMouseMove( ev ), false      )
        this.canvas.addEventListener( 'click',            ev => this.onMouseClick( ev ), false     )
        this.gizmo.addEventListener ( 'dragging-changed', ev => this.controls.enabled = ! ev.value )


        this.mixer
        this.modelReady = false
        this.animationActions = []
        this.activeAction
        this.lastAction

        this.gui = new GUI()
        this.animations = this.gui.addFolder('Animations')


        this.camera.position.set(0.212, 2.547, 7.044)
        this.camera.lookAt(0, 0, 0)
        this.camera.aspect = window.innerWidth / window.innerHeight
        this.camera.updateProjectionMatrix()
        
        this.controls.enableDamping = true
        this.controls.enablePan = true
        // this.controls.minDistance = 5
        // this.controls.maxDistance = 20
        // this.controls.maxPolarAngle = Math.PI / 2 - 0.05 // prevent camera below ground
        // this.controls.minPolarAngle = Math.PI / 4        // prevent top down view
        this.controls.target.set(-0.105, 2.305, 7.010)
        this.controls.update()


        this.shared = {
            canvas:   this.canvas,
            renderer: this.renderer,
            camera:   this.camera,
            scene:    this.scene,
            controls: this.controls,
        }

        this.postProcessing()
        this.testing()

        // this.renderer.setAnimationLoop( time => this.render( time ) )
        import('@dimforge/rapier3d').then( RAPIER => requestAnimationFrame( time => this.render( time, RAPIER ) ) )
        window.addEventListener( 'resize', ev => this.resize(), false )
    }


    postProcessing() {

        // RenderPass
        const renderPass = new RenderPass( this.scene, this.camera )
        //renderPass.clearAlpha = 0
        this.composer.addPass( renderPass )

        // GTAOPass
        const pmremGenerator = new PMREMGenerator(this.renderer)
        this.scene.environment = pmremGenerator.fromScene(new RoomEnvironment(), 0.04).texture

        this.gtaoPass = new GTAOPass(this.scene, this.camera, window.innerWidth, window.innerHeight)
        this.gtaoPass.output = GTAOPass.OUTPUT.Denoise
        this.composer.addPass(this.gtaoPass)

        this.gtaoPass.updateGtaoMaterial({
            radius: 0.25,
            distanceExponent: 1.,
            thickness: 1.,
            scale: 1.,
            samples: 16,
            distanceFallOff: 1.,
            screenSpaceRadius: true,
        })

        this.gtaoPass.updatePdMaterial({
            lumaPhi: 10.,
            depthPhi: .01,
            normalPhi: 20,
            radius: 0,
            radiusExponent: 4,
            rings: 1,
            samples: 32,
        })

        this.gtaoPass.blendIntensity = 1
        this.gtaoPass.screenSpaceRadius = true

        this.gtaoPass.output = GTAOPass.OUTPUT.Default

        // UnrealBloomPass
        const bloomPass = new UnrealBloomPass( new Vector2( window.innerWidth, window.innerHeight ), 0.1, 0, 0 )
        this.composer.addPass( bloomPass )

        const outputPass = new OutputPass()
        this.composer.addPass( outputPass )

        // FXAAPass
        this.fxaaPass = new ShaderPass( FXAAShader )
        const pixelRatio = this.renderer.getPixelRatio()
    
        this.fxaaPass.material.uniforms[ 'resolution' ].value.x = 1 / ( window.innerWidth * pixelRatio )
        this.fxaaPass.material.uniforms[ 'resolution' ].value.y = 1 / ( window.innerHeight * pixelRatio )

        this.composer.addPass( this.fxaaPass )
    }


    testing() {

        const gridHelper = new GridHelper( 40, 40 )
        this.scene.add( gridHelper )

        this.addGLTF( map.href ).then( gltf => {
            
        })
        
        this.addGLTF( robo.href )
        .then( gltf => {

            const model = gltf.scene

            model.position.setX(-1.741)
            model.position.setY(1.054)
            model.position.setZ(7.112)
            model.scale.set( 0.3, 0.3, 0.3 )


            model.traverse( object => {

                if ( object.isSkinnedMesh ) {
                    const skeletonHelper = new SkeletonHelper( object.skeleton.bones[ 0 ] )
                    this.scene.add( skeletonHelper )
                }
            })


            this.mixer = new AnimationMixer(gltf.scene)

            gltf.animations.forEach( item => {

                const animationAction = this.mixer.clipAction(item)

                const play = {
                    play: () => animationAction.play()
                }

                const stop = {
                    stop: () => animationAction.stop()
                }

                this.animations.add({ animation: item.name }, 'animation' ).disable()
    
                this.animations.add( play, 'play' )
                this.animations.add( stop, 'stop' )
            })

            this.modelReady = true
        })
    }


    onMouseMove( ev ) {

        const rect = this.canvas.getBoundingClientRect()

        this.mouse.x = ( ( ev.clientX - rect.left ) / ( rect.width - rect.left ) ) * 2 - 1
        this.mouse.y = - ( ( ev.clientY - rect.top ) / ( rect.bottom - rect.top) ) * 2 + 1
    }


    onMouseClick( ev ) {

        this.raycaster.setFromCamera( this.mouse, this.camera )

        this.meshes.children.forEach( async item => {
        
            const intersected = this.raycaster.intersectObject( item )

            if ( intersected.length ) {

                this.gizmo.attach( item )
    
            } else {
    
                this.gizmo.detach()
            }        
        })
    }


    addGLTF( url ) {

        return new Promise((resolve, reject) => {

            const onLoad = ( gltf ) => {

                const model = gltf.scene

                this.meshes.add( model )

                if( this.gtaoPass ) {
                    const box = new Box3().setFromObject(this.scene)
                    this.gtaoPass.setSceneClipBox(box)
                }

                resolve( gltf )
            }
    
            this.loader.load(
                url,
                gltf => onLoad( gltf ),
                ( xhr ) => console.log( ( xhr.loaded / xhr.total * 100 ) + '% loaded' ),
                ( error ) => reject( error )
            )
        })
    }


    resize() {

        this.camera.aspect = window.innerWidth / window.innerHeight
        this.camera.updateProjectionMatrix()

        this.renderer.setSize( window.innerWidth, window.innerHeight )
        this.composer.setSize( window.innerWidth, window.innerHeight )
    }


    render( time, RAPIER ) {

        requestAnimationFrame( time => this.render( time, RAPIER ) )

        const elapsed = time - lastFrameTime

        if (elapsed > frameDelay) {

            // console.log( this.camera.position, this.controls.target )
            if (this.modelReady) this.mixer.update(this.clock.getDelta())

            this.renderer.render( this.scene, this.camera )
            this.composer.render()

            lastFrameTime = time - (elapsed % frameDelay);
        }
    }
}

new MyWorld()