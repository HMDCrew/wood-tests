import { Scene, Color, Fog, HemisphereLight, DirectionalLight } from 'three'
import GUI from 'three/examples/jsm/libs/lil-gui.module.min.js'

const createScene = () => {
	const scene = new Scene()

	// scene.background = new Color('skyblue')
	scene.background = new Color( 0x88ccee )
	scene.fog = new Fog( 0x8f8f8f, 0, 50 )
	
	const fillLight1 = new HemisphereLight( 0x8dc1de, 0x8f8f8f, 1.5 )
	fillLight1.position.set( 2, 1, 1 )
	scene.add( fillLight1 )


	const directionalLight = new DirectionalLight( 0x000000, 2.5 )
	directionalLight.position.set( - 5, 25, - 1 )
	directionalLight.castShadow = true
	directionalLight.shadow.camera.near = 0.01
	directionalLight.shadow.camera.far = 500
	directionalLight.shadow.camera.right = 30
	directionalLight.shadow.camera.left = - 30
	directionalLight.shadow.camera.top	= 30
	directionalLight.shadow.camera.bottom = - 30
	directionalLight.shadow.mapSize.width = 1024
	directionalLight.shadow.mapSize.height = 1024
	directionalLight.shadow.radius = 4
	directionalLight.shadow.bias = - 0.00006
	scene.add( directionalLight )

	return scene
}

export { createScene }
