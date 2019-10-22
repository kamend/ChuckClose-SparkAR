const D = require('Diagnostics');
const Scene = require('Scene');
const Shaders = require('Shaders');
const Materials = require("Materials");
const R = require("Reactive");
const CameraInfo = require('CameraInfo');
const Textures = require('Textures');
const Time = require('Time');

// chuck close effect: https://www.shadertoy.com/view/4sXyW7

const pixelSizeX  = R.div(1,CameraInfo.previewSize.width);
const pixelSizeY = R.div(1,CameraInfo.previewSize.height);

const size = 32
const sampleStep = 4

const mat = Materials.get("material0");
const cameraTexture = Textures.get("cameraTexture0");
const uvs = Shaders.fragmentStage(Shaders.vertexAttribute({'variableName': Shaders.VertexAttribute.TEX_COORDS}));

var originalColor = Shaders.textureSampler(cameraTexture.signal, uvs);

var resolution = R.pack2(CameraInfo.previewSize.width, CameraInfo.previewSize.height);

var absPos = R.mul(uvs, resolution);
var m = R.mod(absPos, size);
var newuvs = R.sub(absPos, m);

var f = R.mul(R.magnitude(R.sub(m, R.mul(size,0.5))), 0.666);

// move with time
f = R.sub(f, R.mul(Time.ms, 0.01));

var loopSteps = size / sampleStep;

var s1 = R.round(R.mod(f, loopSteps * loopSteps));
var s2 = R.round(R.mod(R.add(f,1), loopSteps * loopSteps));

var i1 = R.div(s1, size);
var j1 = R.mod(s1, size);
var i2 = R.div(s2, size);
var j2 = R.mod(s2, size);

var ij1 = R.pack2(i1, j1);
ij1 = R.add(ij1, newuvs);
ij1 = R.div(ij1, resolution);

var ij2 = R.pack2(i2, j2);
ij2 = R.add(ij2, newuvs);
ij2 = R.div(ij2, resolution);

var sampled1 = Shaders.textureSampler(cameraTexture.signal, ij1);
var sampled2 = Shaders.textureSampler(cameraTexture.signal, ij2);

var filtered = R.mix(sampled1, sampled2, R.mod(f, 1.0));

const textureSlot = Shaders.DefaultMaterialTextures.DIFFUSE
mat.setTexture(filtered, {textureSlotName: textureSlot});


