import React, { useState } from "react";
import {
  Alert,
  Button,
  ControlLabel,
  FormControl,
  FormGroup,
  Modal
} from "react-bootstrap";

export default props => {
  const [show, setShow] = useState(false);
  const [fullName, setFullName] = useState("");
  const [jobTitle, setJobTitle] = useState("");
  const [image, setImage] = useState(undefined);
  const [formState, setFormState] = useState("initial");
  const saveHandler = props.onSave;

  const getValidationState = value => (!value ? "error" : "success");

  const processImage = file => {
    const reader = new FileReader();
    reader.readAsDataURL(file);
    reader.onload = () => setImage(reader.result.split(",")[1]);
    reader.onerror = () => setFormState("error");
  };

  const submitForm = e => {
    setFormState("saving");
    e.preventDefault();
    saveHandler({ fullName, jobTitle, image })
      .then(() => setFormState("saved"))
      .catch(() => setFormState("error"));
  };

  const toggle = reset => {
    setShow(!show);
    if (reset) {
      setFormState("initial");
      setFullName("");
      setJobTitle("");
      setImage(undefined);
    }
  };

  return (
    <>
      <Button
        bsStyle="warning"
        onClick={() => toggle(true)}
        style={{ marginLeft: "20px" }}
      >
        Add a new user
      </Button>

      <Modal show={show} onHide={toggle} style={{ color: "#000" }}>
        <Modal.Header closeButton>
          <Modal.Title>Add a new user</Modal.Title>
        </Modal.Header>
        <Modal.Body>
          <p>
            By uploading a picture and associating it with a name, Amazon
            Rekognition can recognize that person.
          </p>
          <hr />
          <Alert
            bsStyle="warning"
            style={{
              display: formState === "saving" ? "block" : "none"
            }}
          >
            Please wait
          </Alert>
          <Alert
            bsStyle="danger"
            style={{
              display: formState === "error" ? "block" : "none"
            }}
          >
            An error happened. Retry.
          </Alert>
          <Alert
            bsStyle="success"
            style={{
              display: formState === "saved" ? "block" : "none"
            }}
          >
            The user has been added.
          </Alert>
          <form
            style={{
              display: formState === "initial" ? "block" : "none"
            }}
          >
            <FormGroup
              controlId="fullName"
              validationState={getValidationState(fullName)}
            >
              <ControlLabel>Full name</ControlLabel>
              <FormControl
                type="text"
                value={fullName}
                placeholder="Full Name e.g. Jane Doe"
                onChange={e => setFullName(e.target.value)}
              />
              <FormControl.Feedback />
            </FormGroup>
            <FormGroup
              controlId="jobTitle"
              validationState={getValidationState(jobTitle)}
            >
              <ControlLabel>Job Title</ControlLabel>
              <FormControl
                type="text"
                value={jobTitle}
                placeholder="Job Title e.g. CEO"
                onChange={e => setJobTitle(e.target.value)}
              />
              <FormControl.Feedback />
            </FormGroup>
            <FormGroup
              controlId="image"
              validationState={getValidationState(image)}
            >
              <ControlLabel>Photo</ControlLabel>
              <FormControl
                type="file"
                onChange={e => processImage(e.target.files[0])}
                id="image"
              />
              <FormControl.Feedback />
            </FormGroup>
          </form>
        </Modal.Body>
        <Modal.Footer>
          <Button
            onClick={submitForm}
            bsStyle="primary"
            type="submit"
            disabled={
              !fullName || !jobTitle || !image || formState !== "initial"
            }
            show="false"
          >
            Add User
          </Button>
          <Button onClick={toggle}>Close</Button>
        </Modal.Footer>
      </Modal>
    </>
  );
};
