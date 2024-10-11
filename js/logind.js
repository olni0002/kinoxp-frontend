userValidation();

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

                document.cookie = `userid=${user.id}; max-age=34560000; path=/`;
                document.cookie = `password=${user.password}; max-age=34560000; path=/`;

                console.log("Redirecting to customer.html");
                window.location.href = 'customer.html';
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

async function userValidation() {
    const cookie = document.cookie;

    const idFromCookie = getCookie("userid");
    const passwordFromCookie = getCookie("password");

    const validate = (user) => {
        if (user.id == idFromCookie) {
            if (user.password === passwordFromCookie) {
                document.cookie = `userid=${idFromCookie}; max-age=34560000; path=/`;
                document.cookie = `password=${passwordFromCookie}; max-age=34560000; path=/`;
                location.href = "customer.html";
            }
        }
    }

    const response = await fetch("http://127.0.0.1:8080/users");
    const json = await response.json();

    if (Array.isArray(json)) {
        json.forEach(validate);
    } else {
        validate(json);
    }
}

function getCookie(cname) {
    let name = cname + "=";
    let decodedCookie = decodeURIComponent(document.cookie);
    let ca = decodedCookie.split(';');
    for(let i = 0; i <ca.length; i++) {
      let c = ca[i];
      while (c.charAt(0) == ' ') {
        c = c.substring(1);
      }
      if (c.indexOf(name) == 0) {
        return c.substring(name.length, c.length);
      }
    }
    return "";
}