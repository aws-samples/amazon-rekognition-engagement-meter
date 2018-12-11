const request = require("request-promise-native");

module.exports = (event, context, callback) => {
  let timeout;
  const terminate = err => {
    clearTimeout(timeout);
    if (err) console.log(err);
    return callback(err);
  };

  const sendResponse = (status, data) => {
    const requestBody = JSON.stringify({
      Status: status,
      Reason: `Details: ${context.logStreamName}`,
      PhysicalResourceId: context.logStreamName,
      StackId: event.StackId,
      RequestId: event.RequestId,
      LogicalResourceId: event.LogicalResourceId,
      Data: data
    });

    const options = {
      url: event.ResponseURL,
      body: requestBody,
      method: "PUT"
    };

    console.log(`Making HTTP request to ${event.ResponseURL}: ${requestBody}`);

    return request(options)
      .then(() => terminate())
      .catch(err => terminate(err));
  };

  const executionTimeoutHandler = () =>
    sendResponse("FAILED").then(() =>
      callback(new Error("Function timed out"))
    );

  timeout = setTimeout(
    executionTimeoutHandler,
    context.getRemainingTimeInMillis() - 1000
  );

  return { sendResponse };
};
