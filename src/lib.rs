// When the `wee_alloc` feature is enabled, use `wee_alloc` as the global
// allocator.
#[cfg(feature = "wee_alloc")]
#[global_allocator]
static ALLOC: wee_alloc::WeeAlloc = wee_alloc::WeeAlloc::INIT;

fn clamp(min_value: f32, max_value: f32, value: f32) -> f32 {
	if value < min_value {
		return min_value;
	} else {
		if value > max_value {
			return max_value;
		} else {
			return value;
		}
	};
}

fn get_parameter(param: &Vec<f32>, min_value: f32, max_value: f32, index: usize) -> f32 {
	if param.len() > 1 {
		clamp(min_value, max_value, param[index])
	} else {
		if param.len() == 0 {
			clamp(min_value, max_value, 0.0)
		} else {
			clamp(min_value, max_value, param[0])
		}
	}
}

fn crush(sample: f32, bit_depth: f32, mode: CrushMode) -> f32 {
	let mut bits = bit_depth;
	if mode == CrushMode::Trve {
		bits = bit_depth.floor();
	}
	let mut number_of_steps = 2.0_f32.powf(bits);
	if mode == CrushMode::Even {
		number_of_steps = number_of_steps.floor();
	}
	let step_size = 2.0_f32 / number_of_steps;
	let max = 1.0_f32 - step_size;
	let min = -1.0_f32;
	if sample >= max {
		return max;
	}
	if sample <= min {
		return min;
	}

	return min + ((1.0_f32 + sample) / step_size).floor() * step_size;
}
#[derive(Copy, Clone, PartialEq)]
#[repr(i64)]
pub enum CrushMode {
	Trve = 0,
	Even = 1,
	Continuous = 2,
}

impl CrushMode {
	pub fn from_i32(code: i32) -> CrushMode {
		match code {
			x if x <= 0 => CrushMode::Trve,
			x if x == 1 => CrushMode::Even,
			x if x >= 2 => CrushMode::Continuous,
			_ => CrushMode::Even,
		}
	}
}

pub struct Bitcrusher {
	input: Vec<f32>,
	bit_depth: Vec<f32>,
	mode: CrushMode,
	render_quantum_samples: usize,
	output: Vec<f32>,
}

impl Bitcrusher {
	pub fn new(render_quantum_samples: usize, mode: CrushMode) -> Bitcrusher {
		let mut output = Vec::with_capacity(render_quantum_samples);
		output.resize(render_quantum_samples, 0.0);
		Bitcrusher {
			input: Vec::with_capacity(render_quantum_samples),
			bit_depth: Vec::with_capacity(render_quantum_samples),
			mode,
			render_quantum_samples,
			output,
		}
	}

	pub fn process(&mut self) {
		for sample_index in 0..self.render_quantum_samples {
			self.output[sample_index] = crush(
				self.input[sample_index],
				get_parameter(&self.bit_depth, 0.0, 32.0, sample_index),
				self.mode,
			)
		}
	}

	pub fn get_output(&self) -> *const f32 {
		self.output.as_ptr()
	}

	pub fn set_inputs(&mut self, input: Vec<f32>, bit_depth: Vec<f32>) {
		self.input = input;
		self.bit_depth = bit_depth;
	}
}

#[no_mangle]
pub unsafe extern "C" fn init(render_quantum_samples: i32, mode: i32) -> *mut Bitcrusher {
	Box::into_raw(Box::new(Bitcrusher::new(
		render_quantum_samples as usize,
		CrushMode::from_i32(mode),
	)))
}

#[no_mangle]
pub unsafe extern "C" fn process_quantum(
	me: *mut Bitcrusher,
	input_length: usize,
	bit_depth_length: usize,
) -> *const f32 {
	// the expectation is that the parameters are copied directly into memory before this is called
	// so fix the length if it changed
	(*me).input.set_len(input_length);
	(*me).bit_depth.set_len(bit_depth_length);
	(*me).process();
	(*me).get_output()
}

#[no_mangle]
pub unsafe extern "C" fn get_input_ptr(me: *mut Bitcrusher) -> *mut f32 {
	(*me).input.as_mut_ptr()
}
#[no_mangle]
pub unsafe extern "C" fn get_bit_depth_ptr(me: *mut Bitcrusher) -> *mut f32 {
	(*me).bit_depth.as_mut_ptr()
}

#[no_mangle]
pub unsafe extern "C" fn set_mode(me: *mut Bitcrusher, mode: i32) {
	(*me).mode = CrushMode::from_i32(mode)
}
