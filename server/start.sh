#!/bin/bash

docker build --no-cache -t web-audio-injector-server . 

docker run \
    -it \
    -p 3000:3000 \
    --rm \
    web-audio-injector-server
