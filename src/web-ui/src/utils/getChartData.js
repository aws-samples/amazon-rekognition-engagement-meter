export default data => {
  const output = {
    happyometer: null,
    aggregate: null
  };

  const totals = {
    angry: 0,
    calm: 0,
    happy: 0,
    sad: 0,
    surprised: 0,
    total: 0
  };

  data.results.forEach(function(result) {
    totals.angry += parseInt(result.angry, 10);
    totals.calm += parseInt(result.calm, 10);
    totals.happy += parseInt(result.happy, 10);
    totals.sad += parseInt(result.sad, 10);
    totals.surprised += parseInt(result.surprised, 10);
    totals.total =
      totals.angry +
      totals.calm +
      totals.happy +
      totals.sad +
      totals.surprised;
  });

  if (totals.total > 0) {
    output.happyometer = Math.floor(
      (totals.happy / totals.total) * 100 +
        (totals.surprised / totals.total) * 100
    );

    output.aggregate = {
      angry: Math.floor((totals.angry / totals.total) * 100),
      calm: Math.floor((totals.calm / totals.total) * 100),
      happy: Math.floor((totals.happy / totals.total) * 100),
      sad: Math.floor((totals.sad / totals.total) * 100),
      surprised: Math.floor((totals.surprised / totals.total) * 100)
    };
  }
  return output;
};
