// https://openprocessing.org/sketch/1789074 by Sam Darlow
var fontSize = 70
var scaleRate = 5
var message = 'Interfaces'
var inpactRange = 15;
var canvas;
var textData = [];
var dotsCordinate = [];
var particles =[];
var myFont;
var DATA;
var FPS = 20;
var SCENE_SCALE = 1;
var SCENE_WIDTH = 800  //2750 
var SCENE_HEIGHT = 450 //768

console.log("textTreatment.js loaded")

window.addEventListener("pose-landmarks", function (event) {
    //console.log('ws event',event)

    DATA = event.detail.poseLandmarkerResult
    //console.log("DATA set",typeof DATA ,DATA)
    
  });

window.addEventListener("speechRecognition", function (event) {
    //console.log('ws event',event)

    message = event.detail.result
   
    textData = getTextData(message.trim());
    //console.log('textData',textData)
    dotsCordinate = getCordinates();
    //console.log('dotsCordinate',dotsCordinate)
    particles = createParticles(scaleRate, 50, 0);
    //console.log('particles',particles)

  });


    var index = 0;

    class Particle {
        constructor(x, y) {
            this.x = x;
            this.y = y;
            this.r = 2;
            this.originalX = x;
            this.originalY = y;
            this.color = Math.floor(Math.random()*360);
            this.density = Math.random() * 30 + 10;
        }
    
        draw() {
            fill(this.color);
            circle(this.x, this.y, this.r * 2);
        }
    
        update(pose) {
            //console.log('update running', typeof pose)
            let distanceToOrigin = Math.sqrt(
                (this.originalX - this.x) ** 2 + (this.originalY - this.y) ** 2
            );

            let forced = false;
                for (let joint of pose) {
                    //console.log(joint)
                    let distanceToJoint = Math.sqrt(
                        (this.x - (joint.x * SCENE_WIDTH)) ** 2 +
                        (this.y - (joint.y * SCENE_HEIGHT)) ** 2    
                    )
                    if (distanceToJoint < inpactRange) {
                        let repulsionAngle = Math.atan2(
                            this.y - (joint.y * SCENE_HEIGHT),
                            this.x - (joint.x * SCENE_WIDTH)
                        );
                        let repulsionForce = (
                            (inpactRange - distanceToJoint) / inpactRange *
                            this.density
                        );
                        this.x += Math.cos(repulsionAngle) * repulsionForce;
                        this.y += Math.sin(repulsionAngle) * repulsionForce;
                        forced = true;
                    }
                }

            if (!forced) {
                let attractionAngle = Math.atan2(
                    this.originalY - this.y,
                    this.originalX - this.x
                );
                let attractionForce = Math.abs(distanceToOrigin) / this.density;
                this.x += Math.cos(attractionAngle) * attractionForce;
                this.y += Math.sin(attractionAngle) * attractionForce;                
            }

        }
    }

    function getTextData(message) {
        const data = [];
        text(message, 0, 25);    // draw once and get data
        console.log(textAscent())
        for(let y = 0; y < textAscent(); y++){
            let row = [];
            for(let x = 0; x < textWidth(message); x++){
                row.push(canvas.get(x, y))    // get data, [r, g, b, a]
            }
            data.push(row);
        }
        console.log('data',data)
        return data;
    }

    function getCordinates() {
        const cordinate = []
        //console.log('textData.length',textData.length)
        //console.log('textData[0].length',textData[0].length)
        
        for (let y = 0; y < textData.length; y++) {
            let row = []
            for (let x = 0; x < textData[0].length; x++) {
                // the data equals [0, 0, 0, 255] or [255, 255,255, 255].
                // So pick up red value and judge
                let red = textData[y][x][0];
                // if < 128, regard the pixel as 'black'(1);
                if (red < 128) {
                    row.push(1);
                }else{
                    row.push(0);
                }
            }
            //console.log(row)
            cordinate.push(row);
        }
        return cordinate
    }

    function createParticles(scaleRate, marginX, marginY) {
        const particles = [];
        //console.log('particles',particles)
        //console.log('dotsCordinate',dotsCordinate)
        for (let y = 0; y < dotsCordinate.length; y++) {
            for(let x = 0; x < dotsCordinate[0].length; x++){
                if(dotsCordinate[y][x] === 1){
                    let particle = new Particle(
                        x * scaleRate + marginX,
                        y * scaleRate + marginY
                    );
                    particles.push(particle)
                }
            }
        }
        return particles
    }

    function preload() {
        myFont = loadFont('lib/Disclaimer-Plain.otf');
    }

    function setup() {
        frameRate(FPS);
        canvas = createCanvas(SCENE_WIDTH, SCENE_HEIGHT);
        colorMode(RGB)
        noStroke();
        background("#");
        fill("#273E55");
        textSize(fontSize);
        textAlign(LEFT, CENTER);
    	textFont(myFont);
        textData = getTextData(message);
        console.log('textData',textData)
        dotsCordinate = getCordinates();
        console.log('dotsCordinate',dotsCordinate)
        particles = createParticles(scaleRate, 50, 0);
        console.log('particles',particles)
    }

    function draw() {
        //console.log('index',index,typeof DATA)
        background('#FFFFFF');
        clear()
        if(DATA){
            for(i =0; i < particles.length; i++){
                particles[i].update(DATA);
                particles[i].draw()
            }
        }
    }


// make sure the following line remains unchanged!
// stage = new p5(sketch, 'p5_stage')