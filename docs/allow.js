
async function handleUserAccess() {
    let email = localStorage.getItem("userEmail");
    let token = localStorage.getItem("jwtToken");
    // console.log(email);
    // console.log(token);
    if (typeof email === "undefined"){
        localStorage.setItem("userEmail" , "");
    }
    if (typeof token === "undefined"){
        localStorage.setItem("jwtToken" , "");
    }
    email = localStorage.getItem("userEmail");
    token = localStorage.getItem("jwtToken");
    // console.log(email);
    // console.log(token);
    if (!email || !token) {
        document.getElementById("auth-link").style.display = "block";
        alert("Please Sign-in to access this Page!");
        window.location.href = "index.html";
        return;// No email or token found, user is not logged in
    }
    try {
            // console.log(email);
            const Response = await fetch(`https://my-backend-api-erp6.onrender.com/api/users/${email}`, {
                method: "GET",
                headers: {
                    "Authorization": `Bearer ${token}`, // Attach the token
                    "Content-Type": "application/json"
                }
            });
            const data = await Response.json();
            console.log(data.valid);
            if(data.valid === 5){
                alert("Server error! Try again later!");
                window.location.href = "index.html";
                return;
            }
            if(data.valid === 4 || data.valid === 2){
                alert("Unauthorized access");
                window.location.href = "index.html";
                return;
            }
            document.getElementById("logout-btn").style.display = "block"; // If valid, return 3, otherwise return 2
        } catch (error) {
            console.error("Error checking user status:", error);
            return; // Default to unauthorized in case of an error
        }
}
    handleUserAccess();
