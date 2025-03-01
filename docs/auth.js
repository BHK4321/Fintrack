
async function handleUserAccess() {
    const email = localStorage.getItem("userEmail");
    const token = localStorage.getItem("jwtToken");
    if (typeof email === "undefined"){
        localStorage.setItem("userEmail" , null);
    }
    if (typeof token === "undefined"){
        localStorage.setItem("jwtToken" , null);
    }
    if (!email || !token) {
        document.getElementById("auth-link").style.display = "block";
        return;// No email or token found, user is not logged in
    }
    try {
            console.log(email);
            const Response = await fetch(`https://my-backend-api.onrender.com/api/users/${email}`, {
                method: "GET",
                headers: {
                    "Authorization": `Bearer ${token}`, // Attach the token
                    "Content-Type": "application/json"
                }
            });
            const data = await Response.json();
            if(data.valid === 5){
                alert("Server error! Try again later!");
                return;
            }
            if(data.valid === 4 || data.valid === 2){
                alert("Unauthorized access");
                return;
            }
            document.getElementById("logout-btn").style.display = "block"; // If valid, return 3, otherwise return 2
        } catch (error) {
            console.error("Error checking user status:", error);
            return; // Default to unauthorized in case of an error
        }
}
    handleUserAccess();
   async function logout() {
        const log = await fetch(`https://my-backend-api.onrender.com/api/logout`,{
             method : "POST",
             headers: {
                "Content-Type": "application/json"
            }
        });
        localStorage.removeItem("jwtToken");
        localStorage.removeItem("userEmail");
        alert("Logged out!");
        window.location.href = "index.html";
    }
