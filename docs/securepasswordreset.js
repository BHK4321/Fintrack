
async function secured(){
    const email = localStorage.getItem("userEmail");
    const token = localStorage.getItem("resetToken");
    console.log(token);
    const userResp = await fetch(`http://localhost:5000/api/auth/check/${email}`, {
        method: "GET",
        headers: {
            "Content-Type": "application/json",
            "Authorization": `Bearer ${token}` // Attach JWT token
        }
    });
    const userData = await userResp.json();
    console.log(userData.valid);
    if(userData.valid === 4 || userData.valid === 5 || userData.valid === 2){
        alert("Unauthorised accs!");
        localStorage.removeItem("resetToken");
        localStorage.removeItem("userEmail");
        return;
    }
    if(userData.valid === 6){
        alert("Error! Please try again!");
        window.location.href = "http://localhost:8000/forgotpassword"
        return;
    }
}
secured();