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
})

function submitBoardNumber()
{
    console.log("Data was submited!");
    alert("Tap on the screen for entering fullscreen!");
    let number = document.getElementById("input").value;
    let pageURL = new URL(window.location.href);
    pageURL.searchParams.append('board',number);
    window.location.replace(pageURL);
}