import React from "react";
import {
  VictoryArea,
  VictoryChart,
  VictoryContainer,
  VictoryPolarAxis,
  VictoryTheme
} from "victory";

export default props => {
  return (
    <VictoryChart
      polar
      theme={VictoryTheme.material}
      containerComponent={<VictoryContainer responsive={false} />}
      width={650}
      height={250}
      padding={{ top: 60, bottom: 60, left: 50, right: 180 }}
    >
      <VictoryArea
        data={props.data}
        style={{
          data: { fill: "#FF9900" }
        }}
      />
      <VictoryPolarAxis
        theme={VictoryTheme.material}
        style={{
          axis: { fill: "none" },
          tickLabels: { fill: "#fff" }
        }}
      />
    </VictoryChart>
  );
};
