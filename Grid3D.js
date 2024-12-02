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

const DIVS = 4;
const SIZE = 4;

function buildGridGeometry() {
	const vertices = [];

	const size = 1;
	const divs = DIVS;
	const step = size / divs;

	for ( let i = 0; i <= divs; i ++) {
		for ( let j = 0; j <= divs; j ++) {
			vertices.push(j * step, i * step, 0);
			vertices.push(j * step, i * step, size);

			vertices.push(0, i * step, j * step);
			vertices.push(size, i * step, j * step);

			vertices.push(i * step, 0, j * step);
			vertices.push(i * step, size, j * step);

		}
	}

	// const geometry = new THREE.BufferGeometry();
	// geometry.setAttribute( 'position', new THREE.Float32BufferAttribute( vertices, 3 ) );
	console.log(vertices)
	// return geometry;
	return vertices;
}

export class LoDGrid3DManager {
	#totalCellNb;
	#nbLoDs;
	#mesh;
	#scene;
	#lodOffsets = [];
	#instanceMatrix;
	
	constructor(nbLoDs = 1) {
		this.#nbLoDs = nbLoDs;
		this.#totalCellNb = Math.pow(Math.pow(DIVS, 3), nbLoDs - 1);
		this.#totalCellNb = 0;
		for(let lod = 0; lod < this.#nbLoDs; ++lod) {
			this.#lodOffsets.push(this.#totalCellNb);
			this.#totalCellNb += Math.pow(Math.pow(DIVS, 3), lod);
		}
		console.log(nbLoDs, this.#totalCellNb);
		console.log(this.#lodOffsets);
		// const gridGeometry = buildGridGeometry();
		// const gridGeometry = new THREE.BufferGeometry();
		const gridGeometry = new THREE.InstancedBufferGeometry();
		gridGeometry.instanceCount = this.#totalCellNb;
		gridGeometry.setAttribute( 'position', new THREE.Float32BufferAttribute( buildGridGeometry(), 3 ) );

		this.#instanceMatrix = new Float32Array(this.#totalCellNb * 16);
		const matrix = new THREE.Matrix4();
		const position = new THREE.Vector3();
   		const rotation = new THREE.Quaternion()
		const scale = new THREE.Vector3(0, 0, 0);
		for(let i = 0; i < this.#totalCellNb; ++i) {
			matrix.compose(position, rotation, scale);
			matrix.toArray(this.#instanceMatrix, i*16);
		}
		gridGeometry.setAttribute('instanceMatrix', new THREE.InstancedBufferAttribute(this.#instanceMatrix, 16));

		const gridMaterial = new THREE.LineBasicMaterial({color: 0xffffff, linewidth: 1,
			onBeforeCompile: shader => {
				shader.vertexShader = `
				attribute mat4 instanceMatrix;

				${shader.vertexShader}
			`.replace(
				  `#include <begin_vertex>`,
				  `#include <begin_vertex>
				  transformed = (instanceMatrix * vec4(position, 1)).xyz;
			`
				);
				console.log(shader.vertexShader)
			  }
		});
		gridGeometry.attributes.instanceMatrix.needsUpdate = true
		this.#mesh = new THREE.LineSegments(gridGeometry, gridMaterial);
		console.log(this.#mesh, gridGeometry)

		// this.#mesh.count = 3;
		// gridGeometry.instanceCount = 0
	}

	addTo(scene) {
		this.#scene = scene;
		this.#scene.add(this.#mesh);
	}

	remove() {
		this.#scene.remove(this.#mesh);
	}

	#voxelId(cell, lod) {
		return cell.x + Math.pow(4, lod) * cell.y + Math.pow(Math.pow(4, lod), 2) * cell.z;
	}

	showCell(lod = 0, cell = new THREE.Vector3(0, 0, 0)) {
		const offset = this.#lodOffsets[lod];
		const id = this.#voxelId(cell, lod);
		// console.log(id, id + offset);

   		const rotation = new THREE.Quaternion();

		const size = SIZE / Math.pow(4, lod);
		const scale = new THREE.Vector3(size, size, size);

		const position = new THREE.Vector3(
			cell.x * size,
			cell.y * size,
			cell.z * size
		);

		const matrix = new THREE.Matrix4();
		matrix.compose(position, rotation, scale);
		matrix.toArray(this.#instanceMatrix, (id + offset)*16);

		this.#mesh.geometry.attributes.instanceMatrix.needsUpdate = true
	}

	hideCell(lod = 0, cell = new THREE.Vector3(0, 0, 0)) {
		const offset = this.#lodOffsets[lod];
		const id = this.#voxelId(cell, lod);
		const matrix = new THREE.Matrix4().multiplyScalar(0);
		matrix.toArray(this.#instanceMatrix, (id + offset)*16);

		this.#mesh.geometry.attributes.instanceMatrix.needsUpdate = true
	}

	reset() {
		const matrix = new THREE.Matrix4().multiplyScalar(0);
		for(let i = 0; i < this.#totalCellNb; ++i) {
			matrix.toArray(this.#instanceMatrix, i*16);
		}
	}
}