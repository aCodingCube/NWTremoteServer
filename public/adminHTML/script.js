window.addEventListener("DOMContentLoaded", function () {
  console.log("JS test!");
  console.log("Server made by Lorenz :)");

  let btn1 = this.document.getElementById("btn1");
  btn1.addEventListener("click", () => fetchKickCommand(0));
  let btn2 = this.document.getElementById("btn2");
  btn2.addEventListener("click", () => fetchKickCommand(1));

  this.setInterval(fetchUpdate,1000);
})

function fetchKickCommand(boardNumber) {
  fetch("/adminInput", {
    method: "POST",
    body: JSON.stringify({
      board: boardNumber
    }),
    headers: {
      "Content-type": "application/json; charset=UTF-8"
    }
  });
}

function fetchUpdate() {
  fetch("/adminUpdate")
  .then(response =>{ return response.json()})
  .then(data => {
    console.log("-Update-");
    let data1 = data.idValue1 == null ? "null" : data.idValue1;
    let data2 = data.idValue2 == null ? "null" : data.idValue2;
    document.getElementById("infoLeft").innerText = data1;
    document.getElementById("infoRight").innerText = data2;
  });
}