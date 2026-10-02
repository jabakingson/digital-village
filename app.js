const loginForm = document.getElementById("loginForm");

if (loginForm) {

    loginForm.addEventListener("submit", async function (e) {

        e.preventDefault();

        const username = document.getElementById("username").value.trim();
        const password = document.getElementById("password").value;

        const message = document.getElementById("message");

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

            console.log("Login response:", data);

            if (data.success === true) {

                message.textContent = "Login successful!";

                // Go to dashboard
                window.location.href = "/dashboard";

            } else {

                message.textContent =
                    data.message || "Invalid username or password";

            }

        } catch (error) {

            console.error("Login error:", error);

            message.textContent = "Server connection error";

        }

    });

}