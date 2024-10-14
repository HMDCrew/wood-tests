import {
    WebGLRenderer,
    PerspectiveCamera,
    Scene,
    GridHelper,
    AmbientLight,
    PointLight,
    Vector2,
    ReinhardToneMapping,
    DataTexture,
    RepeatWrapping,
    PMREMGenerator,
    Box3,
    IcosahedronGeometry,
    ShaderMaterial,
    Mesh,
    PlaneGeometry,
    PointLightHelper,
    DirectionalLight,
    DirectionalLightHelper,

    NoToneMapping, 
    LinearToneMapping, 
    CineonToneMapping, 
    ACESFilmicToneMapping,
    AgXToneMapping,
    NeutralToneMapping,
    CustomToneMapping,

    PCFSoftShadowMap

} from 'three'

import { GUI } from 'three/addons/libs/lil-gui.module.min.js';

import { EffectComposer } from 'three/addons/postprocessing/EffectComposer.js';
import { RenderPass } from 'three/addons/postprocessing/RenderPass.js';
import { OutputPass } from 'three/addons/postprocessing/OutputPass.js';
import { ShaderPass } from 'three/examples/jsm/postprocessing/ShaderPass.js';
import { GTAOPass } from 'three/addons/postprocessing/GTAOPass.js';
import { RoomEnvironment } from 'three/addons/environments/RoomEnvironment.js';

import { FilmPass } from 'three/addons/postprocessing/FilmPass.js';
import { SSRPass } from 'three/addons/postprocessing/SSRPass.js';
import { SSAOPass } from 'three/addons/postprocessing/SSAOPass.js';
import { FXAAShader } from 'three/addons/shaders/FXAAShader.js';
import { ReflectorForSSRPass } from 'three/addons/objects/ReflectorForSSRPass.js';

import { GLTFLoader } from 'three/addons/loaders/GLTFLoader.js';
import { OrbitControls } from 'three/addons/controls/OrbitControls.js'

// import vertexShader from '../../shaders/vertex.glsl'
// import fragmentShader from '../../shaders/fragment.glsl'

// import wireframeVert from '../../glsl/shadeless.vert'
// import wireframeFrag from '../../glsl/shadeless.frag'

import wood from '../../images/wood.jpeg'
import { uniform } from 'three/webgpu';

const map = new URL('../../gltf/map/lowpoly__fps__tdm__game__map.glb', import.meta.url)


export class World {

    shared

    canvas
    renderer
    camera
    scene
    composer

    constructor() {
        
        this.canvas = document.querySelector( '#c' )

        this.renderer = new WebGLRenderer({ antialias: true, canvas: this.canvas, /* logarithmicDepthBuffer: true */ })
        // this.renderer.toneMapping = ReinhardToneMapping;
        // this.renderer.setSize( this.canvas.width, this.canvas.height );
        this.renderer.setPixelRatio( window.devicePixelRatio );

        /// this.renderer.setClearColor( 0xe3e3e3, 1 )
        this.renderer.shadowMap.enabled = true;
        // this.renderer.shadowMap.type = PCFSoftShadowMap;

        // NoToneMapping, 
        // LinearToneMapping, 
        // CineonToneMapping, 
        // ACESFilmicToneMapping,
        // AgXToneMapping,
        // NeutralToneMapping,
        // CustomToneMapping,
        // this.renderer.toneMapping = CustomToneMapping

        this.camera   = new PerspectiveCamera( 45, 2, 0.1, 1000 )
        this.controls = new OrbitControls( this.camera, this.canvas )
        this.scene    = new Scene()
        this.composer = new EffectComposer( this.renderer )

        
        const renderPass = new RenderPass( this.scene, this.camera );
        //renderPass.clearAlpha = 0;
        this.composer.addPass( renderPass );

/*
        
*/

        

















        // const gui = new GUI();

        this.camera.position.set(0.130, 2.431, 10.626)
        this.camera.lookAt(0, 0, 0)
        
        this.controls.target.set(0.246, 1.607, 8.684)
        this.controls.update()

        this.shared = {
            canvas:   this.canvas,
            renderer: this.renderer,
            camera:   this.camera,
            scene:    this.scene,
            controls: this.controls,
        }

        this.initialItems()
        this.testing()

        // requestAnimationFrame( time => this.render( time ) )
        this.renderer.setAnimationLoop( time => this.render( time ) )
    }




    initialItems() {

        const gridHelper = new GridHelper( 40, 40 )
        this.scene.add( gridHelper )



        // const ssaoPass = new SSAOPass( this.scene, this.camera, this.canvas.width, this.canvas.height );
        // this.composer.addPass( ssaoPass );

        window.onload = (e) => { 
          
            const pmremGenerator = new PMREMGenerator(this.renderer)
            this.scene.environment = pmremGenerator.fromScene(new RoomEnvironment(), 0.04).texture;

            this.gtaoPass = new GTAOPass(this.scene, this.camera, this.canvas.width, this.canvas.height);
            this.gtaoPass.output = GTAOPass.OUTPUT.Denoise;
            this.composer.addPass(this.gtaoPass);


            this.gtaoPass.updateGtaoMaterial({
                radius: 0.25,
                distanceExponent: 1.,
                thickness: 1.,
                scale: 1.,
                samples: 16,
                distanceFallOff: 1.,
                screenSpaceRadius: true,
            });

            this.gtaoPass.updatePdMaterial({
                lumaPhi: 10.,
                depthPhi: .01,
                normalPhi: 20,
                radius: 0,
                radiusExponent: 4,
                rings: 1,
                samples: 32,
            });

            this.gtaoPass.blendIntensity = 1
            this.gtaoPass.screenSpaceRadius = true

            this.gtaoPass.output = GTAOPass.OUTPUT.Default;




            console.log(this.canvas.width, this.canvas.height)

            // const ssaoPass = new SSAOPass( this.scene, this.camera, this.canvas.width, this.canvas.height );
            // this.composer.addPass( ssaoPass );

            this.fxaaPass = new ShaderPass( FXAAShader );
            const pixelRatio = this.renderer.getPixelRatio();
    
            this.fxaaPass.material.uniforms[ 'resolution' ].value.x = 1 / ( this.canvas.width * pixelRatio );
            this.fxaaPass.material.uniforms[ 'resolution' ].value.y = 1 / ( this.canvas.height * pixelRatio );
    
    
            const outputPass = new OutputPass();
            this.composer.addPass( outputPass );
    
            this.composer.addPass( this.fxaaPass );
        }

        // // Init gui
        // const gui = new GUI();

        // gui.add( ssaoPass, 'output', {
        //     'Default': SSAOPass.OUTPUT.Default,
        //     'SSAO Only': SSAOPass.OUTPUT.SSAO,
        //     'SSAO Only + Blur': SSAOPass.OUTPUT.Blur,
        //     'Depth': SSAOPass.OUTPUT.Depth,
        //     'Normal': SSAOPass.OUTPUT.Normal
        // } ).onChange( function ( value ) {

        //     ssaoPass.output = value;

        // } );
        // gui.add( ssaoPass, 'kernelRadius' ).min( 0 ).max( 32 );
        // gui.add( ssaoPass, 'minDistance' ).min( 0.001 ).max( 0.02 );
        // gui.add( ssaoPass, 'maxDistance' ).min( 0.01 ).max( 0.3 );
        // gui.add( ssaoPass, 'enabled' );



    }


    testing() {

        const color = 0xFFFFFF;
        const intensity = 2;
        // const light = new AmbientLight(color, intensity);
        // light.position.copy(this.camera.position)
        // this.scene.add(light);

        // const light = new DirectionalLight( 0xFFFFFF );
        // light.castShadow = true
        // this.scene.add( light );

        // const helper = new DirectionalLightHelper( light, 5 );
        // this.scene.add( helper );



        // const gui = new GUI()
        // const lightFolder = gui.addFolder('THREE.Light')

        // lightFolder.add(light, 'intensity', 0, Math.PI * 2, 0.01)

        // const directionalLightFolder = gui.addFolder('THREE.DirectionalLight')
        // directionalLightFolder.add(light.position, 'x', -20, 20, 0.01)
        // directionalLightFolder.add(light.position, 'y', -20, 20, 0.01)
        // directionalLightFolder.add(light.position, 'z', -20, 20, 0.01)
        // directionalLightFolder.open()

        // const light0 = new PointLight( 0xefffef, 500 );
        // light0.position.set(-10, -10, 10)
        // this.scene.add( new PointLightHelper( light0, 4 ) )
		// this.scene.add( light0 );

		// const light2 = new PointLight( 0xffefef, 500 );
        // light2.position.set(-10, 10, 10)
        // this.scene.add( new PointLightHelper( light2, 4 ) )
		// this.scene.add( light2 );

		// const light3 = new PointLight( 0xefefff, 500 );
        // light3.position.set(10, -10, 10)
        // this.scene.add( new PointLightHelper( light3, 4 ) )
		// this.scene.add( light3 );



        const loader = new GLTFLoader()

        console.log(map)

        loader.load(
            map.href,
            ( gltf ) => {

                this.scene.add( gltf.scene );

                this.gltf = gltf.scene

                // gltf.animations; // Array<THREE.AnimationClip>
                // gltf.scene; // THREE.Group
                // gltf.scenes; // Array<THREE.Group>
                // gltf.cameras; // Array<THREE.Camera>
                // gltf.asset; // Object

                gltf.scene.traverse((child) => {

                    if (child.isMesh) {

                        child.castShadow = true;

                        child.receiveShadow = true;

                    }

                });


                const box = new Box3().setFromObject(this.scene);
                this.gtaoPass.setSceneClipBox(box);

            },
            ( xhr ) => {

                console.log( ( xhr.loaded / xhr.total * 100 ) + '% loaded' );
            },
            ( error ) => {

                console.log( 'An error happened' );

            }
        );






        // const geometry = new IcosahedronGeometry(1, 5)
        // const material = new ShaderMaterial({
        //     vertexShader: vertexShader,
        //     fragmentShader: fragmentShader
        // })
        // const mesh = new Mesh( geometry, material )
        // this.scene.add(mesh)

    }


    resize() {
        
        const pixelRatio = window.devicePixelRatio
        const width  = Math.floor( this.canvas.clientWidth  * pixelRatio )
        const height = Math.floor( this.canvas.clientHeight * pixelRatio )

        const needResize = this.canvas.width !== width || this.canvas.height !== height
        if( needResize ) {
            this.composer.setSize( width, height );
            this.renderer.setSize(width, height, false)
        }

    
        return needResize
    }


    render( time ) {

        // requestAnimationFrame( time => this.render( time ) )

        // console.log( this.camera.position, this.controls.target )
        
        if ( this.resize() ) {
            this.camera.aspect = this.canvas.clientWidth / this.canvas.clientHeight
            this.camera.updateProjectionMatrix()
        }

        // this.renderer.render( this.scene, this.camera )
        this.composer.render()
    }
}

new World()