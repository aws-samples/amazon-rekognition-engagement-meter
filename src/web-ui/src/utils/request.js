import axios from "axios";

export default (url, method, data) =>
  axios({
    data: data || undefined,
    headers: { "Content-Type": "application/json" },
    method: method || "get",
    url: window.rekognitionSettings.apiGateway + url
  });
