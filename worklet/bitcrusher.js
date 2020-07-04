const bytesPerMemorySlot = 32 / 8;

registerProcessor(
	"reactive-synth-bitcrusher",
	class Bitcrusher extends AudioWorkletProcessor {
		static get parameterDescriptors() {
			return [
				{
					name: "bitDepth",
					defaultValue: 8,
					minValue: 1,
					maxValue: 32,
					automationRate: "a-rate",
				},
			];
		}
		constructor() {
			super();
			this.fractionalBitDepthMode = "quantize-evenly";
			this.port.onmessage = this.handleMessage.bind(this);
			this.fractionalBitDepthModes = {
				trve: 0,
				"quantize-evenly": 1,
				continuous: 2,
			};
		}

		handleMessage(event) {
			if (
				event.data &&
				event.data.type === "change-fractional-bit-depth-mode"
			) {
				this.fractionalBitDepthMode = event.data.newMode;
				this.wasmModule.exports.set_mode(
					this.internalProcessorPtr,
					this.fractionalBitDepthModes[this.fractionalBitDepthMode]
				);
			}
			if (event.data && event.data.type === "wasm") {
				this.initWasmModule(event.data.wasmModule).then(() =>
					this.port.postMessage({ type: "module-ready", value: true })
				);
			}
		}

		async initWasmModule(wasmModule) {
			this.wasmModule = await WebAssembly.instantiate(wasmModule, {});
			this.internalProcessorPtr = this.wasmModule.exports.init(
				128,
				this.fractionalBitDepthModes[this.fractionalBitDepthMode]
			);
			this.float32WasmMemory = new Float32Array(
				this.wasmModule.exports.memory.buffer
			);
		}

		process(inputs, outputs, parameters) {
			// only process once wasm module ready and input plugged in
			if (inputs[0][0].length && this.wasmModule) {
				this.float32WasmMemory.set(
					inputs[0][0],
					this.wasmModule.exports.get_input_ptr(this.internalProcessorPtr) /
						bytesPerMemorySlot
				);
				this.float32WasmMemory.set(
					parameters.bitDepth,
					this.wasmModule.exports.get_bit_depth_ptr(this.internalProcessorPtr) /
						bytesPerMemorySlot
				);
				const outputPointer =
					this.wasmModule.exports.process_quantum(
						this.internalProcessorPtr,
						inputs[0][0].length,
						parameters.bitDepth.length
					) / bytesPerMemorySlot;
				// expect mono input and output, but deal with more channels without falling over (only first input channel used)
				for (
					let channelIndex = 0;
					channelIndex < outputs[0].length;
					channelIndex++
				) {
					for (
						let sample = 0;
						sample < outputs[0][channelIndex].length;
						sample++
					) {
						outputs[0][channelIndex][sample] = this.float32WasmMemory[
							outputPointer + sample
						];
					}
				}
			}

			// browsers don't conform to the spec, so always return true or the module will be silent forever
			return true;
		}
	}
);
