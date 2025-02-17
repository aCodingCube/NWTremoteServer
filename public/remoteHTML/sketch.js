// global variable
let primCircle;
let normPrimCircle;
let secCircle;
let normSecCircle;
let primCircleStart;
let secCircleStart;
let circleR, circleBackgroundMod, maxTouchR;
let returnBtn;
let returnText;
let vertDrawSwitch;

function setup() {
  createCanvas(windowWidth, windowHeight);
  background("#d62828"); // dunkel blau

  // setting start values
  primCircleStart = createVector(windowWidth/4,windowHeight/2);
  secCircleStart = createVector(windowWidth-(windowWidth/4),windowHeight/2);

  primCircle = createVector(primCircleStart.x,primCircleStart.y);
  secCircle = createVector(secCircleStart.x,secCircleStart.y);
  
  circleR = windowHeight / 6;
  circleBackgroundMod = windowHeight / 8;
  maxTouchR = windowWidth / 7;

  returnText = createDiv("Please turn the device!");
  returnText.style('font-size', '12vw');
  returnText.style('font-weight','bold');
  returnText.style('font-family','sans-serif');
  returnText.style('color', '#EAEAEA');
  returnText.style('font-weight', 'bold');
  returnText.style('text-align', 'center');
  returnText.style('position', 'absolute');
  returnText.hide();

  returnBtn = createButton("Return to access-point!");
  returnBtn.mousePressed(() => {
    remove();
    setTimeout(()=>{window.location.replace("/remoteAccess");}, 50);
    fullscreen(false);
  });
  returnBtn.style('font-weight','bold');
  returnBtn.style('background-color', '#003049');
  returnBtn.style('color', '#EAEAEA');
  returnBtn.style('border', 'none');
  returnBtn.style('cursor', 'pointer');
  returnBtn.hide();

  vertDrawSwitch = true;
}

function draw() {

  if(windowHeight > windowWidth)
  {


    if(!vertDrawSwitch)
    {return;}

    windowResized();
    vertDrawSwitch = false;

    returnText.show();
    returnText.style('font-size', '12vw');
    returnText.style('text-align', 'center');
    returnText.style('position', 'absolute');
    returnText.style('top', height / 2 - returnText.elt.offsetHeight / 2 - 60 + "px");
    returnText.style('left', width / 2 - returnText.elt.offsetWidth / 2 + "px");

    returnBtn.show();
    returnBtn.size(windowWidth /2, windowHeight/8);
    returnBtn.position(width / 2 - returnBtn.width / 2, height / 2 + 100);
    returnBtn.style('font-size', '6vw');
    returnBtn.style('border-radius', '8px');
    returnBtn.style('text-align','center');


    return;
  }

  vertDrawSwitch = true;
  returnText.hide();
  returnBtn.hide();

  background("#003049"); // dunkel blau

  // background circles
  fill("#C0D6DF"); // hell-blau
  ellipse(primCircleStart.x,primCircleStart.y, circleR + circleBackgroundMod);
  ellipse(secCircleStart.x,secCircleStart.y, circleR + circleBackgroundMod);

  // main circles
  fill("#D62828"); // red
  ellipse(primCircle.x,primCircle.y, circleR);
  fill("#F77F00"); // orange
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

  fetchDataToServer(primCircle.x - primCircleStart.x, primCircle.y - primCircleStart.y,
    secCircle.x - secCircleStart.x, secCircle.y - secCircleStart.y
  );

}

// fullscreen
function mousePressed() {
  if(windowHeight > windowWidth)
  {
    return;
  }
  if (mouseX > 0 && mouseX < windowWidth && mouseY > 0 && mouseY < windowHeight) {
    fullscreen(true);
  }
}

// resize everything on resive (fullscreen)
function windowResized() {
  resizeCanvas(windowWidth, windowHeight);

  if(windowHeight > windowWidth)
  {
    background("#D62828"); // rot
  }
  else
  {
    background("#003049"); // dunkel-blau
  }

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

function fetchDataToServer(value1X,value1Y,value2X,value2Y)
{
  const params = new URLSearchParams(window.location.search);
  const boardNumber = params.get('board');

  value1X = round(value1X);
  value1Y = round(value1Y);
  value2X = round(value2X);
  value2Y = round(value2Y);

  fetch("/dataInput",{
    method: "POST",
    body: JSON.stringify({
      board: boardNumber,
      value1: value1X,
      value2: value1Y,
      value3: value2X,
      value4: value2Y
    }),
    headers:{
      "Content-type": "application/json; charset=UTF-8"
    }
  }).then(response => {
      // Prüfe auf serverseitige Redirects
      if (response.redirected) {
          window.location.href = response.url; // Automatische Weiterleitung
          return;
      }

      // Prüfe auf JSON-Antwort mit Redirect
      return response.json();
  })
  .then(data => {
      if (data && data.redirect) {
          window.location.href = data.redirect; // Manuelles Weiterleiten
      }
  })
  .catch(error => console.error("Fehler beim Senden des Requests:", error));
}