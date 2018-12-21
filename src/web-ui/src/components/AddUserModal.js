import React, { Component } from "react";
import {
  Alert,
  Button,
  ControlLabel,
  FormControl,
  FormGroup,
  Modal
} from "react-bootstrap";

class AddUserModal extends Component {
  constructor(props, context) {
    super(props, context);

    this.getValidationState = this.getValidationState.bind(this);
    this.processImage = this.processImage.bind(this);
    this.submitForm = this.submitForm.bind(this);
    this.toggle = this.toggle.bind(this);
    this.saveHandler = props.onSave;

    this.state = {
      show: false,
      fullName: "",
      jobTitle: "",
      image: undefined,
      formState: "initial"
    };
  }

  getValidationState(field) {
    return !this.state[field] ? "error" : "success";
  }

  processImage(file) {
    const reader = new FileReader();
    reader.readAsDataURL(file);
    reader.onload = () => this.setState({ image: reader.result.split(",")[1] });
    reader.onerror = () => this.setState({ formState: "error" });
  }

  submitForm(e) {
    this.setState({ formState: "saving" });
    e.preventDefault();
    this.saveHandler({
      fullName: this.state.fullName,
      jobTitle: this.state.jobTitle,
      image: this.state.image
    })
      .then(() => this.setState({ formState: "saved" }))
      .catch(() => this.setState({ formState: "error" }));
  }

  toggle(reset) {
    if (reset) {
      this.setState({
        formState: "initial",
        show: !this.state.show,
        fullName: "",
        jobTitle: "",
        image: undefined
      });
    } else this.setState({ show: !this.state.show });
  }

  render() {
    return (
      <>
        <Button
          bsStyle="warning"
          onClick={() => this.toggle(true)}
          style={{ marginLeft: "20px" }}
        >
          Add a new user
        </Button>

        <Modal
          show={this.state.show}
          onHide={this.toggle}
          style={{ color: "#000" }}
        >
          <Modal.Header closeButton>
            <Modal.Title>Add a new user</Modal.Title>
          </Modal.Header>
          <Modal.Body>
            <p>
              By uploading an image and associating it with a name, Rekognition
              is able to recognize that person in the future.
            </p>
            <hr />
            <Alert
              bsStyle="warning"
              style={{
                display: this.state.formState === "saving" ? "block" : "none"
              }}
            >
              Please wait
            </Alert>
            <Alert
              bsStyle="danger"
              style={{
                display: this.state.formState === "error" ? "block" : "none"
              }}
            >
              An error happened. Retry.
            </Alert>
            <Alert
              bsStyle="success"
              style={{
                display: this.state.formState === "saved" ? "block" : "none"
              }}
            >
              The user has been added.
            </Alert>
            <form
              style={{
                display: this.state.formState === "initial" ? "block" : "none"
              }}
            >
              <FormGroup
                controlId="fullName"
                validationState={this.getValidationState("fullName")}
              >
                <ControlLabel>Full name</ControlLabel>
                <FormControl
                  type="text"
                  value={this.state.fullName}
                  placeholder="Full Name e.g. Jane Doe"
                  onChange={e => this.setState({ fullName: e.target.value })}
                />
                <FormControl.Feedback />
              </FormGroup>
              <FormGroup
                controlId="jobTitle"
                validationState={this.getValidationState("jobTitle")}
              >
                <ControlLabel>Job Title</ControlLabel>
                <FormControl
                  type="text"
                  value={this.state.jobTitle}
                  placeholder="Job Title e.g. CEO"
                  onChange={e => this.setState({ jobTitle: e.target.value })}
                />
                <FormControl.Feedback />
              </FormGroup>
              <FormGroup
                controlId="image"
                validationState={this.getValidationState("image")}
              >
                <ControlLabel>Photo</ControlLabel>
                <FormControl
                  type="file"
                  value={this.state.imge}
                  onChange={e => this.processImage(e.target.files[0])}
                  id="image"
                />
                <FormControl.Feedback />
              </FormGroup>
            </form>
          </Modal.Body>
          <Modal.Footer>
            <Button
              onClick={this.submitForm}
              bsStyle="primary"
              type="submit"
              disabled={
                !this.state.fullName ||
                !this.state.jobTitle ||
                !this.state.image ||
                this.state.formState !== "initial"
              }
              show="false"
            >
              Add User
            </Button>
            <Button onClick={this.toggle}>Close</Button>
          </Modal.Footer>
        </Modal>
      </>
    );
  }
}

export default AddUserModal;
