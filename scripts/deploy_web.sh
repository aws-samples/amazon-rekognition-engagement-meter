#!/bin/sh
cd src/web-ui
yarn run build
cd build
aws s3 rm s3://rekognition-engagement-meter/static --recursive
aws s3 cp . s3://rekognition-engagement-meter/static --recursive --acl public-read --exclude settings.js --exclude .DS_Store
