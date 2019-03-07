import React, { useState, useEffect } from "react";
import { findDOMNode } from "react-dom";
import Webcam from "react-webcam";
import { HalfCircleMeter } from "react-svg-meters";
import { Col, Grid, Row } from "react-bootstrap";

import CameraHelp from "./components/CameraHelp";
import EngagementSummary from "./components/EngagementsSummary";
import Header from "./components/Header";
import PolarChart from "./components/PolarChart";

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
  const [iterating, setIterating] = useState(false);
  const [iterationCompleted, setIterationCompleted] = useState(false);
  const [people, setPeople] = useState([]);
  const [readyToStream, setReadyToStream] = useState(false);
  const [webcamCoordinates, setWebcamCoordinates] = useState({});
  const [webcamInstance, setWebcamInstance] = useState(undefined);

  const addUser = params => gateway.addUser(params);

  const getSnapshot = () => {
    setWebcamCoordinates(findDOMNode(webcamInstance).getBoundingClientRect());

    const image = webcamInstance.getScreenshot();
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
      setIterationCompleted(true);
    });

    gateway.searchFaces(b64Encoded).then(response => {
      const detectedPeople = [];
      if (response.FaceMatches) {
        response.FaceMatches.forEach(match => {
          const externalImageId = match.Face.ExternalImageId;
          const matched = people.find(
            x => x.externalImageId === externalImageId
          );
          if (matched) detectedPeople.push(matched);
        });
      }
      setDetectedPeople(detectedPeople);
    });
  };

  const setupWebcam = instance => {
    setWebcamInstance(instance);

    const checkIfReady = () => {
      if (
        webcamInstance &&
        webcamInstance.state &&
        webcamInstance.state.hasUserMedia
      ) {
        setReadyToStream(true);
      } else setTimeout(checkIfReady, 250);
    };

    checkIfReady();
  };

  const toggleRekognition = () => {
    const newIterationState = !iterating;
    setIterating(newIterationState);

    if (newIterationState) {
      setIterationCompleted(false);
      gateway.getPeople().then(response => {
        setPeople(response.people);
        getSnapshot();
      });
    }
  };

  useEffect(() => {
    if (iterating && iterationCompleted) {
      setIterationCompleted(false);
      setTimeout(getSnapshot, 300);
    }
  }, [iterating, iterationCompleted]);

  return (
    <div className="App">
      <Header
        toggleRekognition={toggleRekognition}
        addUser={addUser}
        readyToStream={readyToStream}
      />
      <Grid>
        <CameraHelp show={!readyToStream} />
        <Row>
          <Col md={8} sm={6}>
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
                </Col>
                <Col md={4} sm={6}>
                  <EngagementSummary
                    detectedFaces={detectedFaces}
                    detectedPeople={detectedPeople}
                    webcamCoordinates={webcamCoordinates}
                  />
                </Col>
              </Row>
              <Row style={{ marginTop: "20px" }}>
                <Col md={4} sm={6}>
                  <h3>Trends for last hour</h3>
                  <PolarChart
                    data={Object.keys(aggregate).map(sentiment => ({
                      x: sentiment,
                      y: aggregate[sentiment]
                    }))}
                  />
                </Col>
                <Col md={4} sm={6}>
                  <h3 style={{ marginBottom: "40px" }}>Engagement Meter</h3>
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
        </Row>
      </Grid>
    </div>
  );
};
