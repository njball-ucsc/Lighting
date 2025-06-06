class Dodec {
    constructor() {
        this.type = 'dodec';
        //this.position = [0.0, 0.0, 0.0];
        this.color = [1.0, 0.0, 0.0, 1.0];
        //this.size = 10;
        //this.segments = 10;
        this.matrix = new Matrix4();
        this.rotationMatrix = new Matrix4();

        this.texture = null;
        this.textureWeight = 0.0;

        this.faceDownAngle = 0;
        this.faceDownAxis = 0;
        this.rotateFaceDown();
    }

    render() {
        //var xy = this.position;
        var rgba = this.color;
        //var rad = this.size;

        var finalMatrix = new Matrix4(this.matrix);
        finalMatrix.multiply(this.rotationMatrix);

        // Pass the color
        gl.uniform4f(u_FragColor, rgba[0]*1.1, rgba[1]*1.1, rgba[2]*1.1, rgba[3]);
        
        // Pass the texture weight
        gl.uniform1f(u_texColorWeight, this.textureWeight);

        // Pass the matrix to u_ModelMatrix attribute
        gl.uniformMatrix4fv(u_ModelMatrix, false, finalMatrix.elements);

        // Create vertices
        var a = [1.0, 1.0, 1.0];
        var b = [-1.0, 1.0, 1.0];
        var c = [1.0, -1.0, 1.0];
        var d = [1.0, 1.0, -1.0];
        var e = [-1.0, -1.0, 1.0];
        var f = [1.0, -1.0, -1.0];
        var g = [-1.0, 1.0, -1.0];
        var h = [-1.0, -1.0, -1.0];

        var phi = (1 + Math.sqrt(5)) / 2
        var i = [0.0, phi, 1.0/phi];
        var j = [0.0, -phi, 1.0/phi];
        var k = [0.0, phi, -1.0/phi];
        var l = [0.0, -phi, -1.0/phi];

        var m = [1.0/phi, 0.0, phi];
        var n = [1.0/phi, 0.0, -phi];
        var o = [-1.0/phi, 0.0, phi];
        var p = [-1.0/phi, 0.0, -phi];

        var q = [phi, 1.0/phi, 0.0];
        var r = [-phi, 1.0/phi, 0.0];
        var s = [phi, -1.0/phi, 0.0];
        var t = [-phi, -1.0/phi, 0.0];

        // Draw and slightly shade

        // face 1
        this.drawPentagon3D(m, o, b, i, a);

        // face 2 gl.uniform4f(u_FragColor, 0, 1, 0, rgba[3]); 
        gl.uniform4f(u_FragColor, rgba[0]*1.05, rgba[1]*1.05, rgba[2]*1.05, rgba[3]); 
        this.drawPentagon3D(m, a, q, s, c);

        // face 3 gl.uniform4f(u_FragColor, 0, 0, 1, rgba[3]); 
        gl.uniform4f(u_FragColor, rgba[0], rgba[1], rgba[2], rgba[3]); 
        this.drawPentagon3D(m, c, j, e, o);

        // face 4 gl.uniform4f(u_FragColor, 1, 1, 1, rgba[3]);
        gl.uniform4f(u_FragColor, rgba[0]*.95, rgba[1]*.95, rgba[2]*.95, rgba[3]);
        this.drawPentagon3D(o, e, t, r, b);

        // face 4 gl.uniform4f(u_FragColor, 0.1, 0.1, 0.1, rgba[3]);
        gl.uniform4f(u_FragColor, rgba[0]*.90, rgba[1]*.90, rgba[2]*.90, rgba[3]);
        this.drawPentagon3D(b, r, g, k, i);

        // face 6 gl.uniform4f(u_FragColor, 1, 1, 0, rgba[3]);
        gl.uniform4f(u_FragColor, rgba[0]*.85, rgba[1]*.85, rgba[2]*.85, rgba[3]);
        this.drawPentagon3D(i, k, d, q, a);

        // face 7 gl.uniform4f(u_FragColor, 1, 0, 1, rgba[3]);
        gl.uniform4f(u_FragColor, rgba[0]*.80, rgba[1]*.80, rgba[2]*.80, rgba[3]);
        this.drawPentagon3D(q, d, n, f, s);

        // face 8 gl.uniform4f(u_FragColor, 0, 1, 1, rgba[3]);
        gl.uniform4f(u_FragColor, rgba[0]*.75, rgba[1]*.75, rgba[2]*.75, rgba[3]);
        this.drawPentagon3D(s, c, j, l, f);

        // face 9 gl.uniform4f(u_FragColor, 1, 0.5, 0.5, rgba[3]);
        gl.uniform4f(u_FragColor, rgba[0]*.70, rgba[1]*.70, rgba[2]*.70, rgba[3]);
        this.drawPentagon3D(j, e, t, h, l);

        // face 10 gl.uniform4f(u_FragColor, 0.5, 1, 0.5, rgba[3]);
        gl.uniform4f(u_FragColor, rgba[0]*.65, rgba[1]*.65, rgba[2]*.65, rgba[3]);
        this.drawPentagon3D(t, r, g, p, h);

        // face 11 gl.uniform4f(u_FragColor, 0.5, 0.5, 1, rgba[3]);
        gl.uniform4f(u_FragColor, rgba[0]*.60, rgba[1]*.60, rgba[2]*.60, rgba[3]);
        this.drawPentagon3D(g, k, d, n, p);

        // face 12 gl.uniform4f(u_FragColor, 0.5, 0.5, 0.5, rgba[3]);
        gl.uniform4f(u_FragColor, rgba[0]*.55, rgba[1]*.55, rgba[2]*.55, rgba[3]);
        this.drawPentagon3D(l, f, n, p, h);
    }

    drawPentagon3D(a, b, c, d, e) {
        // Calculate face normals
        const v1 = new Vector3([b[0]-a[0], b[1]-a[1], b[2]-a[2]]);
        const v2 = new Vector3([c[0]-a[0], c[1]-a[1], c[2]-a[2]]);
        const normal = Vector3.cross(v1, v2);
        normal.normalize();

        this.drawTriangleNorms3D( a, b, c, normal );
        this.drawTriangleNorms3D( a, c, d, normal );
        this.drawTriangleNorms3D( a, d, e, normal );
    }

    drawTriangleNorms3D(a, b, c, normal) {
        const vertices = [...a, ...b, ...c];
        const normals = [...normal.elements, ...normal.elements, ...normal.elements];

        // Bind vertex buffer
        const vertexBuffer = gl.createBuffer();
        gl.bindBuffer(gl.ARRAY_BUFFER, vertexBuffer);
        gl.bufferData(gl.ARRAY_BUFFER, new Float32Array(vertices), gl.STATIC_DRAW);
        gl.vertexAttribPointer(a_Position, 3, gl.FLOAT, false, 0, 0);
        gl.enableVertexAttribArray(a_Position);

        // Bind normal buffer
        const normalBuffer = gl.createBuffer();
        gl.bindBuffer(gl.ARRAY_BUFFER, normalBuffer);
        gl.bufferData(gl.ARRAY_BUFFER, new Float32Array(normals), gl.STATIC_DRAW);
        gl.vertexAttribPointer(a_Normal, 3, gl.FLOAT, false, 0, 0);
        gl.enableVertexAttribArray(a_Normal);

        gl.drawArrays(gl.TRIANGLES, 0, 3);
    }

    connectPart(parent, parentFaceId, scale = 1.0, dist) {
        // Apply offset and rotation from parent
        this.matrix = new Matrix4(parent);

        // Scale
        this.matrix.scale(scale, scale, scale);

        // Push out along normal
        const parentNorm = this.getFaceData(parentFaceId);
        this.matrix.translate(
            parentNorm.elements[0] * dist,
            parentNorm.elements[1] * dist,
            parentNorm.elements[2] * dist
        );
    }

    // Helper methods generated by ChatGPT, tweaked for my project:

    rotateFaceDown() {
        // Rotate shape for bottom face down
        var phi = (1 + Math.sqrt(5)) / 2
        var d = [1.0, 1.0, -1.0];
        var g = [-1.0, 1.0, -1.0];
        var k = [0.0, phi, -1.0/phi];
    
        // Extract edge vectors
        var e1 = new Vector3( [k[0] - g[0], k[1] - g[1], k[2] - g[2]] );
        var e2 = new Vector3( [d[0] - g[0], d[1] - g[1], d[2] - g[2]] );
    
        // Compute normal
        var norm = Vector3.cross(e1, e2);
    
        // Normalize
        norm.normalize();
    
        // Compute rotation axis
        var down = new Vector3( [0, -1, 0] );
        var axis = Vector3.cross(norm, down);
        axis.normalize();
    
        // Compute rotation angle
        this.faceDownAngle = Math.acos(Vector3.dot(norm, down)) * (180 / Math.PI);
        this.faceDownAxis = axis;
    
        // Apply rotation
        this.rotationMatrix.rotate(this.faceDownAngle, axis.elements[0], axis.elements[1], axis.elements[2]);
    }

    getFaceData(face) {
        // Create vertices
        var vertices = [];
        var a = [1.0, 1.0, 1.0];
        var b = [-1.0, 1.0, 1.0];
        var c = [1.0, -1.0, 1.0];
        var d = [1.0, 1.0, -1.0];
        var e = [-1.0, -1.0, 1.0];
        var f = [1.0, -1.0, -1.0];
        var g = [-1.0, 1.0, -1.0];
        var h = [-1.0, -1.0, -1.0];

        var phi = (1 + Math.sqrt(5)) / 2
        var i = [0.0, phi, 1.0/phi];
        var j = [0.0, -phi, 1.0/phi];
        var k = [0.0, phi, -1.0/phi];
        var l = [0.0, -phi, -1.0/phi];

        var m = [1.0/phi, 0.0, phi];
        var n = [1.0/phi, 0.0, -phi];
        var o = [-1.0/phi, 0.0, phi];
        var p = [-1.0/phi, 0.0, -phi];

        var q = [phi, 1.0/phi, 0.0];
        var r = [-phi, 1.0/phi, 0.0];
        var s = [phi, -1.0/phi, 0.0];
        var t = [-phi, -1.0/phi, 0.0];

        switch(face) {
            case 1: vertices = [m, o, b, i, a]; break;
            case 2: vertices = [m, a, q, s, c]; break;
            case 3: vertices = [m, c, j, e, o]; break;
            case 4: vertices = [o, e, t, r, b]; break;
            case 5: vertices = [b, r, g, k, i]; break;
            case 6: vertices = [i, k, d, q, a]; break;
            case 7: vertices = [q, d, n, f, s]; break;
            case 8: vertices = [s, c, j, l, f]; break;
            case 9: vertices = [j, e, t, h, l]; break;
            case 10: vertices = [t, r, g, p, h]; break;
            case 11: vertices = [g, k, d, n, p]; break;
            case 12: vertices = [l, f, n, p, h]; break;
        }

        // Calculate face normal
        const v1 = new Vector3([
            vertices[1][0] - vertices[0][0],
            vertices[1][1] - vertices[0][1],
            vertices[1][2] - vertices[0][2]
        ]);

        const v2 = new Vector3([
            vertices[2][0] - vertices[0][0],
            vertices[2][1] - vertices[0][1],
            vertices[2][2] - vertices[0][2]
        ]);
        
        const normal = Vector3.cross(v1, v2);
        if (face < 8 || face > 11) { normal.mul(-1) };

        return normal;
    }
}