var app = angular.module("rekDemo", []);

/////////////////////////////////////////
// Service
/////////////////////////////////////////

app.factory("mySVC", [
  "$q",
  "$http",
  function($q, $http) {
    var IdentityPoolId = "eu-west-1:d70e266d-0ec2-4112-8704-e3907a058801";

    AWS.config.region = "eu-west-1";
    AWS.config.credentials = new AWS.CognitoIdentityCredentials({
      IdentityPoolId: IdentityPoolId
    });

    var dynamodb = new AWS.DynamoDB();

    var apiUrl = "https://bntvj8trf7.execute-api.eu-west-1.amazonaws.com/PROD";

    var mySVC = {
      getEngagement: getEngagement,
      getSentiment: getSentiment,
      ddbPostSentiment: ddbPostSentiment,
      ddbGetPeople: ddbGetPeople,
      ddbPutPerson: ddbPutPerson
    };
    return mySVC;

    function getEngagement() {
      var myURL = apiUrl + "/engagement",
        deferred = $q.defer();
      return $http({
        method: "get",
        url: myURL,
        headers: { "Content-Type": "application/json" }
      }).then(function(response) {
        deferred.resolve(response.data);
        return deferred.promise;
      });
    }

    function getSentiment() {
      var myURL = apiUrl + "/sentiment",
        deferred = $q.defer();
      return $http({
        method: "get",
        url: myURL,
        headers: { "Content-Type": "application/json" }
      }).then(function(response) { console.log('matteo'); console.log(response);
        deferred.resolve(response.data);
        return deferred.promise;
      });
    }

    function ddbPostSentiment(person) {
      console.log(person);
      var timedetected = new Date().getTime(),
        deferred = $q.defer(),
        params = {
          Item: {
            collectionID: {
              S: "rekog-demo"
            },
            TimeDetected: {
              N: timedetected.toString() || "-"
            },
            happy: {
              S: (person.HAPPY || "-").toString()
            },
            sad: {
              S: (person.SAD || "-").toString()
            },
            angry: {
              S: (person.ANGRY || "-").toString()
            },
            confused: {
              S: (person.CONFUSED || "-").toString()
            },
            surprised: {
              S: (person.SURPRISED || "-").toString()
            }
          },
          TableName: "rekog_ddb_sentiment"
        };

      console.log("Params:", params);

      dynamodb.putItem(params, function(err, data) {
        if (err) {
          console.log(err);
        } else {
          deferred.resolve(data);
          return deferred.promise;
        }
      });
      /*
      //post sentiment data to lambda to update Dynamo for trend
      var myObj = person,
        payload = JSON.stringify(myObj),
        myURL = apiUrl + "/sentiment",
        deferred = $q.defer();
      return $http({
        method: "post",
        url: myURL,
        data: payload,
        headers: { "Content-Type": "application/json" }
      }).then(function(response) {
        deferred.resolve(response.data);
        return deferred.promise;
      });*/
    }

    function ddbGetPeople(collectionid) {
      var myObj = { collectionid: collectionid },
        payload = JSON.stringify(myObj),
        myURL = apiUrl + "/people",
        deferred = $q.defer();
      return $http({
        method: "get",
        url: myURL,
        data: payload,
        headers: { "Content-Type": "application/json" }
      }).then(function(response) {
        deferred.resolve(response.data);
        return deferred.promise;
      });
    }

    function ddbPutPerson(collection, face) {
      var timedetected = new Date(),
        params = {
          Item: {
            CollectionID: {
              S: collection
            },
            TimeDetected: {
              S: timedetected.toISOString()
            },
            ExternalImageID: {
              S: face
            },
            Smile: {
              BOOL: true
            },
            Image: {
              S: "Not included"
            }
          },
          TableName: "rekog_ddb_detected"
        };

      console.log("ddbPut:", params);
      dynamodb.putItem(params, function(err, data) {
        if (err) {
          console.log(err, err.stack); // an error occurred
          return err;
        } else {
          //console.log("table updated : ", timedetected, face);
          return data;
        }
      });
    }
  }
]);

/////////////////////////////////////////
// Controller
/////////////////////////////////////////

app.controller("rekCtrl", [
  "mySVC",
  "$scope",
  function(mySVC, $scope) {
    var camera, // Initialized at the end
      options = {
        swf_url: "jpeg_camera.swf"
      },
      self = this;

    this.imagecheck = 0;
    this.people = [];
    this.peeps = [];
    this.numFaces = [];
    this.welcome = [];
    this.detected = [];
    this.sentiments = [
      "AgeLow",
      "AgeHigh",
      "HAPPY",
      "ANGRY",
      "SURPRISED",
      "SAD",
      "CONFUSED"
    ];
    this.collection = "rekog_demo";
    this.faceFound = 0;

    this.aggregate = {};

    this.stopRekognition = function() {
      this.imagecheck = 0;
    };

    this.startRekognition = function() {
      this.imagecheck = 1;
      this.rekognition = new AWS.Rekognition();

      //get all registered people from Dynamo
      mySVC.ddbGetPeople(self.collection).then(function(people) {
        self.people = people.data.Items;
        self.getSnapshot();
      });
    };

    this.getSnapshot = function() {
      var snapshot = camera.capture();

      if (JpegCamera.canvas_supported()) {
        snapshot.get_canvas(this.processSnapshot);
      } else {
        // <canvas> is not supported in this browser.
        var image = document.createElement("img");
        image.src = "no_canvas_photo.jpg";
      }
    };

    this.processSnapshot = function(element) {
      var dataURI = element.toDataURL("image/jpeg"),
        binary = atob(dataURI.split(",")[1]),
        myArr = [],
        imageBlob,
        params;

      for (var i = 0; i < binary.length; i++) {
        myArr.push(binary.charCodeAt(i));
      }

      imageBlob = new Uint8Array(myArr);

      /* Find face in collection */
      params = {
        CollectionId: "rekog-demo",
        FaceMatchThreshold: 85,
        Image: {
          Bytes: imageBlob
        },
        MaxFaces: 2
      };

      self.getChartData();
      self.searchFacesByImage(params);
      self.getFaceSentiment(imageBlob);
      self.getChartData();
    };

    this.searchFacesByImage = function(params) {
      var face, i;

      this.rekognition.searchFacesByImage(params, function(err, data) {
        self.detected = []; //clear the detected array

        if (err) {
          console.log("No faces detected");
          self.welcome = [];
        } else {
          $.each(data.FaceMatches, function(index, value) {
            face = value.Face.ExternalImageId;
            self.faceFound = 1;

            var detectedPerson = {},
              totalPeople = self.people.length;

            for (i = 0; i < totalPeople; i++) {
              if (self.people[i].ExternalImageID.S == face) {
                detectedPerson = self.people[i];
                console.log("Detected Person:", detectedPerson.MemberName.S);
              }
            }

            if (self.welcome.indexOf(detectedPerson) != -1) {
              // existing face
              //already in display array so just add to detected array
              self.detected.push(detectedPerson);
            } else {
              //for tracking
              self.detected.push(detectedPerson);
              //for display
              self.welcome.push(detectedPerson);
            }

            //Now log the latest detected time for the person to Dynamo
            mySVC.ddbPutPerson(self.collection, face);
          });
        }

        //now remove names from display if not detected on this cycle
        for (i = 0; i < self.welcome.length; i++) {
          if (self.detected.indexOf(self.welcome[i]) === -1) {
            //person in welcome list was not detected so needs to be removed
            self.welcome.splice(i, 1);
          }
        }

        //set repeat timeout until 'Stop Rekognition' is clicked
        if (self.imagecheck == 1) {
          self.timeoutID = setTimeout(function() {
            self.getSnapshot();
            $scope.$apply();
          }, 400);
        } else {
          //clear all timeouts
          while (self.timeoutID--) {
            clearTimeout(self.timeoutID); // will do nothing if no timeout with id is present
          }
        }
      });
    };

    this.getFaceSentiment = function(imageBlob) {
      var self = this;

      var params = {
        Image: {
          Bytes: imageBlob
        },
        Attributes: ["ALL"]
      };

      this.rekognition.detectFaces(params, function(err, data) {
        if (err) {
          console.log(err, err.stack); // an error occurred
        } else {
          self.peeps.length = data.FaceDetails.length;

          $.each(data.FaceDetails, function(index, value) {
            var peep = {};
            peep.AgeLow = value.AgeRange.Low;
            peep.AgeHigh = value.AgeRange.High;
            //peep.Smile            = value.Smile;
            //peep.Smile.Confidence = value.Smile.Confidence;

            $.each(value.Emotions, function(index, value) {
              peep[value.Type] = Math.floor(value.Confidence);
            });

            self.peeps[index] = peep;
            mySVC.ddbPostSentiment(peep);
          });
        }
      });
    };

    this.getChartData = function() {
      //get data for bars
      mySVC.getSentiment().then(function(data) { console.log('matteo2'); console.log(data);
        $scope.aggregate = data.results;
      });

      //get data for gauge
      mySVC.getEngagement().then(function(engaged) {
        $scope.happyometer = parseInt(engaged.results.good) / 10;
      });
    };

    camera = new JpegCamera("#camera", options).ready(function(info) {
      this.video_width = info.video_width;
      this.video_height = info.video_height;

      //this.get_stats(update_stream_stats);
    });
  }
]);
