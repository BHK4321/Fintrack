
async function handleUserAccess() {
    let email = localStorage.getItem("userEmail");
    let token = localStorage.getItem("jwtToken");

    if (!email || !token) {
        return;// No email or token found, user is not logged in
    }

    try {
            // console.log(email);
             const response = await fetch("https://my-backend-api-erp6.onrender.com/api/jwt-auth", {
            method: "POST",
            headers: {
                "Content-Type": "application/json"
            },
            body: JSON.stringify({ token, email }) // Send token & email in the request body
        });
            const data = await response.json();
            console.log(data.valid);
            if(data.valid === 5){
                alert("Server error! Some functionality might not work!");
                return;
            }
            if(data.valid === 2){
                logout();
                return;
            }
            if(data.valid === 0){
                return;
            }
            alert("User already Logged-in!");
            document.getElementById("logout-btn").style.display = "block";
             window.location.href = "dashboard.html";// If valid, return 3, otherwise return 2
        } catch (error) {
            console.error("Error checking user status:", error);
            return; // Default to unauthorized in case of an error
        }
}
    handleUserAccess();
async function logout() {
        const log = await fetch(`https://my-backend-api-erp6.onrender.com/api/logout`,{
             method : "POST",
             headers: {
                "Content-Type": "application/json"
            }
        });
        localStorage.clear();
        window.location.href = "index.html";
    }
