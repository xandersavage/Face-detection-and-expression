const video = document.getElementById("video"); //get video element in html

//loads all models
Promise.all([
  faceapi.nets.tinyFaceDetector.loadFromUri("/models"),
  faceapi.nets.ageGenderNet.loadFromUri("/models"),
  faceapi.nets.faceLandmark68Net.loadFromUri("/models"),
  faceapi.nets.faceRecognitionNet.loadFromUri("/models"),
  faceapi.nets.faceExpressionNet.loadFromUri("/models")
]).then(startVideo);

//connects webcam to video element in html
function startVideo() {
  navigator.getUserMedia(
    { video: {} },
    stream => (video.srcObject = stream),
    err => console.log(err)
  );
}

video.addEventListener("playing", () => {
  const imageCanvas = faceapi.createCanvasFromMedia(video);
  document.body.append(imageCanvas);

  const displayDimensions = { width: video.width, height: video.height };
  faceapi.matchDimensions(imageCanvas, displayDimensions);

  setInterval(async () => {
    const facesDetected = await faceapi
      .detectAllFaces(video, new faceapi.TinyFaceDetectorOptions())
      .withFaceExpressions()
      .withAgeAndGender();
    // .withFaceLandmarks();

    imageCanvas
      .getContext("2d")
      .clearRect(0, 0, imageCanvas.width, imageCanvas.height);
    const resizedFrame = faceapi.resizeResults(
      facesDetected,
      displayDimensions
    );
    faceapi.draw.drawDetections(imageCanvas, resizedFrame);
    //  faceapi.draw.drawFaceLandmarks(imageCanvas, resizedFrame)
    faceapi.draw.drawFaceExpressions(imageCanvas, resizedFrame);

    resizedFrame.forEach(detection => {
      const box = detection.detection.box;
      const drawBox = new faceapi.draw.DrawBox(box, {
        label: Math.round(detection.age) + " year old " + detection.gender
      });
      drawBox.draw(imageCanvas);
    });
  }, 100);
});
