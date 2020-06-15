# reactive-synth-bitcrusher
WASM implementation of a bitcrusher audio processing node compatible with the web audio API

## build

build command:

```bash
cargo build --features wee_alloc --release --target=wasm32-unknown-unknown && \
wasm-opt -Oz --strip-debug -o target/wasm32-unknown-unknown/release/reactive_synth_bitcrusher_opt.wasm \
target/wasm32-unknown-unknown/release/reactive_synth_bitcrusher.wasm
```
Inspect size with:

```bash
twiggy top -n 20 target/wasm32-unknown-unknown/release/wasm_audio_nodes_opt.wasm
```

## package

from worklet directory:

```bash
npm run package
```
