import { OrbitControls } from 'three/examples/jsm/controls/OrbitControls'

const createControls = ( camera, canvas ) => {

    const controls  = new OrbitControls( camera, canvas )


    // controls.enableDamping = true
    // controls.enablePan = true
    controls.target.set(-0.105, 2.305, 7.010)
    controls.update()


    return controls
}

export { createControls }
