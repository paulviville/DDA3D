import * as THREE from 'three';

export class Grid2D extends THREE.LineSegments {

	constructor( size = 1, divisions = 1, linewidth = 1, color = 0x888888, corner = new THREE.Vector3() ) {

		const step = size / divisions;
		const vertices = [], colors = [];
        
        for ( let i = 0; i <= divisions; i ++) {

			vertices.push( corner.x, corner.y + i * step, 0, corner.x + size, corner.y + i * step, 0 );
			vertices.push( corner.x + i * step, corner.y, 0, corner.x + i * step, corner.y + size, 0 );

		}

		const geometry = new THREE.BufferGeometry();
		geometry.setAttribute( 'position', new THREE.Float32BufferAttribute( vertices, 3 ) );
		geometry.setAttribute( 'color', new THREE.Float32BufferAttribute( colors, 3 ) );

		const material = new THREE.LineBasicMaterial( { color: color, linewidth: linewidth } );

		super( geometry, material );

		this.type = 'Grid2D';

	}

	dispose() {

		this.geometry.dispose();
		this.material.dispose();

	}

}