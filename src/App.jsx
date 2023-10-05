import { useEffect, useRef } from "react";
import * as faceapi from "@vladmandic/face-api";
import "./App.css";

export default function App() {
  const videoRef = useRef();
  const canvasRef = useRef();

  useEffect(() => {
    startVideo();
    videoRef && loadModels();
  }, []);

  const wh = {
    width: 1150,
    height: 850,
  };

  const startVideo = () => {
    navigator.mediaDevices
      .getUserMedia({ video: true })
      .then((currentStream) => {
        videoRef.current.srcObject = currentStream;
      })
      .catch((err) => {
        console.log(err);
      });
  };

  const loadModels = () => {
    Promise.all([
      faceapi.nets.tinyFaceDetector.loadFromUri("/models"),
      faceapi.nets.faceExpressionNet.loadFromUri("/models"),
    ]).then(() => {
      faceDetectWithExpression();
    });
  };

  const faceDetectWithExpression = () => {
    setInterval(async () => {
      const detections = await faceapi
        .detectAllFaces(videoRef.current, new faceapi.TinyFaceDetectorOptions())
        .withFaceExpressions();

      // const ctx = canvasRef.current.getContext("2d");
      // console.log(detections[0]);
      // drawRect(detections, ctx);

      canvasRef.current.innerHTML = faceapi.createCanvasFromMedia(
        videoRef.current
      );
      faceapi.matchDimensions(canvasRef.current, wh);

      const resized = faceapi.resizeResults(detections, wh);

      faceapi.draw.drawDetections(canvasRef.current, resized);
      faceapi.draw.drawFaceExpressions(canvasRef.current, resized);
    }, 1000);
  };

  return (
    <div className="hero">
      <h1 className="hero-header">Real time video</h1>
      <div className="app-video-container">
        <video
          className="app-video"
          crossOrigin="anonymous"
          ref={videoRef}
          autoPlay
        ></video>
      </div>
      <canvas
        className="app-canvas"
        ref={canvasRef}
        width="1150"
        height="850"
      />
    </div>
  );
}
