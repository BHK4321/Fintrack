
async function secured(){
    const email = localStorage.getItem("userEmail");
    const token = localStorage.getItem("resetToken");
    console.log(token);
    const userResp = await fetch(`https://my-backend-api.onrender.com/api/auth/check/${email}`, {
        method: "GET",
        headers: {
            "Content-Type": "application/json",
            "Authorization": `Bearer ${token}` // Attach JWT token
        }
    });
    const userData = await userResp.json();
    console.log(userData.valid);
    if(userData.valid === 4 || userData.valid === 5 || userData.valid === 2){
        alert("Unauthorised access!");
        localStorage.removeItem("resetToken");
        localStorage.removeItem("userEmail");
        window.location.href = "index.html";
        return;
    }
    if(userData.valid === 6){
        alert("Error! Please try again!");
        window.location.href = "forgotpassword.html";
        return;
    }
}
secured();
