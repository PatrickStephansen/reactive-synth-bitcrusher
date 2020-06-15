!function(t){var e={};function r(o){if(e[o])return e[o].exports;var s=e[o]={i:o,l:!1,exports:{}};return t[o].call(s.exports,s,s.exports,r),s.l=!0,s.exports}r.m=t,r.c=e,r.d=function(t,e,o){r.o(t,e)||Object.defineProperty(t,e,{enumerable:!0,get:o})},r.r=function(t){"undefined"!=typeof Symbol&&Symbol.toStringTag&&Object.defineProperty(t,Symbol.toStringTag,{value:"Module"}),Object.defineProperty(t,"__esModule",{value:!0})},r.t=function(t,e){if(1&e&&(t=r(t)),8&e)return t;if(4&e&&"object"==typeof t&&t&&t.__esModule)return t;var o=Object.create(null);if(r.r(o),Object.defineProperty(o,"default",{enumerable:!0,value:t}),2&e&&"string"!=typeof t)for(var s in t)r.d(o,s,function(e){return t[e]}.bind(null,s));return o},r.n=function(t){var e=t&&t.__esModule?function(){return t.default}:function(){return t};return r.d(e,"a",e),e},r.o=function(t,e){return Object.prototype.hasOwnProperty.call(t,e)},r.p="",r(r.s=0)}([function(t,e){registerProcessor("reactive-synth-bitcrusher",class extends AudioWorkletProcessor{static get parameterDescriptors(){return[{name:"bitDepth",defaultValue:8,minValue:1,maxValue:32,automationRate:"a-rate"}]}constructor(){super(),this.fractionalBitDepthMode="quantize-evenly",this.port.onmessage=this.handleMessage.bind(this),this.fractionalBitDepthModes={trve:0,"quantize-evenly":1,continuous:2}}handleMessage(t){t.data&&"change-fractional-bit-depth-mode"===t.data.type&&(this.fractionalBitDepthMode=t.data.newMode,this.wasmModule.exports.set_mode(this.internalProcessorPtr,this.fractionalBitDepthModes[this.fractionalBitDepthMode])),t.data&&"wasm"===t.data.type&&this.initWasmModule(t.data.wasmBinary)}async initWasmModule(t){const e=await WebAssembly.compile(t);this.wasmModule=await WebAssembly.instantiate(e,{}),this.internalProcessorPtr=this.wasmModule.exports.init(128,this.fractionalBitDepthModes[this.fractionalBitDepthMode]),this.float32WasmMemory=new Float32Array(this.wasmModule.exports.memory.buffer)}process(t,e,r){if(t[0][0].length&&this.wasmModule){this.float32WasmMemory.set(t[0][0],this.wasmModule.exports.get_input_ptr(this.internalProcessorPtr)/4),this.float32WasmMemory.set(r.bitDepth,this.wasmModule.exports.get_bit_depth_ptr(this.internalProcessorPtr)/4);const o=this.wasmModule.exports.process_quantum(this.internalProcessorPtr,t[0][0].length,r.bitDepth.length)/4;for(let t=0;t<e[0].length;t++)for(let r=0;r<e[0][t].length;r++)e[0][t][r]=this.float32WasmMemory[o+r]}return!0}})}]);
//# sourceMappingURL=bitcrusher.js.map