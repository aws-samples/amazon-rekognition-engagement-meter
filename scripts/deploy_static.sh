#!/bin/sh
aws s3 cp ./src/static s3://matteo-rekognition-demo-test/static --recursive --acl public-read --exclude settings.js