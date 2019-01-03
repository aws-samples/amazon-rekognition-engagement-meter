#!/bin/sh
aws cloudformation package --template-file ./src/cfn/template.yaml --s3-bucket rekognition-engagement-meter --output-template-file ./dist/template.yaml
aws s3 cp ./dist/template.yaml s3://rekognition-engagement-meter/ --acl public-read
aws cloudformation deploy --template-file ./dist/template.yaml --region eu-west-1 --capabilities CAPABILITY_IAM --parameter-overrides CollectionId=RekoDemo --stack-name rekodemo
