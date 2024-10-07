import { Group, Raycaster, Vector2, BoxHelper } from 'three'
import { TransformControls } from 'three/addons/controls/TransformControls.js'


export class Item {

    meshes
    clickEmite

    constructor({ canvas, renderer, camera, scene, controls }) {

        this.canvas   = canvas
        this.renderer = renderer
        this.camera   = camera
        this.scene    = scene
        this.controls = controls

        this.meshes    = new Group()
        this.raycaster = new Raycaster()
        this.mouse     = new Vector2()
        this.box       = new BoxHelper( this.meshes, 0x00ff00 )
        this.gizmo     = new TransformControls( this.camera, this.canvas )

        // this.gizmo.setMode('scale')
        // this.gizmo.setMode('rotate')
        // this.gizmo.setMode('translate')

        const helepr = this.gizmo.getHelper()
        this.scene.add( helepr )

        this.canvas.addEventListener( 'mousemove',        ev => this.onMouseMove( ev ), false      )
        this.canvas.addEventListener( 'click',            ev => this.onMouseClick( ev ), false     )
        this.gizmo.addEventListener ( 'dragging-changed', ev => this.controls.enabled = ! ev.value )
    }


    onMouseMove( ev ) {

        this.box.update()

        const rect = this.canvas.getBoundingClientRect()

        this.mouse.x = ( ( ev.clientX - rect.left ) / ( rect.width - rect.left ) ) * 2 - 1
        this.mouse.y = - ( ( ev.clientY - rect.top ) / ( rect.bottom - rect.top) ) * 2 + 1
    }


    onMouseClick( ev ) {

        this.raycaster.setFromCamera( this.mouse, this.camera )

        const intersected = this.raycaster.intersectObject( this.meshes )

        if ( intersected.length ) {

            this.gizmo.attach( this.meshes )
            this.scene.add( this.box )

            this.clickEmite( this.meshes )

        } else {

            this.scene.remove( this.box )
            this.gizmo.detach()
        }
    }


    onClick( listener = (itemMesh) => {} ) {
        this.clickEmite = listener
    }
}