import { Mesh, TubeGeometry, Vector3, Curve, MeshLambertMaterial, TextureLoader, SRGBColorSpace, SplineCurve } from 'three'

import { Item } from './Item'


class CustomSinCurve extends Curve {

    constructor( scale ) {

        super()
        this.scale = scale
    }

    getPoint( t ) {

        const tx = t * 2;
        const ty = 5// Math.sin( 2 * Math.PI * t );
        const tz = 5;
        return new Vector3( tx, ty, tz )// .multiplyScalar( this.scale )
    }
}

export class Tube extends Item {

    constructor( shared ) {

        super( shared )

        // const path = new CustomSinCurve( 10 )
        const tubularSegments = 100;  

        const radius =  1.5;  

        const radialSegments = 30;  

        const closed = false;  
        const planeMaterial = new MeshLambertMaterial({ color: 0x8c8c8c })

        const path = new SplineCurve([
            new Vector3(0,0,0) ,
            new Vector3(200,150,10) 
        ]);
        

        const geometry = new TubeGeometry( path, tubularSegments, radius, radialSegments, closed );

        this.mesh = new Mesh(
            geometry,
            planeMaterial
        )

        this.mesh.position.set(-4.98, 5.04, 0)

        this.meshes.add( this.mesh )
    }


    setTexture( texture ) {

        const loader = new TextureLoader()
        const loaderTexture = loader.load( texture )
        loaderTexture.colorSpace = SRGBColorSpace

        this.mesh.material = new MeshLambertMaterial({
            map: loaderTexture
        })
    }


    get() {
        return this.meshes
    }
}