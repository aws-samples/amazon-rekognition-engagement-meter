import React, { Component } from "react";
import Webcam from "react-webcam";
import { HalfCircleMeter } from "react-svg-meters";
import { Col, Grid, Row } from "react-bootstrap";

import EngagementSummary from "./components/EngagementsSummary";
import Header from "./components/Header";
import PolarChart from "./components/PolarChart";

import faceDetailsMapper from "./utils/faceDetailsMapper";
import getChartData from "./utils/getChartData";
import gateway from "./utils/gateway";

class App extends Component {
  constructor() {
    super();

    this.addUser = this.addUser.bind(this);
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
      detectedPeople: [],
      happyometer: 50,
      people: [],
      rekognizing: false
    };
  }

  addUser(params) {
    return gateway.addUser(params);
  }

  getSnapshot() {
    if (this.webcam) {
      const image = this.webcam.getScreenshot();
      const b64Encoded = image.split(",")[1];

      gateway.getEngagement().then(response => {
        const chartData = getChartData(response);

        if (chartData.happyometer) {
          this.setState({ happyometer: chartData.happyometer });
        }

        if (chartData.aggregate) {
          this.setState({ aggregate: chartData.aggregate });
        }
      });

      gateway.detectFaces(b64Encoded).then(response => {
        const detectedFaces = response.FaceDetails.map(person => {
          const result = faceDetailsMapper(person);
          gateway.postEngagement(result).then(() => {});
          return result;
        });

        this.setState({ detectedFaces }, () => {
          if (this.state.rekognizing) {
            setTimeout(this.getSnapshot, 300);
          }
        });
      });

      gateway.searchFaces(b64Encoded).then(response => {
        const detectedPeople = [];
        if (response.FaceMatches) {
          response.FaceMatches.forEach(match => {
            const externalImageId = match.Face.ExternalImageId;
            detectedPeople.push(
              this.state.people.find(x => x.externalImageId === externalImageId)
            );
          });
        }
        this.setState({ detectedPeople });
      });
    }
  }

  toggleRekognition() {
    this.setState(
      {
        rekognizing: !this.state.rekognizing
      },
      () => {
        if (this.state.rekognizing) {
          gateway.getPeople().then(response => {
            this.setState({ people: response.people }, this.getSnapshot);
          });
        }
      }
    );
  }

  render() {
    return (
      <div className="App">
        <Header
          toggleRekognition={this.toggleRekognition}
          addUser={this.addUser}
        />
        <Grid>
          <Row>
            <Col md={8}>
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
                  </Col>
                </Row>
                <Row style={{ marginTop: "20px" }}>
                  <Col md={4}>
                    <h3>Trends for last hour</h3>
                    <PolarChart
                      data={Object.keys(this.state.aggregate).map(
                        sentiment => ({
                          x: sentiment,
                          y: this.state.aggregate[sentiment]
                        })
                      )}
                    />
                  </Col>
                  <Col md={4}>
                    <h3 style={{ marginBottom: "40px" }}>Engagement Meter</h3>
                    <HalfCircleMeter
                      backgroundColor="#fff"
                      foregroundColor="#FF9900"
                      value={this.state.happyometer}
                      size={250}
                    />
                  </Col>
                </Row>
              </Grid>
            </Col>
            <Col md={4}>
              <EngagementSummary
                detectedFaces={this.state.detectedFaces}
                detectedPeople={this.state.detectedPeople}
              />
            </Col>
          </Row>
        </Grid>
      </div>
    );
  }
}

export default App;
