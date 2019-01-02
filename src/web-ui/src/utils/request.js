import Amplify, { API } from "aws-amplify";

const region = window.rekognitionSettings.region || "eu-west-1";

Amplify.configure({
  Auth: {
    identityPoolId: window.rekognitionSettings.cognitoIdentityPool,
    region
  },
  API: {
    endpoints: [
      {
        name: "apiGateway",
        endpoint: window.rekognitionSettings.apiGateway,
        region
      }
    ]
  }
});

export default (url, method, data) =>
  API[method || "get"]("apiGateway", url, {
    body: data || undefined,
    headers: { "Content-Type": "application/json" }
  });
