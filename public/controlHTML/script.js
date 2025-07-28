window.addEventListener("DOMContentLoaded",function(){
    console.log("JS test!");
    console.log("Server made by Lorenz :)");

    let btn = this.document.getElementById("submitButton");
    btn.addEventListener("click",()=> {fetchCommand(
      getParam(),
      document.getElementById("input").value
    )});
})

function getParam()
{
  const urlParams = new URLSearchParams(window.location.search);
  return urlParams.get("board");
}

function fetchCommand(boardNumber,drivingMode)
{
  alert("Data send!");
  alert(drivingMode);

  fetch("/controlInput",{
      method: "POST",
      body: JSON.stringify({
          board: boardNumber,
          mode: drivingMode
      }),
      headers:{
        "Content-type": "application/json; charset=UTF-8"
      }
  });

  setTimeout(()=>{window.location.replace("/remote?board=" + boardNumber);}, 500);
}