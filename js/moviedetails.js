const id = new URLSearchParams(location.search).get("id");

// Fetch movie details using the movie ID
fetch(`http://127.0.0.1:8080/api/movie/${id}`)
    .then(response => response.json())
    .then(data => addData(data))
    .catch(error => console.error('Error fetching movie details:', error));

// Fetch showings for the movie using the movie ID
fetch(`http://127.0.0.1:8080/api/showing/${id}`)
    .then(response => response.json())
    .then(data => addShowings(data))
    .catch(error => console.error('Error fetching showings:', error));
function addData(data) {
    document.getElementById("title").textContent = data.title;
    document.getElementById("category").textContent = data.category.toLowerCase();
    document.getElementById("description").textContent = data.description;

    const dString = data.duration;
    let durationHours;
    let durationMinutes;

    if (dString.includes("H") && dString.includes("M")) {
        durationHours = dString.substring(dString.indexOf("T") + 1, dString.indexOf("H"));
        durationMinutes = dString.substring(dString.indexOf("H") + 1, dString.indexOf("M"));
    } else if (dString.includes("H")) {
        durationHours = dString.substring(dString.indexOf("T") + 1, dString.indexOf("H"));
        durationMinutes = 0;
    } else if (dString.includes("M")) {
        durationHours = 0;
        durationMinutes = dString.substring(dString.indexOf("T") + 1, dString.indexOf("M"));
    } else {
        durationHours = 0;
        durationMinutes = 0;
    }



    document.getElementById("duration").textContent = `${durationHours}h ${durationMinutes}m`;

    const uint8 = Uint8Array.from(atob(data.image).split("").map(char => char.charCodeAt()))

    let blob = new Blob([uint8]);

    let file = new File([blob], "movieimage",);

    const url = URL.createObjectURL(file);

    document.getElementById("image").src = url;
    const image = document.getElementById("image");
    image.height = 630;
    image.width = 420;
    image.src = url;
}

function addShowings(showings) {
    const showingsContainer = document.getElementById("showings");
    showingsContainer.innerHTML = ''; // Clear any existing content

    const table = document.createElement("table");
    table.className = "showings-table";

    const thead = document.createElement("thead");
    const headerRow = document.createElement("tr");
    const dateHeader = document.createElement("th");
    dateHeader.textContent = "Date";
    const timeHeader = document.createElement("th");
    timeHeader.textContent = "Time";
    const actionHeader = document.createElement("th");
    actionHeader.textContent = "Action";
    headerRow.appendChild(dateHeader);
    headerRow.appendChild(timeHeader);
    headerRow.appendChild(actionHeader);
    thead.appendChild(headerRow);
    table.appendChild(thead);

    const tbody = document.createElement("tbody");

    const fillTable = showing => {
        const showingRow = document.createElement("tr");

        const datePart = showing.date;
        const timePart = showing.time;
        const combinedDateTime = `${datePart}T${timePart}`;
        const date = new Date(combinedDateTime);

        const dateString = date.toLocaleDateString();
        const timeString = date.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });

        const dateCell = document.createElement("td");
        dateCell.textContent = dateString;
        const timeCell = document.createElement("td");
        timeCell.textContent = timeString;

        const actionCell = document.createElement("td");
        const button = document.createElement("button");
        button.textContent = "View Seats";
        button.onclick = () => {
            // Redirect to the seats page with the showing ID as a query parameter
            window.location.href = `seats.html?showingId=${showing.id}`;
        };
        actionCell.appendChild(button);

        showingRow.appendChild(dateCell);
        showingRow.appendChild(timeCell);
        showingRow.appendChild(actionCell);
        tbody.appendChild(showingRow);
    }

    if (Array.isArray(showings)) {
        showings.forEach(fillTable);
    } else {
        fillTable(showings);
    }

    table.appendChild(tbody);
    showingsContainer.appendChild(table);
}