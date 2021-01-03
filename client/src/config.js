'use strict;';

const CONFIG = Object.freeze({
    BYTES_PER_STATE: Int32Array.BYTES_PER_ELEMENT,
    BYTES_PER_SAMPLE: Float32Array.BYTES_PER_ELEMENT,
    STATE_BUFFER_LENGTH: 4,
    AUDIO_BUFFER_LENGTH: 4096,
    KERNEL_LENGTH: 1024,
    CHANNEL_COUNT: 1,
    STATE: {
        REQUEST_RENDER: 0,
        SAMPLES_AVAILABLE: 1,
        READ_INDEX: 2,
        WRITE_INDEX: 3,
    },
});

export default CONFIG;