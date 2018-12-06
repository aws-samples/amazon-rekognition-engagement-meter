const AWS = require("aws-sdk");

const {
  API_GATEWAY,
  COGNITO_IDENTITY_POOL,
  COLLECTION_ID,
  FROM_BUCKET,
  REGION,
  TO_BUCKET
} = process.env;

const STATIC_FILES = ["index.html", "style.css"];
const CONFIG_FILENAME = "settings.json";

exports.handler = (event, context, callback) => {
  const rekognition = new AWS.Rekognition({ region: REGION });
  const s3 = new AWS.S3();

  const copyFile = params => s3.copyObject(params).promise();

  const copyFiles = Promise.all(
    STATIC_FILES.map(file =>
      copyFile({
        ACL: 'public-read',
        Bucket: TO_BUCKET,
        CopySource: `${FROM_BUCKET}/static/${file}`,
        Key: file
      })
    )
  );

  const writeSettings = s3
    .putObject({
      Bucket: TO_BUCKET,
      Key: CONFIG_FILENAME,
      Body: JSON.stringify({
        apiGateway: API_GATEWAY,
        cognitoIdentityPool: COGNITO_IDENTITY_POOL
      })
    })
    .promise();

  const createRekognitionCollection = rekognition
    .createCollection({ CollectionId: COLLECTION_ID })
    .promise();

  Promise.all([copyFiles, writeSettings, createRekognitionCollection])
    .then(() => callback(null, { success: true }))
    .catch(err => callback(err));
};
