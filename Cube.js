class Cube {
    constructor() {
        this.type = 'cube';
        //this.position = [0.0, 0.0, 0.0];
        this.color = [1.0, 1.0, 1.0, 1.0];
        //this.size = 10;
        //this.segments = 10;
        this.matrix = new Matrix4();
        this.textureIndex = null;
        this.textureWeight = 1.0;
        this.textureRepeat = false;
        this.repeatCount = 1;
    }

    render() {
        //var xy = this.position;
        var rgba = this.color;
        //var rad = this.size;

        // Pass the color
        gl.uniform4f(u_FragColor, rgba[0], rgba[1], rgba[2], rgba[3]);

        // Pass the texture weight
        gl.uniform1f(u_texColorWeight, this.textureWeight);

        // Pass the matrix to u_ModelMatrix attribute
        gl.uniformMatrix4fv(u_ModelMatrix, false, this.matrix.elements);

        // Set up vertices
        const vertices = [
            // Front face
            0.0,0.0,0.0, 1.0,0.0,0.0, 1.0,1.0,0.0,  0.0,0.0,0.0, 1.0,1.0,0.0, 0.0,1.0,0.0,
            // Left face
            0.0,0.0,1.0, 0.0,0.0,0.0, 0.0,1.0,0.0,  0.0,0.0,1.0, 0.0,1.0,0.0, 0.0,1.0,1.0,
            // Right face
            1.0,0.0,0.0, 1.0,0.0,1.0, 1.0,1.0,1.0,  1.0,0.0,0.0, 1.0,1.0,1.0, 1.0,1.0,0.0, 
            // Back face
            1.0,0.0,1.0, 0.0,0.0,1.0, 0.0,1.0,1.0,  1.0,0.0,1.0, 0.0,1.0,1.0, 1.0,1.0,1.0, 
            // Bottom face
            0.0,0.0,0.0, 1.0,0.0,0.0, 1.0,0.0,1.0,  0.0,0.0,0.0, 1.0,0.0,1.0, 0.0,0.0,1.0, 
            // Top face
            0.0,1.0,0.0, 1.0,1.0,0.0, 1.0,1.0,1.0,  0.0,1.0,0.0, 1.0,1.0,1.0, 0.0,1.0,1.0
        ];
        
        // Set up texture coordinates
        const texCoords = new Float32Array([
            // Front face
            0, 0,  this.repeatCount, 0,  this.repeatCount, this.repeatCount,
            0, 0,  this.repeatCount, this.repeatCount,  0, this.repeatCount,
            // Back face 
            0, 0,  this.repeatCount, 0,  this.repeatCount, this.repeatCount,
            0, 0,  this.repeatCount, this.repeatCount,  0, this.repeatCount,
            // Left face
            0, 0,  this.repeatCount, 0,  this.repeatCount, this.repeatCount,
            0, 0,  this.repeatCount, this.repeatCount,  0, this.repeatCount,
            // Right face
            0, 0,  this.repeatCount, 0,  this.repeatCount, this.repeatCount,
            0, 0,  this.repeatCount, this.repeatCount,  0, this.repeatCount,
            // Bottom face
            0, 0,  this.repeatCount, 0,  this.repeatCount, this.repeatCount,
            0, 0,  this.repeatCount, this.repeatCount,  0, this.repeatCount,
            // Top face
            0, 0,  this.repeatCount, 0,  this.repeatCount, this.repeatCount,
            0, 0,  this.repeatCount, this.repeatCount,  0, this.repeatCount,
        ]);

        const normals = [];
        for (let i = 0; i < vertices.length; i += 9) {
            const v0 = new Vector3([vertices[i], vertices[i+1], vertices[i+2]]);
            const v1 = new Vector3([vertices[i+3], vertices[i+4], vertices[i+5]]);
            const v2 = new Vector3([vertices[i+6], vertices[i+7], vertices[i+8]]);

            const edge1 = new Vector3(v1.elements).sub(v0);
            const edge2 = new Vector3(v2.elements).sub(v0);

            const normal = Vector3.cross(edge1, edge2);
            normal.normalize();
            normal.mul(-1);

            for (let j = 0; j < 3; j++) {
                normals.push(...normal.elements);
            }
        }

        const normalMatrix = new Matrix4();
        normalMatrix.setInverseOf(this.matrix);
        normalMatrix.transpose();
        gl.uniformMatrix4fv(u_NormalMatrix, false, normalMatrix.elements);

        // Create and bind texture coordinate buffer
        const texCoordBuffer = gl.createBuffer();
        gl.bindBuffer(gl.ARRAY_BUFFER, texCoordBuffer);
        gl.bufferData(gl.ARRAY_BUFFER, texCoords, gl.STATIC_DRAW);
        gl.vertexAttribPointer(a_TexCoord, 2, gl.FLOAT, false, 0, 0);
        gl.enableVertexAttribArray(a_TexCoord);

        // If texture is set, use it
        if (!(this.textureIndex === null)) {
            gl.uniform1i(u_TextureIndex, this.textureIndex);
            gl.uniform1f(u_texColorWeight, 1.0);

            // Set texture parameters for repeating and filtering
            gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MIN_FILTER, gl.LINEAR_MIPMAP_LINEAR);
            gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MAG_FILTER, gl.LINEAR);
            gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_WRAP_S,
                this.textureRepeat ? gl.REPEAT : gl.CLAMP_TO_EDGE);
            gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_WRAP_T,
                this.textureRepeat ? gl.REPEAT : gl.CLAMP_TO_EDGE);

        } else {
            gl.uniform1f(u_texColorWeight, 0.0);
        }

        // Create and bind normal buffer
        const normalBuffer = gl.createBuffer();
        gl.bindBuffer(gl.ARRAY_BUFFER, normalBuffer);
        gl.bufferData(gl.ARRAY_BUFFER, new Float32Array(normals), gl.STATIC_DRAW);
        gl.vertexAttribPointer(a_Normal, 3, gl.FLOAT, false, 0, 0);
        gl.enableVertexAttribArray(a_Normal);

        for (let i = 0; i < vertices.length; i += 18) {
            drawSquare3D( vertices.slice(i, i+18) )
        }
    }
}