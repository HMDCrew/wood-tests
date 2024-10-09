import { TextureLoader, Mesh, BoxGeometry, MeshBasicMaterial, MeshLambertMaterial, SRGBColorSpace } from 'three'
//import { CSG } from 'three-csg-ts'

import { Item } from './Item'

export class Plane extends Item {

    constructor( shared, { width, height, depth } ) {

        super( shared )

        this.mesh = new Mesh(
            new BoxGeometry( width, height, depth ),
            new MeshLambertMaterial({
                color: 0x8c8c8c
            })
        )

        this.setTexture( texture )

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