import { TextureLoader, Mesh, BoxGeometry, MeshLambertMaterial, SRGBColorSpace, CylinderGeometry, Vector3, Matrix4 } from 'three'
import { CSG } from 'three-csg-ts'

import { Item } from './Item'


export class Plane extends Item {


    constructor( shared, { width, height, depth, cylinderRadius } ) {

        super( shared )

        cylinderRadius = 1
        
        // Crea la geometria del cubo
        const planeGeometry = new BoxGeometry(width, height, depth);
        const planeMaterial = new MeshLambertMaterial({ color: 0x8c8c8c });
        const planeMesh = new Mesh(planeGeometry, planeMaterial);

        // Crea la geometria del cilindro con il raggio specificato
        const cylinderGeometry = new CylinderGeometry(cylinderRadius, cylinderRadius, depth, 32);
        const cylinderMaterial = new MeshLambertMaterial({ color: 0xaaaaaa });
        const cylinderMesh = new Mesh(cylinderGeometry, cylinderMaterial);

        // Posiziona il cilindro usando una trasformazione locale rispetto al cubo
        const cylinderMatrix = new Matrix4();
        cylinderMatrix.makeTranslation((width / 2)- cylinderRadius, (height / 2)- cylinderRadius, 0); // Traslazione locale lungo l'asse X
        cylinderMatrix.multiply(new Matrix4().makeRotationX(Math.PI / 2)); // Rotazione locale attorno all'asse Z

        // Applica la matrice di trasformazione al cilindro
        cylinderMesh.applyMatrix4(cylinderMatrix);



        // Unione tramite CSG
        let csgObject = CSG.fromMesh(planeMesh);
        const csgCylinder = CSG.fromMesh(cylinderMesh)// .subtract(csgObject);
        csgObject = csgObject.subtract(csgCylinder);



        // Converti l'oggetto CSG in un Mesh finale
        this.mesh = CSG.toMesh(csgObject, planeMesh.matrix, planeMaterial);

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