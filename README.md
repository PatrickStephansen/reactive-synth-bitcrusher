# reactive-synth-bitcrusher

WASM implementation of a bitcrusher audio processing node compatible with the web audio API. Created for [reactive-synth](https://github.com/PatrickStephansen/reactive-synth), but usable elsewhere if I ever document how.

The bitcrusher is an AudioWorkletProcessor that reduces precision at sample level imitating a storage format with less bits available for storing each sample. Different modes change the behaviour for real number bit depths between each whole number.

## build

build command:

```bash
cargo build --features wee_alloc --release --target=wasm32-unknown-unknown && \
wasm-opt -Oz --strip-debug -o worklet/reactive_synth_bitcrusher.wasm \
target/wasm32-unknown-unknown/release/reactive_synth_bitcrusher.wasm
```
Inspect size with:

```bash
twiggy top -n 20 target/wasm32-unknown-unknown/release/reactive_synth_bitcrusher_opt.wasm
```

Run `npm link` from the worklet directory before trying to build the reactive-synth app (the dependent app not in this repo)

## test

`cargo test`

## usage example

Test harness page coming soon. For now see the real use in [reactive-synth](https://github.com/PatrickStephansen/reactive-synth).
