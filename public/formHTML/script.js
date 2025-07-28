window.addEventListener("DOMContentLoaded",function(){
    console.log("JS test!");
    const submitButton = this.document.getElementById("submitButton");
    submitButton.addEventListener("click",submitBoardNumber);
    
    document.getElementById("input").addEventListener("keydown",function(event) {
        if(event.key === "Enter")
        {
            submitBoardNumber();
        }
    });

    let params = new URLSearchParams(window.location.search);
    let error = params.get("error");
    if(error)
    {
        this.alert(error);
    }
})

function submitBoardNumber()
{
    let number = document.getElementById("input").value;

    if(isNaN(number))
    {
        alert("The input has to be a valid number! Test!");
        document.getElementById("input").value = null;
        document.getElementById("input").focus();
        return;
    }

    if(number === "" || number === null || number === undefined)
    {
        document.getElementById("input").value = null;
        document.getElementById("input").focus();
        alert("The input has to be a valid number!");
        return;
    }

    console.log("Data was submited!");
    alert("Tap on the screen for entering fullscreen!");
    
    let pageURL = new URL(window.location.href);
    pageURL.searchParams.append('board',number);
    window.location.replace(pageURL);
}