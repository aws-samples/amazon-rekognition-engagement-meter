export default data => {
  const result = {
    happyometer: null,
    aggregate: null
  };

  const totals = {
    angry: 0,
    confused: 0,
    happy: 0,
    sad: 0,
    surprised: 0,
    total: 0
  };

  data.results.forEach(function(result) {
    totals.angry += parseInt(result.angry, 10);
    totals.confused += parseInt(result.confused, 10);
    totals.happy += parseInt(result.happy, 10);
    totals.sad += parseInt(result.sad, 10);
    totals.surprised += parseInt(result.surprised, 10);
    totals.total =
      totals.angry +
      totals.confused +
      totals.happy +
      totals.sad +
      totals.surprised;
  });

  if (totals.total > 0) {
    result.happyometer =
      Math.floor(
        (totals.happy / totals.total) * 100 +
          (totals.surprised / totals.total) * 100
      );

    result.aggregate = {
      angry: Math.floor((totals.angry / totals.total) * 100),
      confused: Math.floor((totals.confused / totals.total) * 100),
      happy: Math.floor((totals.happy / totals.total) * 100),
      sad: Math.floor((totals.sad / totals.total) * 100),
      surprised: Math.floor((totals.surprised / totals.total) * 100)
    };
  }
  return result;
};
