const {
  API_GATEWAY,
  COGNITO_IDENTITY_POOL,
  FROM_BUCKET,
  TO_BUCKET
} = process.env;

const STATIC_FILES = ["index.html", "style.css"];
const CONFIG_FILENAME = "settings.json";

module.exports = s3 => {
  const copyFile = params => s3.copyObject(params).promise();

  const deleteFile = params => s3.deleteObject(params).promise();

  return {
    copyFiles: () => Promise.all(
      STATIC_FILES.map(file =>
        copyFile({
          ACL: "public-read",
          Bucket: TO_BUCKET,
          CopySource: `${FROM_BUCKET}/static/${file}`,
          Key: file
        })
      )
    ),

    removeFiles: () => Promise.all(
      [CONFIG_FILENAME, ...STATIC_FILES].map(file =>
        deleteFile({
          Bucket: TO_BUCKET,
          Key: file
        })
      )
    ),

    writeSettings: () => s3
      .putObject({
        ACL: "public-read",
        Bucket: TO_BUCKET,
        Key: CONFIG_FILENAME,
        Body: JSON.stringify({
          apiGateway: API_GATEWAY,
          cognitoIdentityPool: COGNITO_IDENTITY_POOL
        })
      })
      .promise()
  };
};
