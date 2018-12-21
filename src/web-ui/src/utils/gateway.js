import request from "./request";

export default {
  detectFaces(image) {
    return request("/faces/detect", "post", { image });
  },

  getEngagement() {
    const timeDetected = new Date().getTime() - 3600 * 90;
    return request(`/engagement?timeDetected=${timeDetected}`);
  },

  getPeople() {
    return request("/people");
  },
  
  postEngagement(detectedFace) {
    const normalize = x => detectedFace.emotions[x] || 0;

    return request(`/engagement`, "post", {
      timeDetected: new Date().getTime(),
      angry: normalize("ANGRY"),
      confused: normalize("CONFUSED"),
      happy: normalize("HAPPY"),
      sad: normalize("SAD"),
      surprised: normalize("SURPRISED")
    });
  },

  searchFaces(image) {
    return request(`/faces/search`, "post", { image });
  }
};
