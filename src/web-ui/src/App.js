import React, { useRef, useState } from "react";
import { findDOMNode } from "react-dom";
import Webcam from "react-webcam";
import { HalfCircleMeter } from "react-svg-meters";
import { Col, Grid, Row } from "react-bootstrap";

import CameraHelp from "./components/CameraHelp";
import EngagementSummary from "./components/EngagementsSummary";
import Header from "./components/Header";
import PolarChart from "./components/PolarChart";
import SettingsHelp from "./components/SettingsHelp";

import faceDetailsMapper from "./utils/faceDetailsMapper";
import getChartData from "./utils/getChartData";
import gateway from "./utils/gateway";

export default () => {
  const [aggregate, setAggregate] = useState({
    angry: 0,
    calm: 0,
    happy: 0,
    sad: 0,
    surprised: 0
  });

  const [detectedFaces, setDetectedFaces] = useState([]);
  const [detectedPeople, setDetectedPeople] = useState([]);
  const [happyometer, setHappyometer] = useState(50);
  const [readyToStream, setReadyToStream] = useState(false);
  const [webcamCoordinates, setWebcamCoordinates] = useState({});

  const iterating = useRef(false);
  const people = useRef([]);
  const webcam = useRef(undefined);

  const addUser = params => gateway.addUser(params);

  const getSnapshot = () => {
    setWebcamCoordinates(findDOMNode(webcam.current).getBoundingClientRect());

    const image = webcam.current.getScreenshot();
    const b64Encoded = image.split(",")[1];

    gateway.getEngagement().then(response => {
      const chartData = getChartData(response);

      if (chartData.happyometer) {
        setHappyometer(chartData.happyometer);
      }

      if (chartData.aggregate) {
        setAggregate(chartData.aggregate);
      }
    });

    gateway.detectFaces(b64Encoded).then(response => {
      const detectedFaces = response.FaceDetails.map(person => {
        const result = faceDetailsMapper(person);
        gateway.postEngagement(result).then(() => {});
        return result;
      });
      setDetectedFaces(detectedFaces);

      if (iterating.current) {
        setTimeout(getSnapshot, 300);
      }
    });

    gateway.searchFaces(b64Encoded).then(response => {
      const detectedPeople = [];
      if (response.FaceMatches) {
        response.FaceMatches.forEach(match => {
          const externalImageId = match.Face.ExternalImageId;
          detectedPeople.push(
            people.current.find(x => x.externalImageId === externalImageId)
          );
        });
      }
      setDetectedPeople(detectedPeople);
    });
  };

  const setupWebcam = instance => {
    webcam.current = instance;

    const checkIfReady = () => {
      if (
        webcam.current &&
        webcam.current.state &&
        webcam.current.state.hasUserMedia
      ) {
        setReadyToStream(true);
      } else setTimeout(checkIfReady, 250);
    };

    checkIfReady();
  };

  const toggleRekognition = () => {
    iterating.current = !iterating.current;

    if (iterating.current) {
      gateway.getPeople().then(response => {
        people.current = response.people;
        getSnapshot();
      });
    }
  };

  return (
    <div className="App">
      <Header
        toggleRekognition={toggleRekognition}
        addUser={addUser}
        readyToStream={readyToStream}
      />
      <Grid>
        <SettingsHelp show={!window.rekognitionSettings} />
        <CameraHelp show={!readyToStream} />
        <Row>
          <Col md={12} sm={6}>
            <Grid>
              <Row>
                <Col md={8} sm={6}>
                  <Webcam
                    ref={setupWebcam}
                    screenshotFormat="image/jpeg"
                    videoConstraints={{
                      width: 1280,
                      height: 640,
                      facingMode: "user"
                    }}
                    width="100%"
                    height="100%"
                  />
                  <Grid>
                    <Row style={{ marginTop: "20px" }}>
                      <Col md={4} sm={3}>
                        <h3>Trends for last hour</h3>
                        <PolarChart
                          data={Object.keys(aggregate).map(sentiment => ({
                            x: sentiment,
                            y: aggregate[sentiment]
                          }))}
                        />
                      </Col>
                      <Col md={4} sm={3}>
                        <h3 style={{ marginBottom: "40px" }}>
                          Engagement Meter
                        </h3>
                        <HalfCircleMeter
                          backgroundColor="#fff"
                          foregroundColor="#FF9900"
                          value={happyometer}
                          size={250}
                        />
                      </Col>
                    </Row>
                  </Grid>
                </Col>
                <Col md={4} sm={6}>
                  <EngagementSummary
                    detectedFaces={detectedFaces}
                    detectedPeople={detectedPeople}
                    showFaceBoundingBoxes={iterating.current}
                    webcamCoordinates={webcamCoordinates}
                  />
                </Col>
              </Row>
            </Grid>
          </Col>
        </Row>
      </Grid>
    </div>
  );
};
