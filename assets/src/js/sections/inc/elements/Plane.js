import * as THREE from 'three'

import { CSG } from 'three-csg-ts'

// import { createElementFromHTML } from '../../../utils/dom_from_string'

export default class Plane {


    mesh
    raycaster
    mouse


    constructor({ width, height, depth, texture, onClick, camera, radius }) {

        this.onClick = onClick
        this.camera = camera
        this.canvas = document.querySelector('#c')

        const loader = new THREE.TextureLoader();
        const loader_texture = loader.load( texture );
        loader_texture.colorSpace = THREE.SRGBColorSpace;


        this.mesh = new THREE.Mesh(
            new THREE.BoxGeometry( width, height, depth ),
            new THREE.MeshBasicMaterial({
                map: loader_texture
            })
        )


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

    // buildMenu() {
    //     const menu = createElementFromHTML(
    //         `
    //         <div>
    //             <input type="range" id="width" name="width" min="1" max="100" />
    //             <label for="width">Width</label>
    //         </div>
    //         <div>
    //             <input type="range" id="width" name="width" min="1" max="100" />
    //             <label for="width">Width</label>
    //         </div>
    //         <div>
    //             <input type="range" id="width" name="width" min="1" max="100" />
    //             <label for="width">Width</label>
    //         </div>
    //         `
    //     )
    // }
}