import { Box3, Group, Vector2, Raycaster, AnimationMixer, SkeletonHelper } from 'three'
import { GLTFLoader } from 'three/examples/jsm/loaders/GLTFLoader'
import { TransformControls } from 'three/examples/jsm/controls/TransformControls'
import { GUI } from 'three/examples/jsm/libs/lil-gui.module.min.js'
// import { GUI } from 'three/addons/libs/lil-gui.module.min.js'

import { Capsule } from 'three/addons/math/Capsule.js';


export class Player {


    constructor( scene ) {

        this.scene = scene

        this.players = new Group()
        this.loader  = new GLTFLoader()

        this.scene.add( this.players )

        this.gui = new GUI()
        this.animations = this.gui.addFolder('Animations')
        this.animations.close()
    }


    

    addGLTF( url, debug = false ) {

        return new Promise((resolve, reject) => {

            const onLoad = ( gltf ) => {


                const model = gltf.scene
                const mixer = new AnimationMixer( gltf.scene )


                this.players.add( model )
                
                if ( debug ) {

                    gltf.animations.forEach( item => {
    
                        const animationAction = mixer.clipAction(item)
    
                        const play = {
                            play: () => animationAction.play()
                        }
    
                        const stop = {
                            stop: () => animationAction.stop()
                        }

                        this.animations.add({ animation: item.name }, 'animation' )// .disable()

                        this.animations.add( play, 'play' )
                        this.animations.add( stop, 'stop' )
                    })

                    // model.traverse( object => {

                    //     if ( object.isSkinnedMesh ) {
                    //         const skeletonHelper = new SkeletonHelper( object.skeleton.bones[ 0 ] )
                    //         this.scene.add( skeletonHelper )
                    //     }
                    // })
                }

                resolve({ gltf, mixer })
            }
    
            this.loader.load(
                url,
                gltf => onLoad( gltf ),
                ( xhr ) => console.log( ( xhr.loaded / xhr.total * 100 ) + '% loaded' ),
                ( error ) => reject( error )
            )
        })
    }


    enableDebug( camera, canvas, controls ) {

        this.mouse     = new Vector2()
        this.raycaster = new Raycaster()
        this.gizmo     = new TransformControls( camera, canvas )

        const helepr = this.gizmo.getHelper()
        this.scene.add( helepr )

        canvas.addEventListener(     'mousemove',        ev => this.onMouseMove( ev, canvas ), false )
        canvas.addEventListener(     'click',            ev => this.onMouseClick( camera ), false    )
        this.gizmo.addEventListener( 'dragging-changed', ev => controls.enabled = ! ev.value         )
        this.gizmo.setMode( 'rotate' )
    }


    onMouseMove( ev, canvas ) {

        const rect = canvas.getBoundingClientRect()

        this.mouse.x = ( ( ev.clientX - rect.left ) / ( rect.width - rect.left ) ) * 2 - 1
        this.mouse.y = - ( ( ev.clientY - rect.top ) / ( rect.bottom - rect.top) ) * 2 + 1
    }


    onMouseClick( camera ) {

        this.raycaster.setFromCamera( this.mouse, camera )

        this.players.children.forEach( async item => {
        
            const intersected = this.raycaster.intersectObject( item )

            if ( intersected.length ) {

                this.gizmo.attach( item )
    
            } else {
    
                this.gizmo.detach()
            }        
        })
    }
}