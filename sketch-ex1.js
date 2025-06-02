// Face Mesh Detection - Draw with nose when mouth open

let video;
let faceMesh;
let faces = [];
let myPoints = [];

function preload() {
  // Initialize FaceMesh model with a maximum of one face and flipped video input
  faceMesh = ml5.faceMesh({ maxFaces: 2, flipped: true });
}

// function mousePressed() {
//   // Log detected face data to the console
//   console.log(faces);
// }

function gotFaces(results) {
  faces = results;
}

function setup() {
  createCanvas(640, 480);
  video = createCapture(VIDEO, { flipped: true });
  video.size(width, height);
  video.hide();

  // Start detecting faces
  faceMesh.detectStart(video, gotFaces);
}

function draw() {
  background(0);
//   push();

  if (faces.length > 0) {
    let face = faces[0];
    image(video, 0, 0);

    // Draw exterior lip contour
    // beginShape();
    // for (let i = 0; i < lipsExterior.length; i++) {
    //   let index = lipsExterior[i];
    //   let keypoint = face.keypoints[index];
    //   stroke(255, 255, 0);
    //   strokeWeight(2);
    //   noFill();
    //   vertex(keypoint.x, keypoint.y);
    // }
    // endShape(CLOSE);

    // // Draw interior lip contour
    // beginShape();
    // for (let i = 0; i < lipsInterior.length; i++) {
    //   let index = lipsInterior[i];
    //   let keypoint = face.keypoints[index];
    //   stroke(255, 0, 255);
    //   strokeWeight(2);
    //   noFill();
    //   vertex(keypoint.x, keypoint.y);
    // }
    // endShape(CLOSE);

    let nx = faces[0].keypoints[4].x;
    let ny = faces[0].keypoints[4].y;
    let theNewPoint = createVector(nx, ny);
    fill('blue'); 
    noStroke(); 
    circle(nx, ny, 50); 
    myPoints.push(theNewPoint);

    // Calculate mouth opening distance
    let a = face.keypoints[13];
    let b = face.keypoints[14];
    let d = dist(a.x, a.y, b.x, b.y);

    if(d >= 10) {
        noFill();
        stroke('blue');
        strokeWeight(10);
        strokeJoin(ROUND);
        beginShape();
        for (let i = 0; i < myPoints.length; i++) {
          let px = myPoints[i].x;
          let py = myPoints[i].y;
          vertex(px, py);
        }
        endShape();
        // myPoints.pop();
    } else {
        myPoints = [];
    }
  }

}
