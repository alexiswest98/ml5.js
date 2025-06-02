const buttonStart = document.getElementById("start-button");
let synth;
let isAudioReady = false;

// Tone.js setup
function startTone() {
    buttonStart.disabled = true;
    buttonStart.textContent = "Starting...";
    
    Tone.start().then(() => {
        console.log("Audio is ready");
        
        // Create a polyphonic synthesizer
        //using PolySynth as the wrapper for MonoSynth (membrane syth is also monophonic)
        synth = new Tone.PolySynth(Tone.MonoSynth, {
            "oscillator": {
                "type": "fmsquare5",
                "modulationType" : "triangle",
                  "modulationIndex" : 2,
                  "harmonicity" : 0.501
            },
            "filter": {
                "Q": 1,
                "type": "lowpass",
                "rolloff": -24
            },
            "envelope": {
                "attack": 0.01,
                "decay": 0.01,
                "sustain": 0.5,
                "release": 2
            },
            "filterEnvelope": {
                "attack": 0.01,
                "decay": 0.1,
                "sustain": 0.8,
                "release": 1.5,
                "baseFrequency": 50,
                "octaves": 4.4
            }
        });

        const pitchShift = new Tone.PitchShift({
            "pitch": -5,
            "windowSize": 0.05,
            "delayTime": 0.2,
            "feedback": 0.2,
            "wet": 0.5
        });

        synth.connect(pitchShift);
        pitchShift.toDestination();
        
        isAudioReady = true;
        buttonStart.style.display = "none";
        
    }).catch((error) => {
        console.log("Audio not ready:", error);
        buttonStart.disabled = false;
        buttonStart.textContent = "Start Hand Instrument";
    });
}

// p5.js and ML5 setup
let handPose;
let video;
let hands = [];
let activeNotes = new Set(); // using a set so it won't double the active notes at once

// Finger tip indices from MediaPipe
const THUMB_TIP = 4; //C4
const INDEX_TIP = 8; //D4
const MIDDLE_TIP = 12; //E4
const RING_TIP = 16; //F4
const PINKY_TIP = 20; //G4

const fingerNotes = new Map();
fingerNotes.set(4, "C4");
fingerNotes.set(8, "D4");
fingerNotes.set(12, "E4");
fingerNotes.set(16, "F4");
fingerNotes.set(20, "G4");

function preload() {
    handPose = ml5.handPose({
        maxHands: 2,
        runtime: 'mediapipe',
        modelType: "full"
    });
}

function setup() {
    let canvas = createCanvas(640, 480);
    canvas.parent('canvas-container');
    
    // Request video capture with proper constraints
    video = createCapture({
        video: {
            width: 640,
            height: 480,
            facingMode: 'user'
        }
    });
    video.size(640, 480);
    video.hide();
    
    // Wait for video to load before starting hand detection
    video.elt.addEventListener('loadedmetadata', () => {
        console.log('Camera ready, starting hand detection');
        handPose.detectStart(video, gotHands);
    });
}

function draw() {
    // Check if video is ready
    if (video.loadedmetadata === false) {
        fill(255);
        textAlign(CENTER);
        textSize(20);
        text("Loading camera...", width/2, height/2);
        return;
    }
    
    // Flip the canvas horizontally for mirror effect
    push();
    scale(-1, 1);
    image(video, -width, 0, width, height);
    pop();
    
    // Draw hand landmarks
    for (let i = 0; i < hands.length; i++) {
        let hand = hands[i];
        drawHandPoints(hand);
        
        if (isAudioReady) {
            checkFingerTouches(hand);
        }
    }
    
    // Display status
    fill(255);
    textSize(16);
    textAlign(LEFT);
    text(isAudioReady ? "Audio Ready! Touch fingers to play." : "Click Start to begin", 10, 30);
    
    if (hands.length === 0 && isAudioReady) {
        fill(255, 100, 100);
        text("No hands detected - show your hand to the camera", 10, 60);
    }
}

function drawHandPoints(hand) {
    // Draw all keypoints (flipped to match video)
    for (let j = 0; j < hand.keypoints.length; j++) {
        let keypoint = hand.keypoints[j];
        fill(255, 119, 0);
        noStroke();
        // Flip x coordinate to match the flipped video
        circle(width - keypoint.x, keypoint.y, 8);
    }
    
    // Highlight fingertips and add notes above them 
    const fingertips = [THUMB_TIP, INDEX_TIP, MIDDLE_TIP, RING_TIP, PINKY_TIP];
    fingertips.forEach(tip => {
        if (hand.keypoints[tip]) {
            fill(171, 140, 255);
            // Flip x coordinate to match the flipped video
            circle(width - hand.keypoints[tip].x, hand.keypoints[tip].y, 12);
        }
    });

    // adding notes to top of fingers to easily see
    for (let [key, value] of fingerNotes) {
        // console.log(key, value);
        if(hand.keypoints[key]) {
            fill(255)
            text(value, width - hand.keypoints[key].x, hand.keypoints[key].y - 20 );
        }
    }
    
    // Draw connections between touching fingers
    checkAndDrawConnections(hand);
}

//solely aesthetic checking/connecting
function checkAndDrawConnections(hand) {
    const connections = [
        [THUMB_TIP, INDEX_TIP],
        [THUMB_TIP, MIDDLE_TIP],
        [THUMB_TIP, RING_TIP],
        [THUMB_TIP, PINKY_TIP]
    ];
    
    connections.forEach(([tip1, tip2]) => {
        if (hand.keypoints[tip1] && hand.keypoints[tip2]) {
            if (checkKeyPointOverlap(
                hand.keypoints[tip1].x, hand.keypoints[tip1].y,
                hand.keypoints[tip2].x, hand.keypoints[tip2].y
            )) {
                stroke(255, 255, 0);
                strokeWeight(3);
                // Flip x coordinates to match the flipped video
                line(
                    width - hand.keypoints[tip1].x, hand.keypoints[tip1].y,
                    width - hand.keypoints[tip2].x, hand.keypoints[tip2].y
                );
                noStroke();
            }
        }
    });
}

function checkFingerTouches(hand) {
    if (!hand.keypoints || hand.keypoints.length < 21) return;
    
    const currentActiveNotes = new Set();
    
    // Check thumb + index
    if (checkKeyPointOverlap(
        hand.keypoints[THUMB_TIP].x, hand.keypoints[THUMB_TIP].y,
        hand.keypoints[INDEX_TIP].x, hand.keypoints[INDEX_TIP].y
    )) {
        const noteCombo = "thumb-index";
        currentActiveNotes.add(noteCombo);
        if (!activeNotes.has(noteCombo)) {
            synth.triggerAttack(["C4", "D4"]);
        }
    }
    
    // Check thumb + middle
    if (checkKeyPointOverlap(
        hand.keypoints[THUMB_TIP].x, hand.keypoints[THUMB_TIP].y,
        hand.keypoints[MIDDLE_TIP].x, hand.keypoints[MIDDLE_TIP].y
    )) {
        const noteCombo = "thumb-middle";
        currentActiveNotes.add(noteCombo);
        if (!activeNotes.has(noteCombo)) {
            synth.triggerAttack(["C4", "E4"]);
        }
    }
    
    // Check thumb + ring
    if (checkKeyPointOverlap(
        hand.keypoints[THUMB_TIP].x, hand.keypoints[THUMB_TIP].y,
        hand.keypoints[RING_TIP].x, hand.keypoints[RING_TIP].y
    )) {
        const noteCombo = "thumb-ring";
        currentActiveNotes.add(noteCombo);
        if (!activeNotes.has(noteCombo)) {
            synth.triggerAttack(["C4", "F4"]);
        }
    }
    
    // Check thumb + pinky
    if (checkKeyPointOverlap(
        hand.keypoints[THUMB_TIP].x, hand.keypoints[THUMB_TIP].y,
        hand.keypoints[PINKY_TIP].x, hand.keypoints[PINKY_TIP].y
    )) {
        const noteCombo = "thumb-pinky";
        currentActiveNotes.add(noteCombo);
        if (!activeNotes.has(noteCombo)) {
            synth.triggerAttack(["C4", "G4"]);
        }
    }
    
    // Release notes that are no longer active
    activeNotes.forEach(noteCombo => {
        if (!currentActiveNotes.has(noteCombo)) {
            // Release the notes (they'll fade out naturally with the envelope)
            synth.triggerRelease(["C4", "D4", "E4", "F4", "G4"]);
        }
    });
    
    activeNotes = currentActiveNotes;
}

function checkKeyPointOverlap(point1x, point1y, point2x, point2y) {
    let distance = dist(point1x, point1y, point2x, point2y);
    const threshold = 25; // Adjust sensitivity here
    return distance < threshold;
}

function gotHands(results) {
    hands = results;
}