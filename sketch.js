const buttonStart = document.getElementById("start-button");
let synth;
let isAudioReady = false;

// Constants
const TOUCH_THRESHOLD = 25;
const MIN_HAND_CONFIDENCE = 0.5;
const CANVAS_WIDTH = 740;
const CANVAS_HEIGHT = 580;

// Finger tip indices from MediaPipe
const FINGER_INDICES = {
    THUMB: 4,
    INDEX: 8,
    MIDDLE: 12,
    RING: 16,
    PINKY: 20
};

// Finger combinations and their corresponding notes
const FINGER_COMBINATIONS = [
    { 
        name: "thumb-index", 
        fingers: [FINGER_INDICES.THUMB, FINGER_INDICES.INDEX], 
        notes: ["C4", "D4"] 
    },
    { 
        name: "thumb-middle", 
        fingers: [FINGER_INDICES.THUMB, FINGER_INDICES.MIDDLE], 
        notes: ["C4", "E4"] 
    },
    { 
        name: "thumb-ring", 
        fingers: [FINGER_INDICES.THUMB, FINGER_INDICES.RING], 
        notes: ["C4", "F4"] 
    },
    { 
        name: "thumb-pinky", 
        fingers: [FINGER_INDICES.THUMB, FINGER_INDICES.PINKY], 
        notes: ["C4", "G4"] 
    }
];

const fingerNotes = new Map([
    [FINGER_INDICES.THUMB, "C4"],
    [FINGER_INDICES.INDEX, "D4"],
    [FINGER_INDICES.MIDDLE, "E4"],
    [FINGER_INDICES.RING, "F4"],
    [FINGER_INDICES.PINKY, "G4"]
]);

// Tone.js setup
function startTone() {
    buttonStart.disabled = true;
    buttonStart.textContent = "Starting...";
    
    Tone.start().then(() => {
        console.log("Audio is ready");
        
        synth = new Tone.PolySynth(Tone.MonoSynth, {
            "oscillator": {
                "type": "fmsquare5",
                "modulationType": "triangle",
                "modulationIndex": 2,
                "harmonicity": 0.501
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
let activeNotes = new Map(); // Changed to Map to track specific note combinations
let lastHandDetectionTime = 0;
const HAND_TIMEOUT = 500; // Clear notes if no hands detected for 500ms

function preload() {
    handPose = ml5.handPose({
        maxHands: 2,
        runtime: 'mediapipe',
        modelType: "full"
    });
}

function setup() {
    let canvas = createCanvas(CANVAS_WIDTH, CANVAS_HEIGHT);
    canvas.parent('canvas-container');
    
    video = createCapture({
        video: {
            width: CANVAS_WIDTH,
            height: CANVAS_HEIGHT,
            facingMode: 'user'
        }
    });
    video.size(CANVAS_WIDTH, CANVAS_HEIGHT);
    video.hide();
    
    video.elt.addEventListener('loadedmetadata', () => {
        console.log('Camera ready, starting hand detection');
        handPose.detectStart(video, gotHands);
    });
}

function draw() {
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
    
    // Check for hand timeout and clear notes if needed
    if (isAudioReady && millis() - lastHandDetectionTime > HAND_TIMEOUT && activeNotes.size > 0) {
        clearAllActiveNotes();
    }
    
    // Process hands
    const validHands = getValidHands();
    
    for (let hand of validHands) {
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
    
    if (validHands.length === 0 && isAudioReady) {
        fill(255, 100, 100);
        text("No hands detected - show your hand to the camera", 10, 60);
    }
}

function getValidHands() {
    return hands.filter(hand => {
        // Basic validation - ensure hand has required keypoints
        if (!hand.keypoints || hand.keypoints.length < 21) return false;
        
        // Check if key fingertips are present and have reasonable coordinates
        const requiredTips = [FINGER_INDICES.THUMB, FINGER_INDICES.INDEX, 
                             FINGER_INDICES.MIDDLE, FINGER_INDICES.RING, FINGER_INDICES.PINKY];
        
        return requiredTips.every(tipIndex => {
            const keypoint = hand.keypoints[tipIndex];
            return keypoint && 
                   keypoint.x >= 0 && keypoint.x <= CANVAS_WIDTH &&
                   keypoint.y >= 0 && keypoint.y <= CANVAS_HEIGHT;
        });
    });
}

function drawHandPoints(hand) {
    // Draw all keypoints
    for (let keypoint of hand.keypoints) {
        fill(252, 123, 3);
        noStroke();
        circle(width - keypoint.x, keypoint.y, 10);
    }
    
    // Highlight fingertips
    const fingertips = Object.values(FINGER_INDICES);
    fingertips.forEach(tip => {
        if (hand.keypoints[tip]) {
            fill(22, 5, 255);
            circle(width - hand.keypoints[tip].x, hand.keypoints[tip].y, 12);
        }
    });

    // Add note labels above fingertips
    for (let [fingerIndex, note] of fingerNotes) {
        if (hand.keypoints[fingerIndex]) {
            fill(255);
            text(note, width - hand.keypoints[fingerIndex].x, hand.keypoints[fingerIndex].y - 20);
        }
    }
    
    drawConnections(hand);
}

function drawConnections(hand) {
    FINGER_COMBINATIONS.forEach(combo => {
        const [finger1, finger2] = combo.fingers;
        const kp1 = hand.keypoints[finger1];
        const kp2 = hand.keypoints[finger2];
        
        if (kp1 && kp2 && checkKeyPointOverlap(kp1.x, kp1.y, kp2.x, kp2.y)) {
            stroke(255, 255, 0);
            strokeWeight(3);
            line(width - kp1.x, kp1.y, width - kp2.x, kp2.y);
            noStroke();
        }
    });
}

function checkFingerTouches(hand) {
    if (!hand.keypoints || hand.keypoints.length < 21) return;
    
    const currentActiveNotes = new Set();
    
    // Check each finger combination
    FINGER_COMBINATIONS.forEach(combo => {
        const [finger1, finger2] = combo.fingers;
        const kp1 = hand.keypoints[finger1];
        const kp2 = hand.keypoints[finger2];
        
        if (kp1 && kp2 && checkKeyPointOverlap(kp1.x, kp1.y, kp2.x, kp2.y)) {
            currentActiveNotes.add(combo.name);
            
            // Trigger attack only if this combination wasn't already active
            if (!activeNotes.has(combo.name)) {
                synth.triggerAttack(combo.notes);
                activeNotes.set(combo.name, combo.notes);
            }
        }
    });
    
    // Release notes that are no longer active
    const notesToRelease = [];
    activeNotes.forEach((notes, comboName) => {
        if (!currentActiveNotes.has(comboName)) {
            notesToRelease.push(...notes);
            activeNotes.delete(comboName);
        }
    });
    
    // Release specific notes rather than all notes
    if (notesToRelease.length > 0) {
        // Remove duplicates before releasing
        const uniqueNotes = [...new Set(notesToRelease)];
        synth.triggerRelease(uniqueNotes);
    }
}

function checkKeyPointOverlap(point1x, point1y, point2x, point2y) {
    const distance = dist(point1x, point1y, point2x, point2y);
    return distance < TOUCH_THRESHOLD;
}

function clearAllActiveNotes() {
    if (activeNotes.size > 0) {
        // Release all currently active notes
        const allActiveNotes = [];
        activeNotes.forEach(notes => allActiveNotes.push(...notes));
        const uniqueNotes = [...new Set(allActiveNotes)];
        
        if (uniqueNotes.length > 0) {
            synth.triggerRelease(uniqueNotes);
        }
        
        activeNotes.clear();
        console.log("Cleared all active notes - no hands detected");
    }
}

function gotHands(results) {
    hands = results;
    if (results.length > 0) {
        lastHandDetectionTime = millis();
    }
}