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
  const cluster = require("cluster");

  //* cluster setup
  const numCPUs = os.cpus().length;

  if(cluster.isMaster){
    console.log(`Master-Prozess läuft mit PID ${process.pid}`);
    for(let i = 0; i < numCPUs; i++)
    {
      cluster.fork();
    }
    
    cluster.on("exit",(worker,code,signal)=>{
      console.log(`Worker ${worker.process.pid} ist gestorben`);
    })

      // setup -run once
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
  console.log("---------------------------------------");
  console.log("-> use /remoteAccess for remote-control");
  console.log("-> use /data?board=n for recieving data");
  getLocalIP();
  console.log("");
  console.log("Server is listening on port " + 1337);
  console.log("---------------------------------------");
  console.log("=>");

  } else {
    console.log(`Worker-Prozess läuft mit PID ${process.pid}`);
    
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
      "default-src 'self'; script-src 'self' 'unsafe-eval' 'unsafe-inline'; style-src 'self' 'unsafe-inline'; worker-src 'self' blob:; connect-src 'self' blob:;"
    );
    next();
  });

  //? variables
  var appPort = 1337;
  const boards = [0,1];
  const data = [[1,2,3,4],[1,2,3,4]];
  const codes = [1,2];

  const timeout = [false,false];
  const TIMEOUT_DURATION = 1000;

  const handleTimeout = (boardNumber) => {
    timeout[boardNumber] = false;
    
    for(let i = 0; i < 4; i++)
    {
      data[boardNumber][i] = 0;
    }
  };

  //* routing

  app.get("/",(req,res)=>{
      res.send("<h1>Main root! Go to /remote :)</h1>");
  });

  app.get("/admin",(req,res)=>{
    res.sendFile(path.join(__dirname,'public','adminHTML','index.html'));
  })

  app.post("/adminInput",(req,res)=>{
    let boardNumber = req.body["board"];
    codes[boardNumber] = 0;
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

  app.get("/data",(req,res)=>{
    if(req.query["board"] == undefined) 
    {
      res.sendStatus(400); //Bad Request
      return;
    }
    let boardNumber = req.query["board"];
    res.json({"value1":data[boardNumber][0],"value2":data[boardNumber][1],"value3":data[boardNumber][2],"value4":data[boardNumber][3]});
  });

  app.all("*",(req,res)=>{
      res.send("<h1>Error: 404 Page not found!</h1>");
  });

  //? start server
  app.listen(appPort);
  }