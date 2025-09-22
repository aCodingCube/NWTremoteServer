window.addEventListener("DOMContentLoaded",function(){
    console.log("JS test!");
    console.log("Server made by Lorenz :)");

    let btn = this.document.getElementById("submitButton");
    btn.addEventListener("click",()=> {fetchCommand(
      getParam(),
      document.getElementById("input").value
    )});

    document.getElementById("input").addEventListener("keydown",function(event) {
        if(event.key === "Enter")
        {
            fetchCommand(
              getParam(),
              document.getElementById("input").value
            )
        }
    });

    let params = new URLSearchParams(window.location.search);
    let error = params.get("error");
    if(error)
    {
        this.alert(error);
    }
})

function getParam()
{
  const urlParams = new URLSearchParams(window.location.search);
  return urlParams.get("board");
}

function fetchCommand(boardNumber,drivingMode)
{
    if(isNaN(drivingMode))
    {
        alert("The input has to be a valid number! Test!");
        document.getElementById("input").value = null;
        document.getElementById("input").focus();
        return;
    }

    if(drivingMode === "" || drivingMode === null || drivingMode === undefined)
    {
        document.getElementById("input").value = null;
        document.getElementById("input").focus();
        alert("The input has to be a valid number!");
        return;
    }

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

  alert("Driving-Mode changed!");
}