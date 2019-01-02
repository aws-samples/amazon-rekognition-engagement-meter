const {
  API_GATEWAY,
  COGNITO_IDENTITY_POOL,
  FROM_BUCKET,
  REGION,
  TO_BUCKET
} = process.env;

const CONFIG_FILENAME = "settings.js";
const FROM_PREFIX = "static/";

module.exports = s3 => {
  const copyFile = params => s3.copyObject(params).promise();
  const deleteFile = params => s3.deleteObject(params).promise();
  const listFiles = params => s3.listObjects(params).promise();

  return {
    copyFiles: () =>
      listFiles({
        Bucket: FROM_BUCKET,
        Prefix: FROM_PREFIX
      }).then(result =>
        Promise.all(
          result.Contents.map(file =>
            copyFile({
              ACL: "public-read",
              Bucket: TO_BUCKET,
              CopySource: `${FROM_BUCKET}/${file.Key}`,
              Key: file.Key.slice(FROM_PREFIX.length)
            })
          )
        )
      ),

    removeFiles: () =>
      listFiles({
        Bucket: TO_BUCKET
      }).then(result =>
        Promise.all(
          result.Contents.map(file => file.Key).map(file =>
            deleteFile({
              Bucket: TO_BUCKET,
              Key: file
            })
          )
        )
      ),

    writeSettings: () =>
      s3
        .putObject({
          ACL: "public-read",
          Bucket: TO_BUCKET,
          Key: CONFIG_FILENAME,
          Body: `window.rekognitionSettings = ${JSON.stringify({
            apiGateway: API_GATEWAY,
            cognitoIdentityPool: COGNITO_IDENTITY_POOL,
            region: REGION
          })};`
        })
        .promise()
  };
};
