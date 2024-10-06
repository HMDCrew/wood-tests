// Attiva/disattiva la visibilità di entrambi gli assi e della griglia
// lil-gui richiede una proprietà che restituisce un valore booleano
// per decidere di creare una casella di controllo, quindi creiamo un setter
// e getter per `visible` che possiamo dire a lil-gui
// da guardare.
export default class AxisGridHelper {


    constructor(THREE, node, units = 10) {

        const axes = new THREE.AxesHelper();
        axes.material.depthTest = false;
        axes.renderOrder = 2;  // dopo la griglia
        node.add(axes);

        const grid = new THREE.GridHelper(units, units);
        grid.material.depthTest = false;
        grid.renderOrder = 1;
        node.add(grid);

        this.grid = grid;
        this.axes = axes;
        this.visible = false;
    }


    get visible() {
        return this._visible;
    }


    set visible(v) {
        this._visible = v;
        this.grid.visible = v;
        this.axes.visible = v;
    }
}