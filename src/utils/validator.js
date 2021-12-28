/**
 *
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

  let magic = String.fromCharCode(...new Uint8Array(data.slice(0,4)));
  let start = new DataView(data.slice(4, 6)).getUint8(0);
  let minor = new DataView(data.slice(6, 7)).getUint8(0);
  let major = new DataView(data.slice(7, 8)).getUint8(0);
  let chCount = new DataView(data.slice(10, 14)).getUint32(0, true);
  let frameCount = new DataView(data.slice(14, 18)).getUint32(0, true);
  let stepTime = new DataView(data.slice(18, 19)).getUint8(0);
  let compressionType = new DataView(data.slice(20, 21)).getUint8(0);

  if (magic !== 'PSEQ' || start < 24 || frameCount < 1 || stepTime < 15 || minor !== 0 || major !== 2) {
    return {
      error: 'Unknown file format, expected FSEQ v2.0'
    };
  }

  if (chCount !== 48) {
    return {
      error: `Expected 48 channels, got ${chCount}`
    };
  }

  if (compressionType !== 0) {
    return {
      error: 'Expected file format to be V2 Uncompressed'
    }
  }

  let durationSecs = (frameCount * stepTime / 1000);
  let durationFormatted = new Date(durationSecs * 1000).toISOString().substr(11, 12);
  if (durationSecs > 5 * 60) {
    return {
      error: `Expected total duration to be less than 5 minutes, got ${durationFormatted}`
    }
  }

  let prevLight = [];
  let prevRamp = [];
  let prevClosure1 = [];
  let prevClosure2 = [];
  let count = 0;
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
      count++
    }

    if(!arraysEqual(ramp_state, prevRamp)) {
      prevRamp = ramp_state
      count++
    }

    if(!arraysEqual(closure_state.slice(0, 10), prevClosure1)) {
      prevClosure1 = closure_state.slice(0, 10)
      count++
    }

    if(!arraysEqual(closure_state.slice(10), prevClosure2)) {
      prevClosure2 = closure_state.slice(10);
      count++
    }

    pos += GAP;
  }

  const memoryUsage = count / MEMORY_LIMIT;

  if(memoryUsage > 1) {
    return {
      error: `Sequence uses ${count} commands. The maximum allowed is ${MEMORY_LIMIT}`
    }
  }

  return {
    frameCount,
    stepTime,
    durationSecs,
    memoryUsage
  }
}
