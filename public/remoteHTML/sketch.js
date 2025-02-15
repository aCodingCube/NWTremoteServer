// global variable
let primCircle;
let normPrimCircle;
let secCircle;
let normSecCircle;
let primCircleStart;
let secCircleStart;
let circleR, circleBackgroundMod, maxTouchR;

function setup() {
  createCanvas(windowWidth, windowHeight);
  background("gray");

  // setting start values
  primCircleStart = createVector(windowWidth/4,windowHeight/2);
  secCircleStart = createVector(windowWidth-(windowWidth/4),windowHeight/2);

  primCircle = createVector(primCircleStart.x,primCircleStart.y);
  secCircle = createVector(secCircleStart.x,secCircleStart.y);
  
  circleR = windowHeight / 6;
  circleBackgroundMod = windowHeight / 8;
  maxTouchR = windowWidth / 7;
}

function draw() {
  background("gray");

  // background circles
  fill("orange");
  ellipse(primCircleStart.x,primCircleStart.y, circleR + circleBackgroundMod);
  ellipse(secCircleStart.x,secCircleStart.y, circleR + circleBackgroundMod);

  // main circles
  fill("red");
  ellipse(primCircle.x,primCircle.y, circleR);
  fill("green");
  ellipse(secCircle.x,secCircle.y, circleR);

  // logic
  let primCircleMod = false;
  let secCircleMod = false;

  for (let touch of touches) {
    // move circle until r
    if (touch.x < (windowWidth/2)) {
      primCircleMod = true;
      let angle = atan2(touch.y - primCircleStart.y,touch.x - primCircleStart.x);
      let distance = dist(touch.x,touch.y, primCircleStart.x,primCircleStart.y);
      let factor = constrain(distance,0,maxTouchR);
      primCircle.x = primCircleStart.x + cos(angle) * factor;
      primCircle.y = primCircleStart.y + sin(angle) * factor;
    }
    // move circle until r
    if (touch.x > (windowWidth/2)) {
      secCircleMod = true;
      let angle = atan2(touch.y - secCircleStart.y,touch.x - secCircleStart.x);
      let distance = dist(touch.x,touch.y, secCircleStart.x,secCircleStart.y);
      let factor = constrain(distance,0,maxTouchR);
      secCircle.x = secCircleStart.x + cos(angle) * factor;
      secCircle.y = secCircleStart.y + sin(angle) * factor;
    }
  }
  
  if (!primCircleMod) {
    primCircle.x = primCircleStart.x;
    primCircle.y = primCircleStart.y;
  }
  if (!secCircleMod) {
    secCircle.x = secCircleStart.x;
    secCircle.y = secCircleStart.y;
  }
}

// fullscreen
function mousePressed() {
  if (mouseX > 0 && mouseX < windowWidth && mouseY > 0 && mouseY < windowHeight) {
    fullscreen(true);
  }
}

// resize everything on resive (fullscreen)
function windowResized() {
  resizeCanvas(windowWidth, windowHeight);
  background("#808080");

  // Bildschirmabhängige Variablen neu setzen
  primCircleStart.x = windowWidth/4;
  primCircleStart.y = windowHeight/2;
  secCircleStart.x = windowWidth-(windowWidth/4);
  secCircleStart.y = windowHeight/2;

  circleR = windowHeight / 6;
  circleBackgroundMod = windowHeight / 8;
  maxTouchR = windowWidth / 6;

  // Kreise zurücksetzen
  primCircle.x = primCircleStart.x;
  primCircle.y = primCircleStart.y;
  secCircle.x = secCircleStart.x;
  secCircle.y = secCircleStart.y;
}
