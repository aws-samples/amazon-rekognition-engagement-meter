import React, { Component } from "react";
import Webcam from "react-webcam";
import { HalfCircleMeter } from "react-svg-meters";
import { Grid, Col, Row } from "react-bootstrap";

import EngagementSummary from "./components/EngagementsSummary";
import PolarChart from "./components/PolarChart";
import RekognitionButton from "./components/RekognitionButton";

import faceDetailsMapper from "./utils/faceDetailsMapper";
import gateway from "./utils/gateway";
import getChartData from "./utils/getChartData";

import "./App.css";

class App extends Component {
  constructor() {
    super();

    this.getSnapshot = this.getSnapshot.bind(this);
    this.toggleRekognition = this.toggleRekognition.bind(this);

    this.state = {
      aggregate: {
        angry: 0,
        confused: 0,
        happy: 0,
        sad: 0,
        surprised: 0
      },
      detectedFaces: [],
      happyometer: 50,
      rekognizing: false
    };
  }

  getSnapshot() {
    if (this.webcam) {
      const image = this.webcam.getScreenshot();
      const b64Encoded = image.split(",")[1];

      gateway.getEngagement().then(response => {
        const chartData = getChartData(response.data);

        if (chartData.happyometer) {
          this.setState({ happyometer: chartData.happyometer });
        }

        if (chartData.aggregate) {
          this.setState({ aggregate: chartData.aggregate });
        }
      });

      gateway.detectFaces(b64Encoded).then(response => {
        const detectedFaces = response.data.FaceDetails.map(person => {
          const result = faceDetailsMapper(person);
          gateway.postEngagement(result).then(() => {});
          return result;
        });

        this.setState({ detectedFaces }, () => {
          if (this.state.rekognizing) {
            setTimeout(this.getSnapshot, 500);
          }
        });
      });

      gateway.searchFaces(b64Encoded).then(response => {});
    }
  }

  toggleRekognition() {
    this.setState(
      {
        rekognizing: !this.state.rekognizing
      },
      () => {
        if (this.state.rekognizing) {
          gateway
            .getPeople()
            .then(({ people }) => this.setState({ people }, this.getSnapshot));
        }
      }
    );
  }

  render() {
    return (
      <div className="App">
        <Grid>
          <Row>
            <Col md={8}>
              <Webcam
                ref={webcam => (this.webcam = webcam)}
                screenshotFormat="image/jpeg"
                videoConstraints={{
                  width: 1280,
                  height: 720,
                  facingMode: "user"
                }}
                width="100%"
                height={320}
              />
              <RekognitionButton onClick={this.toggleRekognition} />
            </Col>
            <Col md={4}>
              <EngagementSummary detectedFaces={this.state.detectedFaces} />
            </Col>
          </Row>
          <Row>
            <Col md={6}>
              <h3>Trends for last hour</h3>
              <PolarChart
                data={Object.keys(this.state.aggregate).map(sentiment => ({
                  x: sentiment,
                  y: this.state.aggregate[sentiment]
                }))}
              />
            </Col>
            <Col md={6}>
              <h3>Engagement Meter</h3>
              <HalfCircleMeter
                backgroundColor="#fff"
                foregroundColor="#FF9900"
                value={this.state.happyometer}
                size={300}
              />
            </Col>
          </Row>
        </Grid>
      </div>
    );
  }
}

export default App;
