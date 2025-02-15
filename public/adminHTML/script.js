window.addEventListener("DOMContentLoaded",function(){
    console.log("JS test!");
    console.log("Server made by Lorenz :)");

    let btn1 = this.document.getElementById("btn1");
    btn1.addEventListener("click",()=>fetchKickCommand(0));
    let btn2 = this.document.getElementById("btn2");
    btn2.addEventListener("click",()=>fetchKickCommand(1));
})

function fetchKickCommand(boardNumber)
{
    fetch("/adminInput",{
        method: "POST",
        body: JSON.stringify({
            board: boardNumber
        }),
        headers:{
          "Content-type": "application/json; charset=UTF-8"
        }

      });
}