window.addEventListener("DOMContentLoaded",function(){
    const submitButton = this.document.getElementById("submitButton");
    submitButton.addEventListener("click",fetchData);
});

function fetchData()
{
    console.log("Send data to server!");

    let urlParams = new URLSearchParams(window.location.search);
    let param = urlParams.get("board");
    console.log(param);
   

    fetch("/dataInput",{
        method: 'POST',
        headers: {
            'Content-Type': 'application/json'
        },
        body: JSON.stringify({
            board: param,
            value: 8
        })
    })
};