const struct = require('python-struct');

const MEMORY_LIMIT = 681;

const equals = (a, b) =>
    a.length === b.length &&
    a.every((v, i) => v === b[i]);

module.exports = (data) => {
    if(!data) {
        return {
            error: 'Error - file is corrupt or has no data'
        };
    }

    let magic = String.fromCharCode(...data.slice(0,4));

    let [start, minor, major] = struct.unpack('<HBB', Buffer.from(data.slice(4, 8)));

    let [ chCount, frameCount, stepTime ] = struct.unpack('<IIB', Buffer.from(data.slice(10, 19)));

    let [ compressionType ] = struct.unpack('<B', Buffer.from(data.slice(20,21)));

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

    let prev_light = [];
    let prev_ramp = [];
    let prev_closure_1 = [];
    let prev_closure_2 = [];
    let count = 0;
    let pos = start;

    for(let i = 0; i < frameCount; i++) {
        validateFrame();
        pos += 30 + 16 + 2;
    }

    function validateFrame() {
        let lights = data.slice(pos, pos+30);
        let closures = data.slice(pos + 30, pos + 30 + 16);

        let light_state = Array.from(lights.map(b => b > 127 ? 1 : 0));
        let ramp_state = Array.from(lights.slice(0, 14).map(b => Math.min(Math.floor(b > 127 ? 255 - b : b / 2), 3)));
        let closure_state = Array.from(closures.map(b => Math.floor(Math.floor(b / 32) + 1) / 2));

        if(!equals(light_state, prev_light)) {
            prev_light = light_state
            count += 1
        }

        if(!equals(ramp_state, prev_ramp)) {
            prev_ramp = ramp_state
            count += 1
        }

        if(!equals(closure_state.slice(0, 10), prev_closure_1)) {
            prev_closure_1 = closure_state.slice(0, 10)
            count += 1
        }

        if(!equals(closure_state.slice(10), prev_closure_2)) {
            prev_closure_2 = closure_state.slice(10);
            count += 1
        }
    }

    return {
        frameCount,
        stepTime,
        durationSecs,
        memoryUsage: ((count / MEMORY_LIMIT) * 100).toFixed(2)
    }
};
