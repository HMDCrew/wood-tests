import { PerspectiveCamera } from 'three'

const createCamera = () => {

	const camera = new PerspectiveCamera( 45, 2, 0.1, 1000 )
	// new PerspectiveCamera(
	// 	35, // fov = Field Of View
	// 	1, // aspect ratio (dummy value)
	// 	0.1, // near clipping plane
	// 	100, // far clipping plane
	// )

	camera.position.set(0.212, 2.547, 7.044)
	camera.lookAt(0, 0, 0)
	camera.aspect = window.innerWidth / window.innerHeight
	camera.updateProjectionMatrix()

	return camera
}

export { createCamera }
