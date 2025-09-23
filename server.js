  //? includes
  const express = require("express");
  const helmet = require("helmet");
  const path = require("path");
  const fs = require("fs");
  const app = express();
  var bodyParser = require("body-parser");
  const cookieParser = require('cookie-parser');
  const crypto = require("crypto");
  const dns = require('node:dns');
  const os = require('node:os');

  //? setup / middleware
  app.use(helmet());  
  app.use(cookieParser());
  // for getting data from client
  app.use(bodyParser.json());
  app.use(bodyParser.urlencoded({extended: true}));

  app.use(express.static(path.join(__dirname, 'public')));

  app.use((req, res, next) => {
  res.setHeader(
    'Content-Security-Policy',
    "default-src 'self'; script-src 'self' 'unsafe-eval' 'unsafe-inline' blob:; style-src 'self' 'unsafe-inline'; worker-src 'self' blob:; connect-src 'self' blob:;"
  );

    next();
  });

  //? variables
  var appPort = 1337;
  const boards = [0,1];
  const data = [[1,2,3,4],[1,2,3,4]];
  const possibleModes = [0,1,2];
  const mode = [0,0];
  const codes = [1,2];

  codes[0] = null;
  codes[1] = null;

  const timeout = [false,false];
  const TIMEOUT_DURATION = 1000;

  //* IP-Stuff
  const getLocalIP = () => {
    let result = false;
    const networkInterfaces = os.networkInterfaces();
    // First, try to get the IP from the "Ethernet" interface (LAN)
    if (networkInterfaces['Ethernet']) {
      for (const networkInterface of networkInterfaces['Ethernet']) {
        // Ensure we have a valid IPv4 address and it's not a loopback address
        if (networkInterface.family === 'IPv4' && networkInterface.address && !networkInterface.address.startsWith('127.')) {
          console.log("Ethernet IP found: ", networkInterface.address);
          result = true;
        }
      }
    }
  
    if (networkInterfaces['WLAN']) {
      for (const networkInterface of networkInterfaces['WLAN']) {
        // Ensure we have a valid IPv4 address and it's not a loopback address
        if (networkInterface.family === 'IPv4' && networkInterface.address && !networkInterface.address.startsWith('127.')) {
          console.log("WLAN IP found: ", networkInterface.address);
          result = true;
        }
      }
    }

    if (networkInterfaces['Ethernet 4']) {
      for (const networkInterface of networkInterfaces['Ethernet 4']) {
        // Ensure we have a valid IPv4 address and it's not a loopback address
        if (networkInterface.family === 'IPv4' && networkInterface.address && !networkInterface.address.startsWith('127.')) {
          console.log("Ethernet 4 IP found: ", networkInterface.address);
          result = true;
        }
      }
    }

    if(result == true)
    {
      return;
    }

    console.log("Network Interfaces:", networkInterfaces);
    console.log("No IP was found!");
    return null; // Only return null if **no valid IPs** were found
  };

  //* Timeout handle (if user using remote is going inactive)

  const handleTimeout = (boardNumber) => {
    timeout[boardNumber] = false;
    
    for(let i = 0; i < 4; i++)
    {
      data[boardNumber][i] = 0;
    }
  };

  //* routing

  //* main
  app.get("/",(req,res)=>{
      res.send(
        "<h1>Main root! :)</h1>" + 
        "<h2>-> use /remote for remote-control</h2>" + 
        "<h2>-> use /data?board=n for recieving</h2>" + 
        "<h2>-> use /modeControl?board=n to change the driving</h2>" + 
        "<h2>-> use /admin to kick controlling devices</h2>"
      );
  });

  //* admin
  // get //Todo add option to see all connections
  app.get("/admin",(req,res)=>{
    res.sendFile(path.join(__dirname,'public','adminHTML','index.html'));
  })
  // post
  app.post("/adminInput",(req,res)=>{
    let boardNumber = req.body["board"];
    codes[boardNumber] = null;
  });

  //* driving-mode control
  // get
  app.get("/modeControl",(req,res)=>{
    let boardNumber = parseInt(req.query["board"]);
    if(boardNumber == undefined || Number.isNaN(boardNumber))
    {
      res.send("Missing board number!");
      return;
    }

    res.sendFile(path.join(__dirname,'public','controlHTML','index.html'))
  })

  // post
  app.post("/controlInput",(req,res)=>{
    let boardNumber = parseInt(req.body["board"]);
    let modeNumber = parseInt(req.body["mode"]);

    if(!possibleModes.includes(modeNumber))
    {
      console.log("Error!!");
      res.redirect("/modeControl?board=" + boardNumber +"&error=Invalid mode number. Valid are 0,1,2!");
      return;
    }
    mode[boardNumber] = modeNumber;
    res.redirect("/remote?board=" + boardNumber);
    return;
  });

  //* remote
  
  // get (remoteAccess) -> user creating session and id
  app.get("/remoteAccess",(req,res)=>{
    // get board-number
    let boardNumber = parseInt(req.query["board"]);

    // no board-number specified? -> show form
    if(boardNumber == undefined || Number.isNaN(boardNumber)) {
      res.sendFile(path.join(__dirname,'public','formHTML','index.html'));
      return;
    }

    // board-number is not existing! -> error + back to form
    if(boards.includes(boardNumber) == false) // boardnumber not valid
      {
      res.redirect("/remoteAccess?error=boardNumber is not valid!");
      return;
    }
    
    // already a board connected? -> back to form
    console.log("Test -174: " + codes[boardNumber]);
    if(codes[boardNumber] != null)
    {
      //Todo add error message
      res.sendFile(path.join(__dirname,'public','formHTML','index.html'));
      return;
    }

    // generate session-id
    let secureRandom = crypto.randomInt(0,1000000);
    let secureCode = secureRandom.toString().padStart(6, "0");

    codes[boardNumber] = secureCode; // store session-id on server
    res.cookie("AccessCode",secureCode,{httpOnly: true}); // store session-id as cookie on client

    res.redirect("/remote?board=" + boardNumber); // redirect to remote-control
  });

  // get (remote) -> user entering remote using session id
  app.get("/remote",(req,res)=>{
    let boardNumber = parseInt(req.query["board"]);
    if(boardNumber == undefined || Number.isNaN(boardNumber)) {
      res.redirect("/remoteAccess");
      return;
    }

    if(req.cookies["AccessCode"] != codes[boardNumber]) 
    {
      res.redirect("/remoteAccess");
      return;
    }

    res.sendFile(path.join(__dirname,'public','remoteHTML','index.html'));
    return;
  });

  // post -> recieving data from remote
  app.post("/dataInput",(req,res)=>{
    let boardNumber = req.body["board"];
    if(req.cookies["AccessCode"] != codes[boardNumber]) 
    {
      res.json({ redirect: "/remoteAccess" });
      return;
    }
    for(let i = 0; i < 4; i++)
    {
      data[boardNumber][i] = req.body["value" + (i+1)];
    }

    if(timeout[boardNumber])
    {
      clearTimeout(timeout[boardNumber]);
    }

    timeout[boardNumber] = setTimeout(() => handleTimeout(boardNumber),TIMEOUT_DURATION);

    res.end();
  })

  //* data
  // get -> arduino requesting data
  app.get("/data",(req,res)=>{
    if(req.query["board"] == undefined) 
    {
      res.sendStatus(400); //Bad Request
      return;
    }
    let boardNumber = req.query["board"];
    res.json({"value1":data[boardNumber][0],"value2":data[boardNumber][1],"value3":data[boardNumber][2],"value4":data[boardNumber][3],"mode":mode[boardNumber]});
  });

  //* 404
  // get 404 page
  app.all("*",(req,res)=>{
      res.send("<h1>Error: 404 Page not found!</h1>");
  });

  //? start server
  app.listen(appPort);
  console.log("---------------------------------------");
  console.log("Server is listening on port " + appPort);
  console.log("-> use /remote for remote-control");
  console.log("-> use /data?board=n for recieving data");
  console.log("-> use /modeControl?board=n to change the driving mode");
  console.log("-> use /admin to kick controlling devices");
  console.log("---------------------------------------");
  getLocalIP();