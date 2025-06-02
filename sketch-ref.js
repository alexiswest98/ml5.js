// let video;
// let tracker;

// function setup() {
//   createCanvas(640, 480);
//   video = createCapture(VIDEO);
//   video.size(640, 480);
//   video.hide();
//   pixelDensity(1);
  
//   tracker = new clm.tracker(); //create clmtracker object
//   tracker.init(); //initialize
//   tracker.start(video.elt);
// }

// function draw() {
  
//   let positions = tracker.getCurrentPosition();
  
//   background(220);
  
//   image(video, 0, 0);
  
//   if (positions){
//     let closeMouth = dist(positions[57][0], positions[57][1], positions[60][0], positions[60][1]);
    
//       if(closeMouth >= 10){
//         textSize(60);
//         text("🔈", positions[50][0]+10, positions[50][1]);
//       } else{
//         textSize(30);
//         text("🤫", positions[50][0]+10, positions[50][1]);
//       }
//   }
  
// }


let myPoints = [];

let facemesh;
let video;
let faces = [];
let options = { maxFaces: 1, refineLandmarks: false, flipHorizontal: false };

function preload() {
  // Load the facemesh model
  facemesh = ml5.facemesh(options);
}

function setup() {
  createCanvas(640, 480);
  // Create the webcam video and hide it
  video = createCapture(VIDEO);
  video.size(width, height);
  video.hide();
  // Start detecting faces from the webcam video
  facemesh.detectStart(video, gotFaces);
}

function draw() {
  // Draw the webcam video
  push();
  translate(width,0);
  scale(-1,1);
  image(video, 0, 0, width, height);
  

  // Draw all the tracked face points
  for (let i = 0; i < faces.length; i++) {
    let face = faces[i];
    for (let j = 0; j < face.keypoints.length; j++) {
      let keypoint = face.keypoints[j];
      fill(0, 255, 0);
      noStroke();
      circle(keypoint.x, keypoint.y, 5);
    }
  }

  if (faces.length > 0) {
    let nx = faces[0].keypoints[4].x;
    let ny = faces[0].keypoints[4].y;
    let theNewPoint = createVector(nx, ny);
    fill('magenta'); 
    noStroke(); 
    circle(nx, ny, 50); 
    myPoints.push(theNewPoint);
  }
  if (myPoints.length > 1000) {
    myPoints.splice(0, 1);
  }

  noFill();
  stroke('pink');
  strokeWeight(10);
  strokeJoin(ROUND);
  beginShape();
  for (let i = 0; i < myPoints.length; i++) {
    let px = myPoints[i].x;
    let py = myPoints[i].y;
    vertex(px, py);
  }
  endShape();
  pop();
}

function keyPressed(){
  if (key == 's'){
    save("nosedraw.jpg");
  } else {
    myPoints = [];
  }
}

// Callback function for when facemesh outputs data
function gotFaces(results) {
  // Save the output to the faces variable
  faces = results;
  //console.log(faces);
}