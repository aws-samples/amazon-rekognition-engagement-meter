export default person => {
  const result = {
    ageLow: person.AgeRange.Low,
    ageHigh: person.AgeRange.High,
    boundingBox: person.BoundingBox,
    emotions: {}
  };
  
  person.Emotions.forEach(emotion => {
    result.emotions[emotion.Type] = Math.floor(emotion.Confidence);
  });

  return result;
};
