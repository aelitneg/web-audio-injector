'use strict';

import WebAudioInjectorClient from './client.js';

const webAudioInjectorClient = new WebAudioInjectorClient();

webAudioInjectorClient.initialize().catch(function (error) {
    console.error('Unhandled Exception', error);
});
