window.addEventListener("DOMContentLoaded",function(){
    console.log("JS test!");
    const submitButton = this.document.getElementById("submitButton");
    submitButton.addEventListener("click",submitBoardNumber);
})

function submitBoardNumber()
{
    console.log("Data was submited!");
    let number = document.getElementById("input").value;
    let pageURL = new URL(window.location.href);
    pageURL.searchParams.append('board',number);
    window.location.replace(pageURL);
}