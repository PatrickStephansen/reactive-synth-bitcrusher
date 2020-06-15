console.warn(
  "Attempted to load worklet as module: reactive-synth-bitcrusher. This is not the way to use this package. Rather serve bitcrusher.js and reactive_synth_bitcrusher.wasm as static resources, load the js file with AudioContext.audioWorklet.addModule('/your-static-assets/bitcrusher.js'). Fetch the wasm file, call .arrayBuffer() on the fetch response, and post the binary to any instances of the worklet node (audioWorkletNodeInstance.port.postMessage({type:'wasm', wasmBinary}))"
);
export default "import is not the way to use reactive-synth-bitcrusher";
