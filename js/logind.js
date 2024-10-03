function fetchAnyUrl(url) {
    return fetch(url).then(response => response.json());
}

async function postObjectAsJson(url, object, httpVerbum) {
    const objectAsJsonString = JSON.stringify(object);
    console.log(objectAsJsonString);
    const fetchOptions = {
        method: httpVerbum,
        headers: {
            "Content-Type": "application/json",
        },
        body: objectAsJsonString
    }
    const response = await fetch(url, fetchOptions);
    return response;
}

console.log("er i Usertable")

const urlUser = "http://localhost:8080/users"

async function loginUser(email, password) {
    try {
        // Fetch all users from the backend
        const users = await fetchAnyUrl(urlUser);

        // Find if the user with the entered email exists
        const user = users.find(us => us.email === email);

        if (user) {
            // Check if the password matches
            if (user.password === password) {
                console.log("Login successful!", user);

                // Redirect based on privilege level (now comparing strings)
                if (user.privilegeLevel === 'CUSTOMER') {
                    console.log("Redirecting to customer.html");
                    window.location.href = 'customer.html';
                } else if (user.privilegeLevel === 'ADMINISTRATOR') {
                    console.log("Redirecting to admin.html");
                    window.location.href = 'admin.html';
                } else if (user.privilegeLevel === 'EMPLOYEE') {
                    console.log("Redirecting to employee.html");
                    window.location.href = 'employee.html';
                }
            } else {
                showError("Invalid password");
            }
        } else {
            showError("User not found");
        }
    } catch (error) {
        console.error("Error during login:", error);
        showError("An error occurred during login. Please try again.");
    }
}

function showError(message) {
    const errorMessageDiv = document.getElementById("errorMessage");
    errorMessageDiv.innerText = message;
    errorMessageDiv.style.display = "block"; // Show the error message
}

// Adding event listener to the login button
document.getElementById("loginButton").addEventListener("click", function() {
    const emailInput = document.getElementById("email").value;
    const passwordInput = document.getElementById("password").value;
    loginUser(emailInput, passwordInput);
});