userValidation();

const urlMovie = "http://localhost:8080/movies";
const container = document.getElementById("movie-container");
const categoryFilter = document.getElementById("category-filter");

function createTable(movie) {
    let table = document.createElement("table");
    table.id = `movie-${movie.name}`;

    let thead = document.createElement("thead");
    let tbody = document.createElement("tbody");

    table.appendChild(thead);
    table.appendChild(tbody);

    // Create a header row
    let headerRow = thead.insertRow();
    let headerCell = document.createElement("th");
    headerCell.colSpan = 1;
    headerCell.innerHTML = movie.title;
    headerRow.appendChild(headerCell);

    // Create rows for each attribute value only
    let attributeValues = [
        `<img src="${getImage(movie.image)}" alt="${movie.title}">`,
        movie.category,
        movie.duration
    ];

    attributeValues.forEach(value => {
        let row = tbody.insertRow();
        let valueCell = row.insertCell();
        valueCell.innerHTML = value;
    });

    const urlMovieView = `moviedetails.html?id=${movie.id}`;

    // Create a button and append it to the table
    let buttonRow = tbody.insertRow();
    let buttonCell = buttonRow.insertCell();
    buttonCell.colSpan = 1;
    let button = document.createElement("button");
    button.innerHTML = "View More";
    button.onclick = () => {
        window.location.href = urlMovieView;
    };
    buttonCell.appendChild(button);

    container.appendChild(table);
}

async function fetchAnyUrl(url) {
    const response = await fetch(url);
    if (!response.ok) throw new Error('Network response was not ok');
    return response.json();
}

async function fetchMovies() {
    try {
        const movies = await fetchAnyUrl(urlMovie);
        displayMovies(movies);
    } catch (error) {
        console.error('Error fetching movies:', error);
    }
}

function displayMovies(movies) {
    container.innerHTML = ''; // Clear existing movies
    const selectedCategory = categoryFilter.value;
    const filteredMovies = selectedCategory === 'ALL' ? movies : movies.filter(movie => movie.category === selectedCategory);
    filteredMovies.forEach(createTable);
}

categoryFilter.addEventListener('change', () => {
    fetchMovies();
});

fetchMovies();

function getImage(image) {
    const uint8 = Uint8Array.from(atob(image).split("").map(char => char.charCodeAt()))

    const blob = new Blob([uint8]);

    const file = new File([blob], "movieimage",);

    return URL.createObjectURL(file);
}

function newMovie() {
    location.href = "editmovie.html";
}

function logout() {
    document.cookie = `userid=; max-age=0; path=/`;
    document.cookie = `password=; max-age=0; path=/`;
    location.href = "logindsite.html";
}

function login() {
    location.href = "logindsite.html";
}

async function userValidation() {
    let loggedIn = false;
    const cookie = document.cookie;

    const idFromCookie = getCookie("userid");
    const passwordFromCookie = getCookie("password");

    const validate = (user) => {
        if (user.id == idFromCookie) {
            if (user.password === passwordFromCookie) {
                document.cookie = `userid=${idFromCookie}; max-age=34560000; path=/`;
                document.cookie = `password=${passwordFromCookie}; max-age=34560000; path=/`;
                loggedIn = true;
                document.querySelector(".logoutBtn").style.display = "block";

                if (user.privilegeLevel === "EMPLOYEE" || user.privilegeLevel === "ADMINISTRATOR") {
                    document.querySelector(".newMovieBtn").style.display = "block";
                }
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

    if (!loggedIn) {
        document.querySelector(".loginBtn").style.display = "block";
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