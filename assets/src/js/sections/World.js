import {
    WebGLRenderer,
    PerspectiveCamera,
    Scene,
    GridHelper,
    AmbientLight,
    BoxGeometry,
    Mesh,
    SphereGeometry,
    MeshStandardMaterial,
    TextureLoader,
    SRGBColorSpace,
    MeshPhongMaterial,
    Vector3,
} from 'three'
import { OrbitControls } from 'three/addons/controls/OrbitControls.js'


import { Plane } from "./inc/elements/Plane"
import { Tube } from './inc/elements/Tube'
import wood from '../../images/wood.jpeg'

export class World {

    shared

    canvas
    renderer
    camera
    scene

    constructor() {
        
        this.canvas = document.querySelector( '#c' )

        this.renderer = new WebGLRenderer({ antialias: true, canvas: this.canvas, /* logarithmicDepthBuffer: true */ })
        this.camera   = new PerspectiveCamera( 45, 2, 0.1, 1000 )
        this.controls = new OrbitControls( this.camera, this.canvas )
        this.scene    = new Scene()

        this.renderer.setClearColor( 0xe3e3e3, 1 )

        this.camera.position.set(0.19, 12.21, 36.58)
        this.camera.lookAt(0, 0, 0)
        
        this.controls.target.set(0.37, 0.23, 9.29)
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

        requestAnimationFrame( time => this.render( time ) )
    }


    initialItems() {

        const gridHelper = new GridHelper( 40, 40 )
        this.scene.add( gridHelper )
    }


    testing() {

        const color = 0xFFFFFF;
        const intensity = 2;
        const light = new AmbientLight(color, intensity);
        light.position.copy(this.camera.position)
        this.scene.add(light);

        const plane = new Plane(this.shared, {
            width: 10,
            height: 10,
            depth: 4,
            cylinderRadius: 3
        })

        plane.setTexture( wood )
        plane.onClick( mesh => console.log(mesh) )

        // const tube = new Tube( this.shared )
        // tube.setTexture( wood )
        // tube.onClick( mesh => console.log(mesh) )


        // this.scene.add(tube.get())
        this.scene.add(plane.get())
    }


    resize() {
        
        const pixelRatio = window.devicePixelRatio
        const width  = Math.floor( this.canvas.clientWidth  * pixelRatio )
        const height = Math.floor( this.canvas.clientHeight * pixelRatio )
    
        const needResize = this.canvas.width !== width || this.canvas.height !== height
        needResize && this.renderer.setSize(width, height, false)
    
        return needResize
    }


    render( time ) {

        requestAnimationFrame( time => this.render( time ) )

        if ( this.resize() ) {
            this.camera.aspect = this.canvas.clientWidth / this.canvas.clientHeight
            this.camera.updateProjectionMatrix()
        }

        this.renderer.render( this.scene, this.camera )
    }
}

new World()