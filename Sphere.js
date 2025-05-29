class Sphere {
    constructor() {
        this.type = 'sphere';
        this.position = [0, 0, 0];
        this.color = [1, 1, 0, 1];
        this.size = 1.0;
        this.segments = 16;
        this.textureWeight = 0;
        this.matrix = new Matrix4();
    }

    render() {
        var rgba = this.color;

        // Pass the color to shader
        gl.uniform4f(u_FragColor, rgba[0], rgba[1], rgba[2], rgba[3]);

        // Pass the texture weight
        gl.uniform1f(u_texColorWeight, this.textureWeight);

        // Pass the matrix to shader
        gl.uniformMatrix4fv(u_ModelMatrix, false, this.matrix.elements);

        // Draw the sphere assisted with Deepseek AI
        var vertices = [];
        var normals = [];

        for (let lat = 0; lat <= this.segments; lat++) {
            const theta = lat * Math.PI / this.segments;
            const sinTheta = Math.sin(theta);
            const cosTheta = Math.cos(theta);

            for (let lon = 0; lon <= this.segments; lon++) {
                const phi = lon * 2 * Math.PI / this.segments;
                const sinPhi = Math.sin(phi);
                const cosPhi = Math.cos(phi);

                const x = cosPhi * sinTheta;
                const y = cosTheta;
                const z = sinPhi * sinTheta;

                vertices.push(x * this.size, y * this.size, z * this.size);
                normals.push(x, y, z);
            }
        }

        // Create indices for triangles
        var indices = [];
        for (let lat = 0; lat < this.segments; lat++) {
            for (let lon = 0; lon < this.segments; lon++) {
                const first = (lat * (this.segments + 1)) + lon;
                const second = first + this.segments + 1;

                indices.push(first, second, first + 1);
                indices.push(second, second + 1, first + 1);
            }
        }

        const normalMatrix = new Matrix4();
        normalMatrix.setInverseOf(this.matrix);
        normalMatrix.transpose();
        gl.uniformMatrix4fv(u_NormalMatrix, false, normalMatrix.elements);

        this.drawSphere(vertices, normals, indices);
    }

    drawSphere(vertices, normals, indices) {
        // Bind vertex buffer
        var vertexBuffer = gl.createBuffer();
        gl.bindBuffer(gl.ARRAY_BUFFER, vertexBuffer);
        gl.bufferData(gl.ARRAY_BUFFER, new Float32Array(vertices), gl.STATIC_DRAW);
        gl.vertexAttribPointer(a_Position, 3, gl.FLOAT, false, 0, 0);
        gl.enableVertexAttribArray(a_Position);

        // Bind normal buffer
        var normalBuffer = gl.createBuffer();
        gl.bindBuffer(gl.ARRAY_BUFFER, normalBuffer);
        gl.bufferData(gl.ARRAY_BUFFER, new Float32Array(normals), gl.STATIC_DRAW);
        gl.vertexAttribPointer(a_Normal, 3, gl.FLOAT, false, 0, 0);
        gl.enableVertexAttribArray(a_Normal);

        // Bind index buffer
        var indexBuffer = gl.createBuffer();
        gl.bindBuffer(gl.ELEMENT_ARRAY_BUFFER, indexBuffer);
        gl.bufferData(gl.ELEMENT_ARRAY_BUFFER, new Uint16Array(indices), gl.STATIC_DRAW);

        gl.drawElements(gl.TRIANGLES, indices.length, gl.UNSIGNED_SHORT, 0);
    }
}