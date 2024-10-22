import { Vector2, PMREMGenerator, WebGLRenderTarget, LinearFilter, RGBAFormat } from 'three'

import { EffectComposer } from 'three/addons/postprocessing/EffectComposer.js'
import { RenderPass } from 'three/addons/postprocessing/RenderPass.js'
import { ShaderPass } from 'three/addons/postprocessing/ShaderPass.js'
import { RoomEnvironment } from 'three/addons/environments/RoomEnvironment.js'
import { UnrealBloomPass } from 'three/addons/postprocessing/UnrealBloomPass.js'
import { SMAAPass } from 'three/addons/postprocessing/SMAAPass.js'
import GUI from 'three/examples/jsm/libs/lil-gui.module.min.js'

const GammaCorrectionShader = {
    uniforms: {
        'tDiffuse': { value: null },
        'gammaLow': { value: 2.2 },   // Gamma per colori scuri
        'gammaMid': { value: 1.8 },   // Gamma per colori medi
        'gammaHigh': { value: 1.0 },   // Gamma per colori chiari
        'thresholdLow': { value: 0.3 }, // Soglia bassa
        'thresholdHigh': { value: 0.7 } // Soglia alta
    },
    vertexShader: /* glsl */`
        varying vec2 vUv;
        void main() {
            vUv = uv;
            gl_Position = projectionMatrix * modelViewMatrix * vec4( position, 1.0 );
        }
    `,
    fragmentShader: /* glsl */`
        uniform sampler2D tDiffuse;
        uniform float gammaLow;    // Gamma per colori scuri
        uniform float gammaMid;    // Gamma per colori medi
        uniform float gammaHigh;   // Gamma per colori chiari
        uniform float thresholdLow; // Soglia bassa
        uniform float thresholdHigh; // Soglia alta
        varying vec2 vUv;

        void main() {
            vec4 tex = texture2D( tDiffuse, vUv );

            // Calcolo della luminosità (media pesata)
            float luminance = 0.2126 * tex.r + 0.7152 * tex.g + 0.0722 * tex.b;

            // Applicare la correzione gamma in base ai livelli
            if (luminance < thresholdLow) {
                tex.rgb = pow(tex.rgb, vec3(1.0 / gammaLow)); // Colori scuri
            } else if (luminance >= thresholdLow && luminance < thresholdHigh) {
                tex.rgb = pow(tex.rgb, vec3(1.0 / gammaMid)); // Colori medi
            } else {
                tex.rgb = pow(tex.rgb, vec3(1.0 / gammaHigh)); // Colori chiari
            }

            gl_FragColor = tex;
        }
    `
}

const postProcessing = ( scene, camera, renderer ) => {

    const pixelRatio = renderer.getPixelRatio() || 1

    const pmremGenerator = new PMREMGenerator(renderer)
    scene.environment = pmremGenerator.fromScene(new RoomEnvironment(), 0.04).texture

    const renderTarget = new WebGLRenderTarget(window.innerWidth * pixelRatio, window.innerHeight * pixelRatio, {
        minFilter: LinearFilter,
        magFilter: LinearFilter,
        format: RGBAFormat,
    });
    const composer  = new EffectComposer( renderer, renderTarget )


    // RenderPass
    const renderPass = new RenderPass( scene, camera )
    composer.addPass( renderPass )

    // UnrealBloomPass
    const bloomPass = new UnrealBloomPass( new Vector2( window.innerWidth, window.innerHeight ), 0.15, 0, 0.47 )
    composer.addPass( bloomPass )

    // const gui = new GUI()
    // const bloomSettings = {
    //     strength: 0.18,
    //     radius: 0,
    //     threshold: 0
    // }
    // gui.add(bloomSettings, 'strength', 0, 2).step(0.01).onChange(value => {
    //     bloomPass.strength = value
    // })
    // gui.add(bloomSettings, 'radius', 0, 5).step(0.01).onChange(value => {
    //     bloomPass.radius = value
    // })
    // gui.add(bloomSettings, 'threshold', 0, 1).step(0.001).onChange(value => {
    //     bloomPass.threshold = value
    // })


    const grainShader = {
        uniforms: {
            'tDiffuse': { value: null },
            'grainIntensity': { value: 0.025 } // Imposta l'intensità del grano come desideri
        },
        vertexShader: /* glsl */ `
            varying vec2 vUv;
    
            void main() {
                vUv = uv;  
                gl_Position = projectionMatrix * modelViewMatrix * vec4(position, 1.0);
            }
        `,
        fragmentShader: /* glsl */ `
            uniform sampler2D tDiffuse;
            uniform float grainIntensity;
            varying vec2 vUv;
    
            void main() {
                vec4 color = texture2D(tDiffuse, vUv);
                float noise = (fract(sin(dot(vUv.xy ,vec2(12.9898, 78.233))) * 43758.5453) - 0.5) * grainIntensity;
                color.rgb += noise; 
                gl_FragColor = color;
            }
        `,
    }

    const grainPass = new ShaderPass( grainShader )
    composer.addPass( grainPass )


    // const gui = new GUI()
    // const grainSettings = {
    //     grainIntensity: 0.02,
    // }
    // gui.add(grainSettings, 'grainIntensity', 0, 2).step(0.01).onChange(value => {
    //     grainPass.uniforms.grainIntensity.value = value
    // })

    
    // const gammaPass = new ShaderPass( GammaCorrectionShader )
    // const gui = new GUI();
    // const shaderSettings = {
    //     gammaLow: 2.2,
    //     gammaMid: 1.8,
    //     gammaHigh: 1.0,
    //     thresholdLow: 0.3,
    //     thresholdHigh: 0.7
    // }

    // // Aggiunta dei controlli alla GUI
    // gui.add(shaderSettings, 'gammaLow', 1, 5).onChange(value => {
    //     gammaPass.uniforms['gammaLow'].value = value;
    // });
    // gui.add(shaderSettings, 'gammaMid', 1, 5).onChange(value => {
    //     gammaPass.uniforms['gammaMid'].value = value;
    // });
    // gui.add(shaderSettings, 'gammaHigh', 1, 5).onChange(value => {
    //     gammaPass.uniforms['gammaHigh'].value = value;
    // });
    // gui.add(shaderSettings, 'thresholdLow', 0, 1).onChange(value => {
    //     gammaPass.uniforms['thresholdLow'].value = value;
    // });
    // gui.add(shaderSettings, 'thresholdHigh', 0, 1).onChange(value => {
    //     gammaPass.uniforms['thresholdHigh'].value = value;
    // });

    // composer.addPass( gammaPass )

    // FXAAPass
    // const fxaaPass = new ShaderPass( FXAAShader )

    // fxaaPass.material.uniforms[ 'resolution' ].value.x = 1 / ( window.innerWidth * pixelRatio )
    // fxaaPass.material.uniforms[ 'resolution' ].value.y = 1 / ( window.innerHeight * pixelRatio )

    // composer.addPass( fxaaPass )

    const smaaPass = new SMAAPass( window.innerWidth * pixelRatio, window.innerHeight * pixelRatio );
	composer.addPass( smaaPass );


    return composer
}

export { postProcessing }
