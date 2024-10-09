import { WebGLRenderer, PerspectiveCamera, Scene, GridHelper, AmbientLight, TubeGeometry, Mesh, MeshBasicMaterial, Vector3, Curve } from 'three'
import { OrbitControls } from 'three/addons/controls/OrbitControls.js'

import { Plane } from "./inc/elements/Plane"
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
        })

        plane.setTexture( wood )
        plane.onClick( mesh => console.log(mesh) )

        this.scene.add(plane.get())









        class CustomSinCurve extends Curve {

            constructor( scale ) {

                super();
                this.scale = scale;

            }
            getPoint( t ) {

                const tx = t;
                const ty = 0// Math.sin( 2 * Math.PI * t );
                const tz = 0;
                return new Vector3( tx, ty, tz ).multiplyScalar( this.scale );

            }

        }

        const path = new CustomSinCurve( 10 );
        const tubularSegments = 100;  

        const radius =  1.5;  

        const radialSegments = 30;  

        const closed = false;  
        const geometry = new TubeGeometry( path, tubularSegments, radius, radialSegments, closed );

        const tube = new Mesh(
            geometry,
            new MeshBasicMaterial({
                color: 0x00FF00
            })
        )

        this.scene.add(tube)
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