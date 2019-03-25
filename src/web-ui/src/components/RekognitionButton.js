import React, { useState } from "react";
import { Button } from "react-bootstrap";

export default props => {
  const [started, setStarted] = useState(false);

  return (
    <Button
      bsStyle={started ? "danger" : "success"}
      onClick={e => {
        setStarted(!started);
        props.onClick(e);
      }}
      disabled={!props.enabled}
    >
      {started ? "Stop" : "Start"} Rekognition
    </Button>
  );
};
