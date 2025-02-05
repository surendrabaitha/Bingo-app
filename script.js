const video = document.getElementById("cameraFeed");
const canvas = document.getElementById("overlay");
const ctx = canvas.getContext("2d");

const randomMessages = [
  "You're eating Bingo chips in the office!",
  "You're enjoying Bingo chips at home!",
  "Bingo chips make your day better!",
  "You're the Bingo king at a party!",
  "Bingo chips for every moment!",
];

let currentMessage = randomMessages[0];
let lastMessageUpdateTime = 0;

document.getElementById("tryItOn").addEventListener("click", async () => {
  try {
    const stream = await navigator.mediaDevices.getUserMedia({
      video: { facingMode: "user", width: 640, height: 480 },
    });
    video.srcObject = stream;

    // Ensure models are fully loaded before starting face detection
    await loadFaceApiModels();
    video.addEventListener("play", detectFaceAndShowText);
  } catch (err) {
    console.error("Camera access error:", err);
  }
});

async function loadFaceApiModels() {
  try {
    const MODEL_URL = location.origin + "/models"; // Ensure correct path
    console.log("Loading models from:", MODEL_URL);

    await Promise.all([
      faceapi.nets.tinyFaceDetector.loadFromUri(MODEL_URL),
      faceapi.nets.faceLandmark68Net.loadFromUri(MODEL_URL),
      faceapi.nets.ssdMobilenetv1.loadFromUri(MODEL_URL), // Alternative model for detection
    ]);

    console.log("Face API models loaded successfully.");
  } catch (error) {
    console.error("Error loading Face API models:", error);
  }
}

function detectFaceAndShowText() {
  canvas.width = video.videoWidth;
  canvas.height = video.videoHeight;

  setInterval(async () => {
    try {
      if (!faceapi.nets.tinyFaceDetector.params) {
        console.error("Face detector model not loaded yet!");
        return;
      }

      const detections = await faceapi
        .detectAllFaces(video, new faceapi.TinyFaceDetectorOptions())
        .withFaceLandmarks();

      ctx.clearRect(0, 0, canvas.width, canvas.height);

      if (detections.length > 0) {
        ctx.font = "24px Arial";
        ctx.fillStyle = "red";
        ctx.fillText(currentMessage, 50, 50);

        const now = Date.now();
        if (now - lastMessageUpdateTime > 3000) {
          currentMessage =
            randomMessages[Math.floor(Math.random() * randomMessages.length)];
          lastMessageUpdateTime = now;
        }
      }
    } catch (error) {
      console.error("Face detection error:", error);
    }
  }, 500);
}
