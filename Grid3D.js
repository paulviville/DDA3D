import * as THREE from 'three';

export class Grid3D extends THREE.LineSegments {

	constructor( size = 1, divisions = 1, linewidth = 1, color = 0x888888, corner = new THREE.Vector3() ) {

		const step = size / divisions;
		const vertices = [], colors = [];
        
		const x = corner.x;
		const y = corner.y;
		const z = corner.z;

        for ( let i = 0; i <= divisions; i ++) {
			for ( let j = 0; j <= divisions; j ++) {
				vertices.push(x + j * step, y + i * step, z);
				vertices.push(x + j * step, y + i * step, z + size);

				vertices.push(x, y + i * step, z + j * step);
				vertices.push(x + size, y + i * step, z + j * step);

				vertices.push(x + i * step, y, z + j * step);
				vertices.push(x + i * step, y + size, z + j * step);

			}
		}


		const geometry = new THREE.BufferGeometry();
		geometry.setAttribute( 'position', new THREE.Float32BufferAttribute( vertices, 3 ) );

		const material = new THREE.LineBasicMaterial( { color: color, linewidth: linewidth } );

		super( geometry, material );

		this.type = 'Grid2D';

	}

	dispose() {

		this.geometry.dispose();
		this.material.dispose();

	}

}

function buildGridGeometry() {
	const vertices = [];

	const size = 1;
	const divs = 4;
	const step = size / divs;

	for ( let i = 0; i <= divs; i ++) {
		for ( let j = 0; j <= divs; j ++) {
			vertices.push(j * step, i * step, 0);
			vertices.push(j * step, i * step, size);

			vertices.push(0, i * step, j * step);
			vertices.push(size, i * step, j * step);

			vertices.push(i * step, y, j * step);
			vertices.push(i * step, size, j * step);

		}
	}

}

export class LoDGrid3D {
	constructor(nbLoDs = 3) {

	}
}