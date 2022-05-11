# Contributing Guidelines

Thank you for your interest in contributing to our project. Whether it's a bug report, new feature, correction, or additional 
documentation, we greatly value feedback and contributions from our community.

Please read through this document before submitting any issues or pull requests to ensure we have all the necessary 
information to effectively respond to your bug report or contribution.

## Index

* [Introduction](#introduction)
  * [Reporting Bugs/Feature Requests](#reporting-bugsfeature-requests)
  * [Contributing via Pull Requests](#contributing-via-pull-requests)
  * [Finding contributions to work on](#finding-contributions-to-work-on)
  * [Code of Conduct](#code-of-conduct)
  * [Security issue notifications](#security-issue-notifications)
  * [Licensing](#licensing)
* [Prerequisites](#prerequisites)
* [Working with CloudFormation](#working-with-cloudformation)
* [Working with the Web UI](#working-with-the-web-ui)

## Introduction

### Reporting Bugs/Feature Requests

We welcome you to use the GitHub issue tracker to report bugs or suggest features.

When filing an issue, please check [existing open](https://github.com/aws-samples/amazon-rekognition-engagement-meter/issues), or [recently closed](https://github.com/aws-samples/amazon-rekognition-engagement-meter/issues?utf8=%E2%9C%93&q=is%3Aissue%20is%3Aclosed%20), issues to make sure somebody else hasn't already 
reported the issue. Please try to include as much information as you can. Details like these are incredibly useful:

* A reproducible test case or series of steps
* The version of our code being used
* Any modifications you've made relevant to the bug
* Anything unusual about your environment or deployment


### Contributing via Pull Requests
Contributions via pull requests are much appreciated. Before sending us a pull request, please ensure that:

1. You are working against the latest source on the *master* branch.
2. You check existing open, and recently merged, pull requests to make sure someone else hasn't addressed the problem already.
3. You open an issue to discuss any significant work - we would hate for your time to be wasted.

To send us a pull request, please:

1. Fork the repository.
2. Modify the source; please focus on the specific change you are contributing. If you also reformat all the code, it will be hard for us to focus on your change.
3. Ensure local tests pass.
4. Commit to your fork using clear commit messages.
5. Send us a pull request, answering any default questions in the pull request interface.
6. Pay attention to any automated CI failures reported in the pull request, and stay involved in the conversation.

GitHub provides additional document on [forking a repository](https://help.github.com/articles/fork-a-repo/) and 
[creating a pull request](https://help.github.com/articles/creating-a-pull-request/).


### Finding contributions to work on
Looking at the existing issues is a great way to find something to contribute on. As our projects, by default, use the default GitHub issue labels (enhancement/bug/duplicate/help wanted/invalid/question/wontfix), looking at any ['help wanted'](https://github.com/aws-samples/amazon-rekognition-engagement-meter/labels/help%20wanted) issues is a great place to start. 


### Code of Conduct
This project has adopted the [Amazon Open Source Code of Conduct](https://aws.github.io/code-of-conduct). 
For more information see the [Code of Conduct FAQ](https://aws.github.io/code-of-conduct-faq) or contact 
opensource-codeofconduct@amazon.com with any additional questions or comments.


### Security issue notifications
If you discover a potential security issue in this project we ask that you notify AWS/Amazon Security via our [vulnerability reporting page](http://aws.amazon.com/security/vulnerability-reporting/). Please do **not** create a public github issue.


### Licensing

See the [LICENSE](https://github.com/aws-samples/amazon-rekognition-engagement-meter/blob/master/LICENSE) file for our project's licensing. We will ask you to confirm the licensing of your contribution.

We may ask you to sign a [Contributor License Agreement (CLA)](http://en.wikipedia.org/wiki/Contributor_License_Agreement) for larger changes.

## Prerequisites

The following applications are required to contribute:

* Node.js >=16.x and npm>=8.x
* AWS CLI

To start, run `npm install`.

## Working with CloudFormation

The CloudFormation source code is located inside the `src/cfn` directory. The template uses a custom resource for making some initial API calls to Amazon Rekognition and to populate the S3 bucket with the Web UI's static resources. The lambda source code is located inside the `src/functions/setup` directory.

## Working with the Web UI

To develop a local version of the web UI:
1. Deploy the CloudFormation template.
2. Once the CloudFormation stack is deployed, a `url` output will be available from CloudFormation in the format of `https://<s3-bucket-url>/index.html`. Download the file `https://<s3-bucket-url>/settings.js` to the `src/web-ui/public/` folder. In this way, it will be possible to develop locally using the API Gateway and Cognito Pool Id that CloudFormation just created in AWS. Note that the `settings.js` is "*gitignored*".
3. Run `npm start`. The browser will automatically open the UI with hot reloading enabled.
To make changes, edit the files in the `src/web-ui` folder. 
