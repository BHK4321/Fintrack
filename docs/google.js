
function googleSignIn() {
    google.accounts.id.initialize({
        client_id: "132007011528-thn7vlbhj76ke4krvmmpnc9vvntbobjv.apps.googleusercontent.com",
        callback: handleCredentialResponse
    });

    google.accounts.id.prompt(); // Opens Google sign-in popup
}
function handleCredentialResponse(response) {
    const token = response.credential;

    fetch("https://my-backend-api.onrender.com/api/google-signin", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ token }),
    })
    .then(res => res.json())
    .then(data => {
        if (data.status === "new_user") {
            // Redirect user to sign-up page
            alert("Please Sign-up first");
            window.location.href = "signup.html";
        } else if (data.token) {
            // User exists, proceed to dashboard
            localStorage.setItem("jwtToken", data.token);
            localStorage.setItem("userEmail", data.user.email);
            alert("Login successful!");
            window.location.href = "dashboard.html";
        } else {
            alert("Login failed: " + data.error);
        }
    })
    .catch(error => {
        console.error("Login Error:", error);
    });
}
