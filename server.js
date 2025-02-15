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

  app.use(
    helmet({
      contentSecurityPolicy: {
        directives: {
          defaultSrc: ["'self'"],
          scriptSrc: ["'self'", "'unsafe-eval'"], // Erlaubt eval()
          styleSrc: ["'self'", "'unsafe-inline'"], // Falls du Inline-CSS hast
        },
      },
    })
  );

  //? variables
  var appPort = 1337;
  const boards = [0,1];
  const data = [[1],[2]];
  const codes = [[1],[2]];

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

  //* routing

  app.get("/",(req,res)=>{
      res.send("Main root");
  });

  app.get("/remoteAccess",(req,res)=>{
    let boardNumber = parseInt(req.query["board"]);
    if(boardNumber == undefined || Number.isNaN(boardNumber)) {
      res.sendFile(path.join(__dirname,'public','formHTML','index.html'));
      return;
    }

    if(boards.includes(boardNumber) == false)
    {
      res.redirect("/remoteAccess");
      return;
    }

    let secureRandom = crypto.randomInt(0,1000000);
    let secureCode = secureRandom.toString().padStart(6, "0");
    codes[boardNumber] = secureCode;
    res.cookie("AccessCode",secureCode,{httpOnly: true});
    res.redirect("/remote?board=" + boardNumber);
  });

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

  app.post("/dataInput",(req,res)=>{
    let boardNumber = req.body["board"];
    data[boardNumber] = req.body["value"];
    res.end();
  })

  app.get("/data",(req,res)=>{
    if(req.query["board"] == undefined) 
    {
      res.sendStatus(400); //Bad Request
      return;
    }
    let boardNumber = req.query["board"];
    res.json({"value":data[boardNumber]});
  });

  app.all("*",(req,res)=>{
      res.send("<h1>Error: 404 Page not found!</h1>");
  });

  //? start server
  app.listen(appPort);
  console.log("---------------------------------------");
  console.log("Server is listening on port " + appPort);
  console.log("-> use /remoteAccess for remote-control");
  console.log("-> use /data?board=n for recieving data");
  console.log("---------------------------------------");
  getLocalIP();