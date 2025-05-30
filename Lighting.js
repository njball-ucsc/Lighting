// ----------------------------------------------------------------------------------------------------------------------------------
// Instantiate gl and shaders globally
// ----------------------------------------------------------------------------------------------------------------------------------

let gl;
let canvas;
let a_Position;
let u_FragColor;
var color = [1.0, 0.0, 0.0, 1.0];

// Global angles
let g_xAngle = 0;
let g_yAngle = 0;
let g_headAng = 0;
let g_rShoulderAng = 0;
let g_lShoulderAng = 0;
let g_rThighAng = 0;
let g_lThighAng = 0;
let g_rHandAng = 0;
let g_lHandAng = 0;
let g_rLegAng = 0;
let g_lLegAng = 0;

// Animation timings
let deltaTime = 0;
let g_time = 0;
let g_prevTime = 0;
let g_prevCast = 0;

let g_animateJump = false;
let g_frogJumping = false;
let g_frogPosition = [0, 2.7, 0];
let g_currentRotation = 0;
let g_targetRotation = 0;
let g_jumpStartTime = 0;
const JUMP_DURATION = 1.25;
const JUMP_HEIGHT = 4.0;
const JUMP_DISTANCE = 12;

let g_animateSpell = false;

// Texturing
let a_TexCoord;

let u_Sampler0;
let u_Sampler1;
let u_Sampler2;
let u_Sampler3;
let u_Sampler4;
let u_Sampler5;
let u_Sampler6;
let u_Sampler7;
let u_Sampler8;
let u_Sampler9;
let u_Sampler10;
let u_Sampler11;

let g_texture0;
let g_texture1;
let g_texture2;
let g_texture3;
let g_texture4;
let g_texture5;
let g_texture6;
let g_texture7;
let g_texture8;
let g_texture9;
let g_texture10;
let g_texture11;

const g_textures = [
    g_texture0,
    g_texture1,
    g_texture2,
    g_texture3,
    g_texture4,
    g_texture5,
    g_texture6,
    g_texture7,
    g_texture8,
    g_texture9,
    g_texture10,
    g_texture11
];

let u_TextureIndex;
let u_texColorWeight = 1;
const windowTextureIndices = [2, 3, 4, 5, 6, 7, 8, 9, 10, 11];

// Camera
let camera;
let u_ViewMatrix;
let u_ProjectionMatrix;
let keysPressed = {};
let isMouseDown = false;
let lastMouseX = 0;
let lastMouseY = 0;
let mouseSensitivity = 0.002;

// World generation
let wallMap = [];
let walls = [];
const scaleFactor = 100/64;

// Optimization
let buildingBuffer = null;
let buildingVertices = null;
let buildingTexCoords = null;
let buildingIndices = null;
let buildingVAO = null;
let buildingCount = 0;
let fpsCounter = 0;
let lastFpsUpdateTime = 0;
let currentFPS = 0;
let fpsDisplayElement;

// Lighting
let a_Normal;
let u_NormalVisualization;
let u_NormalMatrix;
let buildingNormals = null;
let normalBuffer = null;
let u_LightPosition;
let u_LightColor;
let g_lightPosition = [50, 50, 50];
let g_lightColor = [1.0, 1.0, 1.0];
let lightCube;
let lightSliderX, lightSliderY, lightSliderZ, lightSliderR, lightSliderG, lightSliderB;
let g_lightEnabled = true;
let u_LightEnabled;

// ----------------------------------------------------------------------------------------------------------------------------------
// Vertex shader program
// ----------------------------------------------------------------------------------------------------------------------------------
var VSHADER_SOURCE = `
    attribute vec4 a_Position;
    attribute vec2 a_TexCoord;
    attribute vec3 a_Normal;
    uniform mat4 u_ModelMatrix;
    uniform mat4 u_ViewMatrix;
    uniform mat4 u_ProjectionMatrix;
    uniform vec3 u_LightPosition;
    uniform vec3 u_LightColor;
    varying vec2 v_TexCoord;
    varying vec3 v_Normal;
    varying vec3 v_FragPos;
    varying vec3 v_LightColor;
    varying vec3 v_LightDir;
    uniform mat4 u_NormalMatrix;

    void main() {
        gl_Position = u_ProjectionMatrix * u_ViewMatrix * u_ModelMatrix * a_Position;
        v_TexCoord = a_TexCoord;

        v_FragPos = vec3(u_ModelMatrix * a_Position);

        v_Normal = normalize(mat3(u_NormalMatrix) * a_Normal); 

        v_LightDir = normalize(u_LightPosition - v_FragPos);

        v_LightColor = u_LightColor;
    }`;

// ----------------------------------------------------------------------------------------------------------------------------------
// Fragment shader program
// ----------------------------------------------------------------------------------------------------------------------------------
var FSHADER_SOURCE = `
    precision mediump float;
    uniform vec4 u_FragColor;

    uniform sampler2D u_Sampler0;
    uniform sampler2D u_Sampler1;
    uniform sampler2D u_Sampler2;
    uniform sampler2D u_Sampler3;
    uniform sampler2D u_Sampler4;
    uniform sampler2D u_Sampler5;
    uniform sampler2D u_Sampler6;
    uniform sampler2D u_Sampler7;
    uniform sampler2D u_Sampler8;
    uniform sampler2D u_Sampler9;
    uniform sampler2D u_Sampler10;
    uniform sampler2D u_Sampler11;

    uniform float u_texColorWeight;
    uniform int u_TextureIndex;
    uniform bool u_NormalVisualization;
    uniform int u_LightEnabled;
    varying vec2 v_TexCoord;
    varying vec3 v_Normal;
    varying vec3 v_FragPos;
    varying vec3 v_LightColor;
    varying vec3 v_LightDir;

    uniform vec3 u_SpotLightPos;
    uniform vec3 u_SpotLightDir;
    uniform float u_SpotLightLen;
    uniform float u_SpotLightOutLen;
    uniform vec3 u_SpotLightColor;
    uniform float u_SpotLightIntensity;

    void main() {
        if (u_NormalVisualization) {
            gl_FragColor = vec4((v_Normal + 1.0) * 0.5, 1.0);
            return;
        }

        // Texture assignment
        vec4 texColor;
        if (u_TextureIndex == 0) { texColor = texture2D(u_Sampler0, v_TexCoord); }
        else if (u_TextureIndex == 1) { texColor = texture2D(u_Sampler1, v_TexCoord); }
        else if (u_TextureIndex == 2) { texColor = texture2D(u_Sampler2, v_TexCoord); }
        else if (u_TextureIndex == 3) { texColor = texture2D(u_Sampler3, v_TexCoord); }
        else if (u_TextureIndex == 4) { texColor = texture2D(u_Sampler4, v_TexCoord); }
        else if (u_TextureIndex == 5) { texColor = texture2D(u_Sampler5, v_TexCoord); }
        else if (u_TextureIndex == 6) { texColor = texture2D(u_Sampler6, v_TexCoord); }
        else if (u_TextureIndex == 7) { texColor = texture2D(u_Sampler7, v_TexCoord); }
        else if (u_TextureIndex == 8) { texColor = texture2D(u_Sampler8, v_TexCoord); }
        else if (u_TextureIndex == 9) { texColor = texture2D(u_Sampler9, v_TexCoord); }
        else if (u_TextureIndex == 10) { texColor = texture2D(u_Sampler10, v_TexCoord); }
        else if (u_TextureIndex == 11) { texColor = texture2D(u_Sampler11, v_TexCoord); }
        vec3 baseColor = mix(u_FragColor.rgb, texColor.rgb, u_texColorWeight);
        vec3 norm = normalize(v_Normal);

        if (u_LightEnabled == 1) {
            // Ambient
            float ambientStrength = 0.5;
            vec3 ambient = ambientStrength * v_LightColor;

            // Diffuse
            float diff = max(dot(norm, v_LightDir), 0.0);
            vec3 diffuse = diff * v_LightColor;

            // Specular
            float specularStrength = 0.25;
            vec3 viewDir = normalize(-v_FragPos);
            vec3 reflectDir = reflect(-v_LightDir, norm);
            float spec = pow(max(dot(viewDir, reflectDir), 0.0), 32.0);
            vec3 specular = specularStrength * spec * v_LightColor;

            // Spotlight
            vec3 spotLightDir = normalize(u_SpotLightDir);
            vec3 fragToSpotLight = normalize(v_FragPos - u_SpotLightPos);
            float theta = dot(fragToSpotLight, spotLightDir);
            float epsilon = u_SpotLightLen - u_SpotLightOutLen;
            float spotIntensity = clamp((theta - u_SpotLightOutLen) / epsilon, 0.0, 1.0);

            // Apply spotlight in cone
            if (theta > u_SpotLightOutLen) {
                float distance = length(u_SpotLightPos - v_FragPos);
                float attenuation = 1.0 / (1.0 + 0.09 * distance + 0.032 * (distance * distance));

                // Diffuse
                float spotDiff = max(dot(norm, -spotLightDir), 0.0);
                vec3 spotDiffuse = spotDiff * u_SpotLightColor * spotIntensity * u_SpotLightIntensity;

                // Specular 
                vec3 spotReflectDir = reflect(spotLightDir, norm);
                float spotSpec = pow(max(dot(viewDir, spotReflectDir), 0.0), 32.0);
                vec3 spotSpecular = specularStrength * spotSpec * u_SpotLightColor * spotIntensity * u_SpotLightIntensity;

                // Contribute with spotlight
                diffuse += spotDiffuse * attenuation;
                specular += spotSpecular * attenuation;
            }

            vec3 result = (ambient + diffuse + specular) * baseColor;
            gl_FragColor = vec4(result, 1.0);
        } else {
            gl_FragColor = vec4(baseColor, 1.0);
        }
    }`;

// ----------------------------------------------------------------------------------------------------------------------------------
// Run initialization
// ----------------------------------------------------------------------------------------------------------------------------------
async function init() {
    try {
        // Retrieve canvas
        setupWebGL();

        // Initialize shaders
        connectVariablesToGLSL();

        // Instantiate UI actions
        addHtmlUiActions();

        // Generate world
        generateWallMap();
        generateBuildings();

        // Start animation tick
        tick();

    } catch (err) {
        console.error('Initialization failed:', err);
    }
}

function setupWebGL() {
    canvas = document.getElementById('World');
    if (!canvas) {
        console.log('Failed to retrieve the canvas');
        return;
    }

    // Retrieve WebGL rendering context
    gl = canvas.getContext("webgl", { preserveDrawingBuffer: true });
    if (!gl) {
        console.log('Failed to retrieve rendering context');
        return;
    }

    // Enable depth test
    gl.enable(gl.DEPTH_TEST);
    gl.depthFunc(gl.LEQUAL);
    gl.clearDepth(1.0);

    // Instantiate camera
    camera = new Camera();
}

function addHtmlUiActions() {
    fpsDisplayElement = document.getElementById('fps-display');
    document.getElementById('animateJump').onclick = function() {
        resetAnimation();
        g_animateJump = true;
        toggleJumpAnimation();
    }

    document.getElementById('resetButton').onclick = function() { resetAnimation(); }

    let normalVisualization = false;
    document.getElementById('togNorm').onclick = function() {
        normalVisualization = !normalVisualization;
        gl.uniform1i(u_NormalVisualization, normalVisualization);
    }

    // Camera buttons allows multiple inputs
    document.addEventListener('keydown', (ev) => {
        keysPressed[ev.key.toLowerCase()] = true;
    });

    document.addEventListener('keyup', (ev) => {
        keysPressed[ev.key.toLowerCase()] = false;
    });

    // Lock mouse pointer when clicking
    canvas.addEventListener('click', async () => {
        try {
            await canvas.requestPointerLock();
        } catch (err) {
            console.log('Pointer lock failed:', err);
        }
    });

    document.addEventListener('pointerlockchange', () => {
        isMouseDown = document.pointerLockElement === canvas;
        if (isMouseDown) {
            lastMouseX = canvas.width / 2;
            lastMouseY = canvas.height / 2;
        }
    });

    document.addEventListener('mousemove', (e) => {
        if (!isMouseDown) return;
        
        // Calculate movement difference
        const deltaX = e.movementX || 0;
        const deltaY = e.movementY || 0;

        // Rotate camera
        camera.panHorizontal(deltaX * mouseSensitivity);
        camera.panVertical(-deltaY * mouseSensitivity);
    });

    // Add/Remove buildings
    document.addEventListener('keydown', (ev) => {
        if (ev.key === 'f') {
            addBuilding();
        } else if (ev.key === 'r') {
            removeBuilding();
        }
    });

    // Light control sliders
    lightSliderX = document.getElementById('lightX');
    lightSliderY = document.getElementById('lightY');
    lightSliderZ = document.getElementById('lightZ');
    lightSliderR = document.getElementById('lightR');
    lightSliderG = document.getElementById('lightG');
    lightSliderB = document.getElementById('lightB');

    lightSliderX.oninput = function() {
        g_lightPosition[0] = parseFloat(this.value);
    }
    lightSliderY.oninput = function() {
        g_lightPosition[1] = parseFloat(this.value);
    }
    lightSliderZ.oninput = function() {
        g_lightPosition[2] = parseFloat(this.value);
    }
    lightSliderR.oninput = function() {
        g_lightColor[0] = parseFloat(this.value) / 100;
    }
    lightSliderG.oninput = function() {
        g_lightColor[1] = parseFloat(this.value) / 100;
    }
    lightSliderB.oninput = function() {
        g_lightColor[2] = parseFloat(this.value) / 100;
    }

    // Toggle lighting
    document.getElementById('togLight').onclick = function() {
        g_lightEnabled = !g_lightEnabled;
        gl.uniform1i(u_LightEnabled, g_lightEnabled ? 1 : 0);
    }
}

function clearCanvas() {
     gl.clearColor(0.0, 0.0, 0.0, 1.0); // Set a black color
     gl.clear(gl.COLOR_BUFFER_BIT | gl.DEPTH_BUFFER_BIT);
}

function connectVariablesToGLSL() {
    if (!initShaders(gl, VSHADER_SOURCE, FSHADER_SOURCE)) {
        console.log('Failed to initialize shaders');
        return;
    }
    gl.useProgram(gl.program);
 
    // Get attribute/uniform locations
    a_Position  = gl.getAttribLocation(gl.program, 'a_Position');
    a_TexCoord = gl.getAttribLocation(gl.program, 'a_TexCoord');
    a_Normal = gl.getAttribLocation(gl.program, 'a_Normal');

    u_FragColor = gl.getUniformLocation(gl.program, 'u_FragColor');
    u_ModelMatrix = gl.getUniformLocation(gl.program, 'u_ModelMatrix');
    u_texColorWeight = gl.getUniformLocation(gl.program, 'u_texColorWeight');
    u_ViewMatrix = gl.getUniformLocation(gl.program, 'u_ViewMatrix');
    u_ProjectionMatrix = gl.getUniformLocation(gl.program, 'u_ProjectionMatrix');

    u_Sampler0 = gl.getUniformLocation(gl.program, 'u_Sampler0');
    u_Sampler1 = gl.getUniformLocation(gl.program, 'u_Sampler1');
    u_Sampler2 = gl.getUniformLocation(gl.program, 'u_Sampler2');
    u_Sampler3 = gl.getUniformLocation(gl.program, 'u_Sampler3');
    u_Sampler4 = gl.getUniformLocation(gl.program, 'u_Sampler4');
    u_Sampler5 = gl.getUniformLocation(gl.program, 'u_Sampler5');
    u_Sampler6 = gl.getUniformLocation(gl.program, 'u_Sampler6');
    u_Sampler7 = gl.getUniformLocation(gl.program, 'u_Sampler7');
    u_Sampler8 = gl.getUniformLocation(gl.program, 'u_Sampler8');
    u_Sampler9 = gl.getUniformLocation(gl.program, 'u_Sampler9');
    u_Sampler10 = gl.getUniformLocation(gl.program, 'u_Sampler10');
    u_Sampler11 = gl.getUniformLocation(gl.program, 'u_Sampler11');

    u_TextureIndex = gl.getUniformLocation(gl.program, 'u_TextureIndex');
    u_NormalVisualization = gl.getUniformLocation(gl.program, 'u_NormalVisualization');
    gl.uniform1i(u_NormalVisualization, 0);
    u_NormalMatrix = gl.getUniformLocation(gl.program, 'u_NormalMatrix');

    u_LightPosition = gl.getUniformLocation(gl.program, 'u_LightPosition');
    u_LightColor = gl.getUniformLocation(gl.program, 'u_LightColor');
    u_LightEnabled = gl.getUniformLocation(gl.program, 'u_LightEnabled');
    gl.uniform1i(u_LightEnabled, 1);

    lightCube = new Cube();
    lightCube.color = [1, 1, 0.8, 1];
    lightCube.matrix.scale(10, 10, 10);
    lightCube.matrix.translate(g_lightPosition[0], g_lightPosition[1], g_lightPosition[2]);

    u_SpotLightPos = gl.getUniformLocation(gl.program, 'u_SpotLightPos');
    u_SpotLightDir = gl.getUniformLocation(gl.program, 'u_SpotLightDir');
    u_SpotLightLen = gl.getUniformLocation(gl.program, 'u_SpotLightLen');
    u_SpotLightOutLen = gl.getUniformLocation(gl.program, 'u_SpotLightOutLen');
    u_SpotLightColor = gl.getUniformLocation(gl.program, 'u_SpotLightColor');
    u_SpotLightIntensity = gl.getUniformLocation(gl.program, 'u_SpotLightIntensity');

    gl.uniform3f(u_SpotLightPos, 0, 15, -10);
    gl.uniform3f(u_SpotLightDir, 0, -1, 0);
    gl.uniform1f(u_SpotLightLen, Math.cos(12.5 * Math.PI / 180));
    gl.uniform1f(u_SpotLightOutLen, Math.cos(17.5 * Math.PI / 180));
    gl.uniform3f(u_SpotLightColor, 1.0, 1.0, 1.0);
    gl.uniform1f(u_SpotLightIntensity, 10.0);

    // Load textures
    try {
        // Sky texture
        gl.activeTexture(gl.TEXTURE0);
        g_texture0 = loadTexture(gl, 'lib/Textures/sky_box.jpg');
        gl.uniform1i(u_Sampler0, 0);

        // Ground texture
        gl.activeTexture(gl.TEXTURE1);
        g_texture1 = loadTexture(gl, 'lib/Textures/street.jpg');
        gl.uniform1i(u_Sampler1, 1);

        // Window textures
        const windowTextures = [
            'lib/Textures/windows1.jpg',
            'lib/Textures/windows2.jpg',
            'lib/Textures/windows3.jpg',
            'lib/Textures/windows4.jpg',
            'lib/Textures/windows5.jpg',
            'lib/Textures/windows6.jpg',
            'lib/Textures/windows7.jpg',
            'lib/Textures/windows8.jpg',
            'lib/Textures/windows9.jpg',
            'lib/Textures/windows10.jpg'
        ];

        const windowSamplers = [
            u_Sampler2,
            u_Sampler3,
            u_Sampler4,
            u_Sampler5,
            u_Sampler6,
            u_Sampler7,
            u_Sampler8,
            u_Sampler9,
            u_Sampler10,
            u_Sampler11
        ];

        for (let i = 0; i < 10; i++) {
            gl.activeTexture(gl.TEXTURE2 + i);
            g_textures[i+2] = loadTexture(gl, windowTextures[i]);
            gl.uniform1i(windowSamplers[i], 2+i);
        }

    } catch (err) {
        console.error('Failed to load textures:', err);
    }

    // Initialize model matrix to identity
    var identityM = new Matrix4();
    gl.uniformMatrix4fv(u_ModelMatrix, false, identityM.elements);

}

function loadTexture(gl, url) {
    return new Promise((resolve, reject) => {
        const texture = gl.createTexture();
        gl.bindTexture(gl.TEXTURE_2D, texture);

        gl.texImage2D(gl.TEXTURE_2D, 0, gl.RGBA, 1, 1, 0, gl.RGBA, gl.UNSIGNED_BYTE,
                new Uint8Array([255, 255, 255, 255]));

        const image = new Image();
        image.onload = function() {
            gl.bindTexture(gl.TEXTURE_2D, texture);
            gl.texImage2D(gl.TEXTURE_2D, 0, gl.RGBA, gl.RGBA, gl.UNSIGNED_BYTE, image);
            
            // Requires power of two textures to mipmap
            gl.generateMipmap(gl.TEXTURE_2D);
            resolve(texture)
        };

        image.onerror = function () {
            reject(`Failed to load texture at ${url}`);
        };
        image.src = url;
    });
}

// ----------------------------------------------------------------------------------------------------------------------------------
// Running program
// ----------------------------------------------------------------------------------------------------------------------------------
function tick(currentTime) {
    // convert time to deal with change in refresh rates
    currentTime *= 0.001;

    // Initialize prevTime at first frame
    if(g_prevTime === 0) {
        g_prevTime = currentTime;
    }

    // Calculate time since last frame
    deltaTime = currentTime - g_prevTime;
    g_prevTime = currentTime;

    fpsCounter++;
    if(currentTime - lastFpsUpdateTime >= 1) {
        currentFPS = fpsCounter;
        fpsCounter = 0;
        lastFpsUpdateTime = currentTime;
        fpsDisplayElement.textContent = `FPS: ${currentFPS.toFixed(0)}`
    }
    
    if (g_animateJump) {
        g_time += deltaTime;
        updateJumpAnimation(currentTime);
    }

    handleCameraMovement();
    renderAllShapes();

    requestAnimationFrame(tick);
}

function handleCameraMovement() {
    const moveSpeed = 10;
    const panSpeed = 2;

    if (keysPressed['w']) camera.moveForward(moveSpeed * deltaTime);
    if (keysPressed['s']) camera.moveBackward(moveSpeed * deltaTime);
    if (keysPressed['a']) camera.moveLeft(moveSpeed * deltaTime);
    if (keysPressed['d']) camera.moveRight(moveSpeed * deltaTime);
    if (keysPressed['q']) camera.panLeft(panSpeed * deltaTime); 
    if (keysPressed['e']) camera.panRight(panSpeed * deltaTime); 
}

// ----------------------------------------------------------------------------------------------------------------------------------
// Generate world
// ----------------------------------------------------------------------------------------------------------------------------------
function generateWallMap() {
    // Initialize empty map
    wallMap = [];
    for (let i = 0; i < 64; i++) {
        wallMap[i] = new Array(64).fill(null).map(() => ({
            height: 0,
            texture: null
        }));
    }

    // Fill with random heights (60% chance for a building, height 2-7)
    for (let x = 0; x < 64; x++) {
        for (let z = 0; z < 64; z++) {
            if (x % 2 === 0 && z % 2 === 0 && Math.random() < 0.6) {
                wallMap[x][z] = {
                    height: Math.floor(Math.random() * 5) + 2,
                    texture: windowTextureIndices[Math.floor(Math.random() * windowTextureIndices.length)]
                };
            }
        }
    }
}

function generateBuildings() {
    walls = [];

    for (let x = 0; x < 64; x++) {
        for (let z = 0; z < 64; z++) {
            const cell = wallMap[x][z];
            if (cell.height > 0) {
                const xPos = (x - 64/2) * scaleFactor + scaleFactor/2;
                const zPos = (z - 64/2) * scaleFactor + scaleFactor/2;
                const posTex = cell.texture || windowTextureIndices[Math.floor(Math.random() * windowTextureIndices.length)];

                for (let yLevel = 0; yLevel < cell.height; yLevel++) {
                    // Create building
                    let building = new Cube();
                    building.textureIndex = posTex;

                    // Position and scale the building
                    building.matrix.translate(xPos, yLevel * scaleFactor, zPos);
                    building.matrix.scale(scaleFactor, scaleFactor, scaleFactor);
                    walls.push(building);
                }

                if (!cell.texture) cell.texture = posTex;
            }
        }
    }
}

function initBuildingGeometry() {
    // Try the VAO extension
    const vaoExt = gl.getExtension('OES_vertex_array_object');
    if (!vaoExt) {
        console.error('VAO extensions not supported');
        return false;
    }

    buildingVertices = new Float32Array([
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
    ]);

    buildingTexCoords = new Float32Array([
        // Front face
        0, 0,  1, 0,  1, 1,   0, 0,  1, 1,  0, 1,
        // Left face
        0, 0,  1, 0,  1, 1,   0, 0,  1, 1,  0, 1, 
        // Right face
        0, 0,  1, 0,  1, 1,   0, 0,  1, 1,  0, 1, 
        // Back face
        0, 0,  1, 0,  1, 1,   0, 0,  1, 1,  0, 1, 
        // Bottom face
        0, 0,  1, 0,  1, 1,   0, 0,  1, 1,  0, 1, 
        // Top face
        0, 0,  1, 0,  1, 1,   0, 0,  1, 1,  0, 1, 
    ]);

    buildingNormals = [];
    for (let i = 0; i < buildingVertices.length; i += 9) {
        const v0 = new Vector3([buildingVertices[i], buildingVertices[i+1], buildingVertices[i+2]]);
        const v1 = new Vector3([buildingVertices[i+3], buildingVertices[i+4], buildingVertices[i+5]]);
        const v2 = new Vector3([buildingVertices[i+6], buildingVertices[i+7], buildingVertices[i+8]]);

        const edge1 = new Vector3(v1.elements).sub(v0);
        const edge2 = new Vector3(v2.elements).sub(v0);

        const buildingNormal = Vector3.cross(edge1, edge2);
        buildingNormal.normalize();
        buildingNormal.mul(-1);

        for (let j = 0; j < 3; j++) {
            buildingNormals.push(...buildingNormal.elements);
        }
    }

    buildingVAO = vaoExt.createVertexArrayOES();
    vaoExt.bindVertexArrayOES(buildingVAO);

    // Vertex positions
    const vertexBuffer = gl.createBuffer();
    gl.bindBuffer(gl.ARRAY_BUFFER, vertexBuffer);
    gl.bufferData(gl.ARRAY_BUFFER, buildingVertices, gl.STATIC_DRAW);
    gl.vertexAttribPointer(a_Position, 3, gl.FLOAT, false, 0, 0);
    gl.enableVertexAttribArray(a_Position);

    // Texture coordinates
    const texCoordBuffer = gl.createBuffer();
    gl.bindBuffer(gl.ARRAY_BUFFER, texCoordBuffer);
    gl.bufferData(gl.ARRAY_BUFFER, buildingTexCoords, gl.STATIC_DRAW);
    gl.vertexAttribPointer(a_TexCoord, 2, gl.FLOAT, false, 0, 0);
    gl.enableVertexAttribArray(a_TexCoord);

    // Face normals
    normalBuffer = gl.createBuffer();
    gl.bindBuffer(gl.ARRAY_BUFFER, normalBuffer);
    gl.bufferData(gl.ARRAY_BUFFER, new Float32Array(buildingNormals), gl.STATIC_DRAW);
    gl.vertexAttribPointer(a_Normal, 3, gl.FLOAT, false, 0, 0);
    gl.enableVertexAttribArray(a_Normal);

    vaoExt.bindVertexArrayOES(null);
    return true;
}

function renderBuildingsOptimized() {
    const vaoExt = gl.getExtension('OES_vertex_array_object');
    if (!vaoExt || !buildingVAO) {
        if (!initBuildingGeometry()) {
            // Fallback to low framerate if VAO's aren't supported
            for (let i = 0; i < walls.length; i++) { 
                const building = walls[i];
                gl.uniform1i(u_TextureIndex, building.textureIndex);
                building.render();
            }
            return;
        }
    }

    // Bind the VAO while drawing elements
    vaoExt.bindVertexArrayOES(buildingVAO);

    // Group buildings by texture for efficient rendering
    const textureGroups = {};
    walls.forEach(building => {
        if (!building.textureIndex) return;
        const texId = building.textureIndex;
        if (!textureGroups[texId]) {
            textureGroups[texId] = [];
        }
        textureGroups[texId].push(building);
    })

    // Render each texture group
    Object.entries(textureGroups).forEach(([texture, buildings]) => {
        gl.uniform1i(u_TextureIndex, parseInt(texture));

        buildings.forEach(building => {
            gl.uniformMatrix4fv(u_ModelMatrix, false, building.matrix.elements);
            gl.uniform4f(u_FragColor, ...building.color);
            gl.drawArrays(gl.TRIANGLES, 0, 36);
        });
    });
    
    vaoExt.bindVertexArrayOES(null);
}

// ----------------------------------------------------------------------------------------------------------------------------------
// World editing
// ----------------------------------------------------------------------------------------------------------------------------------
function worldToMap(x, z) {
    const scaleFactor = 100/64;
    const mapX = Math.floor((x + 32 * scaleFactor - scaleFactor/2) / scaleFactor);
    const mapZ = Math.floor((z + 32 * scaleFactor - scaleFactor/2) / scaleFactor);
    return [mapX, mapZ];
}

function getBlockInFront(distance = 5) {
    const groundIntersection = camera.getGroundIntersection();
    if (!groundIntersection) return [0, 0];

    const [x, z] = groundIntersection;
    return worldToMap(x, z);
}

function addBuilding() {
    const [x, z] = getBlockInFront();
    if (x < 0 || x >= 64 || z < 0 || z >= 64) return;

    if (wallMap[x][z].height === 0) {
        wallMap[x][z] = {
            height: Math.floor(Math.random() * 5) + 2,
            texture: windowTextureIndices[Math.floor(Math.random() * windowTextureIndices.length)]
        };
        generateBuildings();
        renderAllShapes();
    }
}

function removeBuilding() {
    const [x, z] = getBlockInFront();
    if (x < 0 || x >= 64 || z < 0 || z >= 64) return;

    if (wallMap[x][z].height > 0) {
        wallMap[x][z].height = 0;
        wallMap[x][z].texture = null;
        generateBuildings();
        renderAllShapes();
    }
}

function destroyBuildingsInRadius() {
    const [frogGridX, frogGridZ] = worldToMap(g_frogPosition[0], g_frogPosition[2]);
    const radius = 3; // 7 x 7 cells

    for (let x = frogGridX - radius; x <= frogGridX + radius; x++) {
        for (let z = frogGridZ - radius; z <= frogGridZ + radius; z++) {
            if (x >= 0 && x < 64 && z >= 0 && z < 64) {
                if (wallMap[x][z].height > 0) {
                    wallMap[x][z].height = 0;
                    wallMap[x][z].texture = null;
                    generateBuildings();
                }
            }
        }
    }
}

// ----------------------------------------------------------------------------------------------------------------------------------
// Rendering
// ----------------------------------------------------------------------------------------------------------------------------------
function renderAllShapes() {
    // Pass camera to projection and view matrices
    camera.updateProjectionMatrix(canvas.width / canvas.height);
    gl.uniformMatrix4fv(u_ViewMatrix, false, camera.viewMatrix.elements);
    gl.uniformMatrix4fv(u_ProjectionMatrix, false, camera.projectionMatrix.elements);

    clearCanvas();

    // Update light position and color
    gl.uniform3f(u_LightPosition, g_lightPosition[0], g_lightPosition[1], g_lightPosition[2]);
    gl.uniform3f(u_LightColor, g_lightColor[0], g_lightColor[1], g_lightColor[2]);
    lightCube.matrix.translate(g_lightPosition[0], g_lightPosition[1], g_lightPosition[2]);
    lightCube.matrix.scale(10, 10, 10);
    gl.uniform1f(u_texColorWeight, 0);
    lightCube.render();

    var lightSphere = new Sphere();
    lightSphere.color = g_lightColor;
    lightSphere.matrix.translate(g_lightPosition[0], g_lightPosition[1], g_lightPosition[2]);
    lightSphere.matrix.scale(2, 2, 2);
    gl.uniform1f(u_texColorWeight, 0);
    lightSphere.render();

    // Set up sky box
    var sky = new Cube();
    sky.textureIndex = 0;
    sky.color = [0.53, 0.81, 0.92, 1.0];
    sky.matrix.scale(500, 500, 500);
    sky.matrix.translate(-0.5, -0.5, -0.5);
    gl.uniform1i(u_TextureIndex, sky.textureIndex);
    sky.render();

    // Set up ground plane
    var ground = new Cube();
    ground.textureIndex = 1;
    ground.textureRepeat = true;
    ground.repeatCount = 64;
    ground.color = [0.25, 0.60, 0.03, 1.0];
    ground.matrix.scale(100, 0.005, 100);
    ground.matrix.translate(-0.5, 0, -0.5);
    ground.matrix.rotate(90, 1, 0, 0);
    gl.uniform1i(u_TextureIndex, ground.textureIndex);
    ground.render();

    // Buildings on ground plane
    //gl.uniform1i(u_InvertNormals, 1);
    renderBuildingsOptimized();
    //gl.uniform1i(u_InvertNormals, 0);

    var sphere = new Sphere();
    sphere.color = [1, 1, 1, 1];
    sphere.matrix.translate(0, 15, -10);
    sphere.matrix.scale(2, 2, 2);
    sphere.render();
    gl.uniform3f(u_SpotLightPos, 0, 15, -10);
    gl.uniform3f(u_SpotLightDir, 0, -1, -0.75);

    // Turn off texture for frog
    gl.uniform1f(u_texColorWeight, 0);


    // Body
    var belly = new Dodec();
    belly.color = [0.2, 0.8, 0.2, 1.0];
    belly.matrix.translate(g_frogPosition[0], g_frogPosition[1], g_frogPosition[2]);
    belly.matrix.scale(2, 2, 2);

    belly.matrix.rotate(g_currentRotation, 0, 1, 0);
    belly.matrix.rotate(belly.faceDownAngle - 4, belly.faceDownAxis.elements[0], belly.faceDownAxis.elements[1], belly.faceDownAxis.elements[2]);
    var bellyPosMat = new Matrix4(belly.matrix);
    belly.render();

    // Destroy buildings around frog
    destroyBuildingsInRadius();


    // 1st joints
    var head = new Dodec();
    head.color = belly.color;
    head.connectPart(bellyPosMat, 3, 0.65, 2.25);
    head.matrix.rotate(g_headAng, 0, 0, 1);
    var headPosMat = new Matrix4(head.matrix);
    head.render();

    var rShoulder = new Dodec();
    rShoulder.color = belly.color;
    rShoulder.connectPart(bellyPosMat, 2, 0.40, 2.5);
    rShoulder.matrix.rotate(g_rShoulderAng, 0, 1, 0);
    var rShoulderPosMat = new Matrix4(rShoulder.matrix);
    rShoulder.render();

    var lShoulder = new Dodec();
    lShoulder.color = belly.color;
    lShoulder.connectPart(bellyPosMat, 4, 0.40, 2.5);
    lShoulder.matrix.rotate(g_lShoulderAng, 0, 1, 0);
    var lShoulderPosMat = new Matrix4(lShoulder.matrix);
    lShoulder.render();

    var rThigh = new Dodec();
    rThigh.color = belly.color;
    rThigh.connectPart(bellyPosMat, 7, 0.50, 2);
    rThigh.matrix.rotate(g_rThighAng, 1, 0, 0);
    var rThighPosMat = new Matrix4(rThigh.matrix);
    rThigh.render();

    var lThigh = new Dodec();
    lThigh.color = belly.color;
    lThigh.connectPart(bellyPosMat, 10, 0.50, 2);
    lThigh.matrix.rotate(g_lThighAng, 1, 0, 0);
    var lThighPosMat = new Matrix4(lThigh.matrix);
    lThigh.render();

    // 2nd joints
    var rEye = new Dodec();
    rEye.color = [1, 1, 1, 1];
    rEye.connectPart(headPosMat, 2, 0.45, 2.2);
    var rEyePosMat = new Matrix4(rEye.matrix);
    rEye.render();

    var lEye = new Dodec();
    lEye.color = [1, 1, 1, 1];
    lEye.connectPart(headPosMat, 4, 0.45, 2.2);
    var lEyePosMat = new Matrix4(lEye.matrix);
    lEye.render();

    var rArm = new Dodec();
    rArm.color = rShoulder.color;
    rArm.connectPart(rShoulderPosMat, 2, 0.8, 1.5);
    var rArmPosMat = new Matrix4(rArm.matrix);
    rArm.render();

    var lArm = new Dodec();
    lArm.color = lShoulder.color;
    lArm.connectPart(lShoulderPosMat, 4, 0.8, 1.5);
    var lArmPosMat = new Matrix4(lArm.matrix);
    lArm.render();

    var rLeg = new Dodec();
    rLeg.color = rThigh.color;
    rLeg.connectPart(rThighPosMat, 8, 0.8, 1);
    rLeg.matrix.rotate(g_rLegAng, 1, 0, 0);
    var rLegPosMat = new Matrix4(rLeg.matrix);
    rLeg.render();

    var lLeg = new Dodec();
    lLeg.color = lThigh.color;
    lLeg.connectPart(lThighPosMat, 9, 0.8, 1);
    lLeg.matrix.rotate(g_lLegAng, 1, 0, 0);
    var lLegPosMat = new Matrix4(lLeg.matrix);
    lLeg.render();

    // 3rd joints
    var rPupil = new Dodec();
    rPupil.color = [0.1, 0.1, 0.1, 1];
    rPupil.connectPart(rEyePosMat, 2, 0.40, 2);
    rPupil.render();

    var lPupil = new Dodec();
    lPupil.color = [0.1, 0.1, 0.1, 1];
    lPupil.connectPart(lEyePosMat, 4, 0.40, 2);
    lPupil.render();

    var rHand = new Dodec();
    rHand.color = rArm.color;
    rHand.connectPart(rArmPosMat, 2, 0.7, 1.25);
    rHand.matrix.rotate(g_rHandAng, 1, 0, 0);
    var rHandPosMat = new Matrix4(rHand.matrix);
    rHand.render();

    var lHand = new Dodec();
    lHand.color = lArm.color;
    lHand.connectPart(lArmPosMat, 4, 0.7, 1.25);
    lHand.matrix.rotate(g_lHandAng, 1, 0, 0);
    var lHandPosMat = new Matrix4(lHand.matrix);
    lHand.render();

    var rKnee = new Dodec();
    rKnee.color = rLeg.color;
    rKnee.connectPart(rLegPosMat, 12, 0.65, 1.5);
    var rKneePosMat = new Matrix4(rKnee.matrix);
    rKnee.render();

    var lKnee = new Dodec();
    lKnee.color = lLeg.color;
    lKnee.connectPart(lLegPosMat, 12, 0.65, 1.5);
    var lKneePosMat = new Matrix4(lKnee.matrix);
    lKnee.render();

    // 4th joints
    var rFinger1 = new Dodec();
    rFinger1.color = rHand.color;
    rFinger1.connectPart(rHandPosMat, 3, 0.35, 3.5);
    var rFinger1PosMat = new Matrix4(rFinger1.matrix);
    rFinger1.render();

    var lFinger1 = new Dodec();
    lFinger1.color = lHand.color;
    lFinger1.connectPart(lHandPosMat, 3, 0.35, 3.5);
    var lFinger1PosMat = new Matrix4(lFinger1.matrix);
    lFinger1.render();

    var rFinger2 = new Dodec();
    rFinger2.color = rHand.color;
    rFinger2.connectPart(rHandPosMat, 2, 0.35, 3.5);
    var rFinger2PosMat = new Matrix4(rFinger2.matrix);
    rFinger2.render();

    var lFinger2 = new Dodec();
    lFinger2.color = lHand.color;
    lFinger2.connectPart(lHandPosMat, 4, 0.35, 3.5);
    var lFinger2PosMat = new Matrix4(lFinger2.matrix);
    lFinger2.render();

    var rFinger3 = new Dodec();
    rFinger3.color = rHand.color;
    rFinger3.connectPart(rHandPosMat, 6, 0.35, 3.5);
    var rFinger3PosMat = new Matrix4(rFinger3.matrix);
    rFinger3.render();

    var lFinger3 = new Dodec();
    lFinger3.color = lHand.color;
    lFinger3.connectPart(lHandPosMat, 5, 0.35, 3.5);
    var lFinger3PosMat = new Matrix4(lFinger3.matrix);
    lFinger3.render();

    var rFoot = new Dodec();
    rFoot.color = rKnee.color;
    rFoot.connectPart(rKneePosMat, 11, 1, 0.85);
    var rFootPosMat = new Matrix4(rFoot.matrix);
    rFoot.render();

    var lFoot = new Dodec();
    lFoot.color = lKnee.color;
    lFoot.connectPart(lKneePosMat, 11, 1, 0.85);
    var lFootPosMat = new Matrix4(lFoot.matrix);
    lFoot.render();

    // 5th joints
    var rFinger1l = new Dodec();
    rFinger1l.color = rFinger1.color;
    rFinger1l.connectPart(rFinger1PosMat, 3, 1, 1.25);
    rFinger1l.render();

    var lFinger1l = new Dodec();
    lFinger1l.color = lFinger1.color;
    lFinger1l.connectPart(lFinger1PosMat, 3, 1, 1.25);
    lFinger1l.render();

    var rFinger2l = new Dodec();
    rFinger2l.color = rFinger1.color;
    rFinger2l.connectPart(rFinger2PosMat, 2, 1, 1.25);
    rFinger2l.render();

    var lFinger2l = new Dodec();
    lFinger2l.color = lFinger1.color;
    lFinger2l.connectPart(lFinger2PosMat, 4, 1, 1.25);
    lFinger2l.render();

    var rFinger3l = new Dodec();
    rFinger3l.color = rFinger1.color;
    rFinger3l.connectPart(rFinger3PosMat, 6, 1, 1.25);
    rFinger3l.render();

    var lFinger3l = new Dodec();
    lFinger3l.color = lFinger1.color;
    lFinger3l.connectPart(lFinger3PosMat, 5, 1, 1.25);
    lFinger3l.render();

    var rToe1 = new Dodec();
    rToe1.color = rFoot.color;
    rToe1.connectPart(rFootPosMat, 5, 0.35, 3.5);
    rToe1.render();

    var lToe1 = new Dodec();
    lToe1.color = lFoot.color;
    lToe1.connectPart(lFootPosMat, 6, 0.35, 3.5);
    lToe1.render();

    var rToe2 = new Dodec();
    rToe2.color = rFoot.color;
    rToe2.connectPart(rFootPosMat, 6, 0.35, 3.5);
    rToe2.render();

    var lToe2 = new Dodec();
    lToe2.color = lFoot.color;
    lToe2.connectPart(lFootPosMat, 5, 0.35, 3.5);
    lToe2.render();

    var rToe3 = new Dodec();
    rToe3.color = rFoot.color;
    rToe3.connectPart(rFootPosMat, 7, 0.35, 3.5);
    rToe3.render();

    var lToe3 = new Dodec();
    lToe3.color = lFoot.color;
    lToe3.connectPart(lFootPosMat, 10, 0.35, 3.5);
    lToe3.render();

    // Staff
    var staffCent = new Dodec();
    staffCent.color = [.78, .47, .29, 1];
    staffCent.connectPart(lHandPosMat, 1, 0.75, 2);
    staffCent.matrix.rotate(-30, 0, 0, 1);
    staffCent.matrix.rotate(15, 0, 1, 0);
    var staffCentPosMat = new Matrix4(staffCent.matrix);
    staffCent.render();

    var staffUp = new Dodec();
    staffUp.color = staffCent.color;
    staffUp.connectPart(staffCentPosMat, 3, 1, 1.8);
    var staffUpPosMat = new Matrix4(staffUp.matrix);
    staffUp.render();

    var staffHead = new Dodec();
    staffHead.color = [.58, .27, .5, 1];
    staffHead.connectPart(staffUpPosMat, 3, 1.5, 1.5);
    staffHead.matrix.rotate(g_time, 0, 0, 1);
    staffHead.render();

    var staffDown = new Dodec();
    staffDown.color = staffCent.color;
    staffDown.connectPart(staffCentPosMat, 11, 1, 1.8);
    var staffDownPosMat = new Matrix4(staffDown.matrix);
    staffDown.render();

    var staffBottom = new Dodec();
    staffBottom.color = staffCent.color;
    staffBottom.connectPart(staffDownPosMat, 11, 1, 1.8);
    var staffDownPosMat = new Matrix4(staffBottom.matrix);
    staffBottom.render();
}

// ----------------------------------------------------------------------------------------------------------------------------------
// Animations
// ----------------------------------------------------------------------------------------------------------------------------------
function resetAnimation() {
    g_animateJump = false;
    g_animateSpell = false;
    g_time = 0;
    g_prevTime = 0;
    g_prevCast = 0;

    g_headAng = g_rShoulderAng = g_lShoulderAng = g_rThighAng = g_lThighAng = g_rHandAng = g_lHandAng = g_rLegAng = g_lLegAng = 0;
    renderAllShapes();
} 

function toggleJumpAnimation() {
    g_frogJumping = !g_frogJumping;
}

function updateJumpAnimation(currentTime) {
    // Animate light in a circle
    const lightRadius = 50;
    const lightSpeed = 0.5;
    g_lightPosition[0] = Math.sin(currentTime * lightSpeed) * lightRadius;
    g_lightPosition[2] = Math.cos(currentTime * lightSpeed) * lightRadius;

    // Gradient display color
    g_lightColor[0] = Math.sin(currentTime * lightSpeed + 0) * 0.25 + 1;
    g_lightColor[1] = Math.sin(currentTime * lightSpeed + 2) * 0.25 + 1;
    g_lightColor[2] = Math.sin(currentTime * lightSpeed + 4) * 0.25 + 1;

    // Update sliders
    if (lightSliderX) lightSliderX.value = g_lightPosition[0];
    if (lightSliderZ) lightSliderZ.value = g_lightPosition[2];

    if (lightSliderR) lightSliderR.value = g_lightColor[0];
    if (lightSliderG) lightSliderG.value = g_lightColor[1];
    if (lightSliderB) lightSliderB.value = g_lightColor[2];
    
    const elapsed = currentTime - g_jumpStartTime;
    let progress = (elapsed % JUMP_DURATION) / JUMP_DURATION;
    progress = Math.min(progress, 1);

    if (elapsed % JUMP_DURATION < deltaTime) {
        g_currentRotation = (g_currentRotation + g_targetRotation) % 360;
        g_targetRotation = Math.random() < 0.5 ? 45 : -45;
        g_jumpStartTime = currentTime;
    }

    // Calculate jump arc
    const jumpHeight = Math.sin(progress * Math.PI) * JUMP_HEIGHT;
    const totalForwardDistance = JUMP_DISTANCE;
    const currentForwardMovement = totalForwardDistance * progress;

    const rotationRad = g_currentRotation * Math.PI / 180;
    const deltaZ = -currentForwardMovement * Math.cos(rotationRad);
    const deltaX = -currentForwardMovement * Math.sin(rotationRad);

    g_frogPosition[2] += deltaZ * deltaTime;
    g_frogPosition[1] = 2.7 + jumpHeight;
    g_frogPosition[0] += deltaX * deltaTime;
    
    // Check map boundaries
    const mapSize = 32 * scaleFactor;
    if (Math.abs(g_frogPosition[0]) > mapSize) {
        g_frogPosition[0] = Math.sign(g_frogPosition[0]) * mapSize;
        g_targetRotation = (g_targetRotation + 30) % 360;
    }
    if (Math.abs(g_frogPosition[2]) > mapSize) {
        g_frogPosition[2] = Math.sign(g_frogPosition[2]) * mapSize;
        g_targetRotation = (g_targetRotation + 30) % 360;
    }

    // Update joint angles
    g_time = elapsed;
    updateJumpAnimationAngles(progress);
}

function updateJumpAnimationAngles(progress) {
    g_rShoulderAng = 45 * Math.cos(progress * Math.PI * 2);
    g_lShoulderAng = -45 * Math.cos(progress * Math.PI * 2);
    g_rThighAng = -45 * Math.cos(progress * Math.PI * 2) + 45;
    g_lThighAng = -45 * Math.cos(progress * Math.PI * 2) + 45;
    g_rLegAng = -45 * (-1 * Math.cos(progress * Math.PI * 2)) - 45;
    g_lLegAng = -45 * (-1 * Math.cos(progress * Math.PI * 2)) -45;
}