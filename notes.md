## SOUND1
light, airy, echoe-y
### DUO SYNTH
```
{
    "vibratoAmount"  : 0.3,
	"vibratoRate"  : 3,
	"harmonicity"  : 1.5,
	"voice0"  : {
		"volume"  : -10 ,
		"portamento"  : 0 ,
		"oscillator"  : {
		    "type"  : "sine"
		}  ,
		"filterEnvelope"  : {
			"attack"  : 0.1 ,
			"decay"  : 0 ,
			"sustain"  : 1.5,
			"release"  : 0.5
		}  ,
		"envelope"  : {
			"attack"  : 0.01 ,
			"decay"  : 0 ,
			"sustain"  : 1 ,
			"release"  : 0.5
		}
	}  ,
	"voice1"  : {
		"volume"  : -20 ,
		"portamento"  : 0 ,
		"oscillator"  : {
		    "type"  : "sine"
		}  ,
		"filterEnvelope"  : {
			"attack"  : 0.01 ,
			"decay"  : 0 ,
			"sustain"  : 1 ,
			"release"  : 0.5
		}  ,
		"envelope"  : {
			"attack"  : 0.01 ,
			"decay"  : 0 ,
			"sustain"  : 1 ,
			"release"  : 0.5
		}
    }
}
```
### EFFECT: JCREVERB 
```
{
	"roomSize" : 0.9,
    "wet": 0.5
}
```
### Notes A-F, C#

---
## SOUND2
bassy but not too deep 
### MEMBRANE SYNTH
```
{
	"pitchDecay"  : 2 ,
	"octaves"  : 0.3 ,
	"oscillator"  : {
		"type"  : "sine"
}  ,
	"envelope"  : {
		"attack"  : 0.01 ,
		"decay"  : 0.9 ,
		"sustain"  : 0.01 ,
		"release"  : 1.4 ,
		"attackCurve"  : "exponential"
	}
}
```

### Notes C4,E4,F4,G4,A4 16n all
---

## SOUND3
traingl-y, higher
### MEMBRANE SYNTH
```
{
	"pitchDecay"  : 0.05 ,
	"octaves"  : 7 ,
	"oscillator"  : {
		"type"  : "triangle"
}  ,
	"envelope"  : {
		"attack"  : 0.01 ,
		"decay"  : 0.5 ,
		"sustain"  : 0.001 ,
		"release"  : 1 ,
		"attackCurve"  : "exponential"
	}
}
```
### EFFECT: FREEVERB
```
{
	"roomSize": 0.7,
	"dampening": 4000,
    "wet": 0.4
}
```
### Notes C4,D4,E4,F4, G4
---
## SOUND4
guitar like string, bass
### MONOSYNTH
```
{
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
}
```
### EFFECT: PITCHSHIFT
```
{
	"pitch": -5,
	"windowSize": 0.05,
	"delayTime": 0.3,
	"feedback": 0.2,
    "wet": 0.5
}
```
### Notes D, E, F, G, A, D#, C# 