import React from "react";
import { Table } from "react-bootstrap";

const filterAndSortEmotions = face =>
  Object.keys(face.emotions)
    .map(emotion => ({
      emotion,
      confidence: face.emotions[emotion]
    }))
    .filter(x => x.confidence > 0)
    .sort((a, b) => {
      if (a.confidence > b.confidence) {
        return -1;
      } else if (a.confidence < b.confidence) {
        return 1;
      } else return 0;
    });

export default props => (
  <div>
    {props.detectedFaces.map((face, index) => (
      <div key={index}>
        <div
          style={{
            border: "1px solid #f0ad4e",
            fontWeight: "bold",
            position: "fixed",
            height: props.webcamCoordinates.height * face.boundingBox.Height,
            left:
              props.webcamCoordinates.left +
              face.boundingBox.Left * props.webcamCoordinates.width,
            top:
              props.webcamCoordinates.top +
              face.boundingBox.Top * props.webcamCoordinates.height,
            width: props.webcamCoordinates.width * face.boundingBox.Width
          }}
        >
          Person #{index + 1}
        </div>
        <Table responsive>
          <thead>
            <tr>
              <th>Person #{index + 1}</th>
              <th />
            </tr>
          </thead>
          <tbody>
            <tr>
              <td>Age</td>
              <td>
                {face.ageLow} - {face.ageHigh} years old
              </td>
            </tr>
            {filterAndSortEmotions(face).map(({ emotion, confidence }) => (
              <tr key={emotion}>
                <td>{emotion}</td>
                <td>{confidence}%</td>
              </tr>
            ))}
          </tbody>
        </Table>
      </div>
    ))}
    {props.detectedPeople.map(person => (
      <p key={person.externalImageId}>
        Welcome <b>{person.memberName}</b> ({person.jobTitle})
      </p>
    ))}
  </div>
);
