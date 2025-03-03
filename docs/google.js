
async function googleSignIn() {

    google.accounts.id.initialize({
        client_id: "132007011528-thn7vlbhj76ke4krvmmpnc9vvntbobjv.apps.googleusercontent.com",
        callback: handleCredentialResponse
    });

    google.accounts.id.prompt();
                // Opens Google sign-in popup
}
// Frontend handler function
async function handleCredentialResponse(response) {
  const token = response.credential;
  console.log("Google token received:", token);
  
  fetch("https://my-backend-api-erp6.onrender.com/api/google-signin", {
    method: "POST",
    headers: {
      "Content-Type": "application/json"
    },
    body: JSON.stringify({ token }),
  })
  .then(res => res.json())
  .then(data => {
    if (data.status === "new_user") {
      // Redirect to signup page for new users
      alert("Please Sign-up first");
      window.location.href = "signup.html";
    } else if (data.token) {
      // Existing user - store the token and redirect to dashboard
      localStorage.setItem("jwtToken", data.token);
      localStorage.setItem("userEmail", data.user.email);
      localStorage.setItem("monthlyincome", data.user.monthlyincome || "0");
      alert("Login successful!");
      window.location.href = "dashboard.html";
    } else {
      alert("Login failed: " + (data.error || "Unknown error"));
    }
  })
  .catch(error => {
    console.error("Login Error:", error);
    alert("Login failed. Please try again.");
  });
}
