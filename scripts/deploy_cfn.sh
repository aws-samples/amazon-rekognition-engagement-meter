#!/bin/sh

# Bundle and package the lambda custom resource
# The lambda will be super small as it's dependency-free and minified.
npm run build-lambda

# Package the CFN template - the lambda will be packaged as static
# dependency and upladed to S3 at this stage.
# If left as is, the template would be deployable only in the same region as
# the S3 bucket.
aws cloudformation package --template-file ./src/cfn/template.yaml --s3-bucket rekognition-engagement-meter --output-template-file ./dist/template.yaml

# By inlining the lambda rather then using the s3 link, the CFN template
# is deployable from any region.
npm run inline-lambda

# Uploading the template in the bucket root too as public
aws s3 cp ./dist/template.yaml s3://rekognition-engagement-meter/ --acl public-read

# Deploying the stack in the test account
aws cloudformation deploy --template-file ./dist/template.yaml --region eu-west-1 --capabilities CAPABILITY_IAM --parameter-overrides CollectionId=RekoDemo --stack-name rekodemo
