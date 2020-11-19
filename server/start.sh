#!/bin/bash

docker build -t web-audio-injector-server . 

docker run -it web-audio-injector-server
