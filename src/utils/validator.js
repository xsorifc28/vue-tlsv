/**
 * Validates a FSEQ file per specs defined at https://github.com/teslamotors/light-show
 * @param {{ArrayBuffer}} data
 * @returns {{error: string}|{frameCount: number, memoryUsage: number, durationSecs: number, stepTime: number}}
 */
export default (data) => {
  const MEMORY_LIMIT = 681;
  const arraysEqual = (a, b) => a.length === b.length && a.every((v, i) => v === b[i]);

  if(!data) {
    return {
      error: 'Error - file is corrupt or has no data'
    };
  }

  let error;

  let magic = String.fromCharCode(...new Uint8Array(data.slice(0,4)));

  let header = new DataView(data.slice(0, 22));

  let start = header.getUint8(4);
  let minor = header.getUint8(6);
  let major = header.getUint8(7);
  let chCount = header.getUint32(10, true);
  let frameCount = header.getUint32(14, true);
  let stepTime = header.getUint8(18);
  let compressionType = header.getUint8(20);

  if (magic !== 'PSEQ' || start < 24 || frameCount < 1 || stepTime < 15 || minor !== 0 || major !== 2) {
    return {
      error: 'Unknown file format, expected FSEQ v2.0'
    };
  }

  if (chCount !== 48) {
    error = `Expected 48 channels, got ${chCount}`
  }

  if (compressionType !== 0) {
    error = 'Expected file format to be V2 Uncompressed';
  }

  let durationSecs = (frameCount * stepTime / 1000);
  let durationFormatted = new Date(durationSecs * 1000).toISOString().substr(11, 12);
  if (durationSecs > 5 * 60) {
    error = `Expected total duration to be less than 5 minutes, got ${durationFormatted}`
  }

  let prevLight = [];
  let prevRamp = [];
  let prevClosure1 = [];
  let prevClosure2 = [];
  let commandCount = 0;
  let pos = start;

  const LIGHT_BUFFER_LEN = 30;
  const CLOSURE_BUFFER_LEN = 16;
  const GAP = 2;

  for(let i = 0; i < frameCount; i++) {
    let lights = new Uint8Array(data.slice(pos, pos + LIGHT_BUFFER_LEN));
    pos += LIGHT_BUFFER_LEN;

    let closures = new Uint8Array(data.slice(pos, pos + CLOSURE_BUFFER_LEN));
    pos += CLOSURE_BUFFER_LEN;

    let light_state = Array.from(lights.map(b => b > 127 ? 1 : 0));
    let ramp_state = Array.from(lights.slice(0, 14).map(b => Math.min((Math.floor((b > 127 ? 255 - b : b) / 13) + 1) / 2, 3)));
    let closure_state = Array.from(closures.map(b => Math.floor(Math.floor(b / 32) + 1) / 2));

    if(!arraysEqual(light_state, prevLight)) {
      prevLight = light_state
      commandCount++
    }

    if(!arraysEqual(ramp_state, prevRamp)) {
      prevRamp = ramp_state
      commandCount++
    }

    if(!arraysEqual(closure_state.slice(0, 10), prevClosure1)) {
      prevClosure1 = closure_state.slice(0, 10)
      commandCount++
    }

    if(!arraysEqual(closure_state.slice(10), prevClosure2)) {
      prevClosure2 = closure_state.slice(10);
      commandCount++
    }

    pos += GAP;
  }

  const memoryUsage = commandCount / MEMORY_LIMIT;

  if(memoryUsage > 1) {
    const memoryUsageFormatted = parseFloat((memoryUsage * 100).toFixed(2))
    error = `Used ${memoryUsageFormatted}% of available memory! Sequence uses ${commandCount} commands, but the maximum allowed is ${MEMORY_LIMIT}!`
  }

  return {
    frameCount,
    stepTime,
    durationSecs,
    memoryUsage,
    commandCount,
    error,
  }
}
