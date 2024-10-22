const setSize = ( camera, renderer, composer ) => {

	camera.aspect = window.innerWidth / window.innerHeight
	camera.updateProjectionMatrix()

	renderer.setSize( window.innerWidth, window.innerHeight )

	if( composer ) composer.setSize( window.innerWidth, window.innerHeight )
}

class Resizer {

	constructor(camera, renderer, composer = false) {

		// set initial size
		setSize(camera, renderer, composer)

		window.addEventListener('resize', () => {

			// set the size again if a resize occurs
			setSize(camera, renderer, composer)
			// perform any custom actions

			this.onResize()
		})
	}

	onResize() { }
}

export { Resizer }
