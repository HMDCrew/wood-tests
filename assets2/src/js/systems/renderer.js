import { WebGLRenderer, VSMShadowMap, ACESFilmicToneMapping } from 'three'

const createRenderer = ( canvas ) => {

	// new WebGLRenderer({ antialias: true, canvas: this.canvas, /* logarithmicDepthBuffer: true */ })
	const renderer = new WebGLRenderer({ antialias: true, canvas: canvas, alpha: true  })

	renderer.setPixelRatio( window.devicePixelRatio )
	renderer.setSize( window.innerWidth, window.innerHeight )
	
	// renderer.setClearColor( 0xe3e3e3, 1 )
	// renderer.physicallyCorrectLights = true
	
	renderer.autoClear = false;
	renderer.shadowMap.enabled = true
	renderer.shadowMap.type = VSMShadowMap
	renderer.toneMapping = ACESFilmicToneMapping

	return renderer
}

export { createRenderer }
