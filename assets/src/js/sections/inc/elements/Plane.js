import * as THREE from 'three'
import { RoundedBoxGeometry } from 'three/addons/geometries/RoundedBoxGeometry.js'


export class Plane {


    mesh
    raycaster
    mouse


    constructor({ width, height, depth, texture, onClick, camera }) {

        const geometry = new RoundedBoxGeometry( width, height, depth, 10, .1 );

        const loader = new THREE.TextureLoader();
        const loader_texture = loader.load( texture );
        loader_texture.colorSpace = THREE.SRGBColorSpace;


        const material = new THREE.MeshBasicMaterial({
            map: loader_texture,
        })

        this.onClick = onClick
        this.camera = camera
        this.canvas = document.querySelector('#c')
        this.mesh = new THREE.Mesh(geometry, material)


        this.raycaster = new THREE.Raycaster()
        this.mouse = new THREE.Vector2()
        window.addEventListener( 'mousemove', ev => this.onMouseMove( ev ), false )
        window.addEventListener( 'click', ev => this.onMouseClick( ev ), false );


        return this.mesh
    }


    onMouseMove( ev ) {
        this.mouse.x = ( ev.clientX / this.canvas.width ) * 2 - 1
        this.mouse.y = - ( ev.clientY / this.canvas.height ) * 2 + 1
    }


    onMouseClick( event ) {

        this.raycaster.setFromCamera( this.mouse, this.camera )
        const isIntersected = this.raycaster.intersectObject( this.mesh, false )

        isIntersected.length && this.onClick( this.mesh )
    }
}