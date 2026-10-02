const loginForm = document.getElementById("loginForm");
const message = document.getElementById("message");

loginForm.addEventListener("submit", async function (e) {

    e.preventDefault();

    const username = document.getElementById("username").value.trim();
    const password = document.getElementById("password").value;

    message.textContent = "Checking login...";

    try {

        const response = await fetch("/login", {
            method: "POST",
            headers: {
                "Content-Type": "application/json"
            },
            body: JSON.stringify({
                username: username,
                password: password
            })
        });

        const data = await response.json();

        console.log("LOGIN RESPONSE:", data);

        if (data.success === true) {

            message.textContent = "Login successful!";

            // IMPORTANT
            window.location.href = "/dashboard";

        } else {

            message.textContent = data.message || "Invalid login";

        }

    } catch (error) {

        console.error("ERROR:", error);

        message.textContent = "Server error";

    }

});