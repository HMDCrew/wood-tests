import { TextureLoader, Mesh, BoxGeometry, MeshBasicMaterial, SRGBColorSpace } from 'three'
//import { CSG } from 'three-csg-ts'

import { Item } from './Item'

export default class Plane extends Item {

    constructor( shared, { width, height, depth, texture, click } ) {

        super( shared )


        const loader = new TextureLoader()
        const loader_texture = loader.load( texture )
        loader_texture.colorSpace = SRGBColorSpace


        this.mesh = new Mesh(
            new BoxGeometry( width, height, depth ),
            new MeshBasicMaterial({
                // wireframe: true,
                map: loader_texture
            })
        )

        this.meshes.add( this.mesh )
        this.onClick(click)

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