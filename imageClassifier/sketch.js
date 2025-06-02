/*
 * 👋 Hello! This is an ml5.js example made and shared with ❤️.
 * Learn more about the ml5.js project: https://ml5js.org/
 * ml5.js license and Code of Conduct: https://github.com/ml5js/ml5-next-gen/blob/main/LICENSE.md
 *
 * This example demonstrates detecting objects in a live video through ml5.imageClassifier.
 */

// A variable to initialize the Image Classifier
// let classifier;
// let imageModelURL = 'https://teachablemachine.withgoogle.com/models/RK5kZ0rc5/';

// // A variable to hold the video we want to classify
// let video;
// let confidence;

// // Variable for displaying the results on the canvas
// let label = "Model loading...";

// function preload() {
//   // classifier = ml5.imageClassifier("MobileNet");
//   ml5.setBackend('webgl');
//   classifier = ml5.imageClassifier(imageModelURL + 'model.json', {
//     flipped: true,
//   });
// }

// function setup() {
//   createCanvas(640, 480);
//   background(255);

//   // Using webcam feed as video input, hiding html element to avoid duplicate with canvas
//   video = createCapture(VIDEO);
//   video.size(640, 480);
//   video.hide();
//   classifier.classifyStart(video, gotResult);
// }

// function draw() {
//   // Each video frame is painted on the canvas
//   image(video, 0, 0);

//   // Printing class with the highest probability on the canvas
//   fill(255);
//   textSize(32);
//   text(label, 20, 50);
//   text(confidence, 20, 100);

//   if(text === 'sailor moon') {
//     for(let i = 0; i < 20; i++) {
//       makeRandomSparkle();
//     }
//   }

// }

// // Callback function for when classification has finished
// function gotResult(results) {
//   // Update label variable which is displayed on the canvas
//   label = results[0].label;
//   confidence = results[0].confidence.toFixed(2);
//   console.log(results);
// }

// function makeRandomSparkle() {
//   push();

//   let randomX = random(width);
//   let randomY = random(height);
  
//   // Translate the coordinate space so that (0, 0) matches mouse coordinates.
//   translate(randomX, randomY);
  
//   // Define a random inner and outer radius for each star.
//   let innerRadius = random(3, 5);
//   let outerRadius = random(10, 50);
  
//   // Draw the star shape.
//   beginShape(); 
//       vertex(-innerRadius, innerRadius);
//       vertex(0, outerRadius);
//       vertex(innerRadius, innerRadius);
//       vertex(outerRadius, 0);
//       vertex(innerRadius, -innerRadius);
//       vertex(0, -outerRadius);
//       vertex(-innerRadius, -innerRadius);
//       vertex(-outerRadius, 0);
//   endShape(CLOSE);
  
//   pop();
// }
  
const modelURL = 'https://teachablemachine.withgoogle.com/models/RK5kZ0rc5/';
// the json file (model topology) has a reference to the bin file (model weights)
const checkpointURL = modelURL + "model.json";
// the metatadata json file contains the text labels of your model and additional information
const metadataURL = modelURL + "metadata.json";


const flip = true; // whether to flip the webcam

let model;
let totalClasses;
let myCanvas;

let classification = "None Yet";
let probability = "100";
let poser;
let video;


// A function that loads the model from the checkpoint
async function load() {
  model = await tmPose.load(checkpointURL, metadataURL);
  totalClasses = model.getTotalClasses();
  console.log("Number of classes, ", totalClasses);
}


async function setup() {
  myCanvas = createCanvas(640, 480);
  // Call the load function, wait until it finishes loading
  videoCanvas = createCanvas(640, 480)

  await load();
  video = createCapture(VIDEO, videoReady);
  video.size(640, 480);
  video.hide();

}

function draw() {
  background(255);
  if(video) image(video,0,0);
  fill(255,0,0)
  textSize(18);
  text("Result:" + classification, 10, 40);

  text("Probability:" + probability, 10, 20)
  ///ALEX insert if statement here testing classification against apppropriate part of array for this time in your video

  // textSize(8);
  // if (poser) { //did we get a skeleton yet;
  //   for (var i = 0; i < poser.length; i++) {
  //     let x = poser[i].position.x;
  //     let y = poser[i].position.y;
  //     ellipse(x, y, 5, 5);
  //     text(poser[i].part, x + 4, y);
  //   }
  // }

  if(classification === 'sailor moon' && probability >= 0.99) {
    for(let i = 0; i < 20; i++) {
      makeRandomSparkle();
    }
  }

}

function videoReady() {
  console.log("Video Ready");
  predict();
}


async function predict() {
  // Prediction #1: run input through posenet
  // predict can take in an image, video or canvas html element
  const flipHorizontal = false;
  const {
    pose,
    posenetOutput
  } = await model.estimatePose(
    video.elt, //webcam.canvas,
    flipHorizontal
  );
  // Prediction 2: run input through teachable machine assification model
  const prediction = await model.predict(
    posenetOutput,
    flipHorizontal,
    totalClasses
  );

  // console.log(prediction);
  
  // Sort prediction array by probability
  // So the first classname will have the highest probability
  const sortedPrediction = prediction.sort((a, b) => -a.probability + b.probability);

  //communicate these values back to draw function with global variables
  classification = sortedPrediction[0].className;
  probability = sortedPrediction[0].probability.toFixed(2);
  if (pose) poser = pose.keypoints; // is there a skeleton
  predict();
}

function makeRandomSparkle() {
  push();

  fill(255);

  let randomX = random(width);
  let randomY = random(height);
  
  // Translate the coordinate space so that (0, 0) matches mouse coordinates.
  translate(randomX, randomY);
  
  // Define a random inner and outer radius for each star.
  let innerRadius = random(3, 5);
  let outerRadius = random(10, 50);
  
  // Draw the star shape.
  beginShape(); 
      vertex(-innerRadius, innerRadius);
      vertex(0, outerRadius);
      vertex(innerRadius, innerRadius);
      vertex(outerRadius, 0);
      vertex(innerRadius, -innerRadius);
      vertex(0, -outerRadius);
      vertex(-innerRadius, -innerRadius);
      vertex(-outerRadius, 0);
  endShape(CLOSE);
  
  pop();
}