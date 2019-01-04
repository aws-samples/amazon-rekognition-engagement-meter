#!/bin/sh

# Package the CFN template. The lambda will be packaged as static dependency and upladed to S3
aws cloudformation package --template-file ./src/cfn/template.yaml --s3-bucket rekognition-engagement-meter --output-template-file ./dist/template.yaml

# Ensuring the lambda is publicly accessible
LAMBDA_URL="$(cat ./dist/template.yaml | shyaml get-value Resources.LambdaSetup.Properties.CodeUri)"
KEY="$(echo $LAMBDA_URL | sed 's/.*\///')"
aws s3api put-object-acl --acl public-read --bucket rekognition-engagement-meter --key $KEY

# Uploading the template in the bucket root too as public
aws s3 cp ./dist/template.yaml s3://rekognition-engagement-meter/ --acl public-read

# Deploying the stack in the test account
aws cloudformation deploy --template-file ./dist/template.yaml --region eu-west-1 --capabilities CAPABILITY_IAM --parameter-overrides CollectionId=RekoDemo --stack-name rekodemo
