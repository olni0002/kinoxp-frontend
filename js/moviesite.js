const urlMovie = "http://localhost:8080/movies";
const container = document.getElementById("movie-container");

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
    headerCell.colSpan = 1; // Adjusted to span only one column
    headerCell.innerHTML = movie.title;
    headerRow.appendChild(headerCell);

    // Create rows for each attribute value only
    let attributeValues = [
        `<img src="${movie.hrefPhoto}" alt="${movie.title}">`,
        movie.category,
        movie.duration
    ];

    attributeValues.forEach(value => {
        let row = tbody.insertRow();
        let valueCell = row.insertCell();
        valueCell.innerHTML = value;
    });

    // Update this line to point to the new HTML page with the correct query parameter
    const urlMovieView = `moviedetails.html?id=${movie.id}`;

    // Create a button and append it to the table
    let buttonRow = tbody.insertRow();
    let buttonCell = buttonRow.insertCell();
    buttonCell.colSpan = 1; // Adjust to span the full width of the table if needed
    let button = document.createElement("button");
    button.innerHTML = "View More";
    button.onclick = () => {
        // Redirect to the movieView.html with the movie ID as a query parameter
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

async function fetchMovie() {
    try {
        const movies = await fetchAnyUrl(urlMovie);
        movies.forEach(createTable);
    } catch (error) {
        console.error('Error fetching movies:', error);
    }
}

fetchMovie();