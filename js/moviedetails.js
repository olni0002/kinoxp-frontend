const id = new URLSearchParams(location.search).get("id");

let isAdmin;
userValidation().then(response => isAdmin = response)
                .then(loadPage);

function loadPage() {
    // Fetch movie details using the movie ID
    fetch(`http://127.0.0.1:8080/api/movie/${id}`)
        .then(response => response.json())
        .then(data => addData(data))
        .then(() => {
            if (location.hash === "#showings") {
                displayShowings();
            }
        })
        .catch(error => console.error('Error fetching movie details:', error));

    // Fetch showings for the movie using the movie ID
    fetch(`http://127.0.0.1:8080/showing/${id}`)
        .then(response => response.json())
        .then(data => addShowings(data))
        .catch(error => console.error('Error fetching showings:', error));
}

function addData(data) {
    document.getElementById("title").textContent = data.title;
    document.getElementById("category").textContent = data.category.toLowerCase();
    document.getElementById("description").textContent = data.description;

    const dArray = getDurationHoursAndMinutes(data.duration);

    document.getElementById("duration").textContent = `${dArray[0]}h ${dArray[1]}m`;

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
    const theaterHeader = document.createElement("th");
    theaterHeader.textContent = "Theater";
    const actionHeader = document.createElement("th");
    actionHeader.textContent = "Action";
    headerRow.appendChild(dateHeader);
    headerRow.appendChild(timeHeader);
    headerRow.appendChild(theaterHeader);
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

        const theater = showing.theater;
        const theaterCell = document.createElement("td");
        theaterCell.textContent = `${theater.id}: ${theater.name}`;

        const actionCell = document.createElement("td");
        const button = document.createElement("button");
        button.textContent = "View Seats";
        button.onclick = () => {
            // Redirect to the seats page with the showing ID as a query parameter
            window.location.href = `seats.html?showingId=${showing.id}`;
        };
        actionCell.appendChild(button);

        if (isAdmin) {
            const rmShowingBtn = document.createElement("button");
            rmShowingBtn.textContent = "Delete";
            rmShowingBtn.onclick = () => {
                fetch(`http://127.0.0.1:8080/api/showing/${showing.id}`, {
                    method: "DELETE"
                }).then(() => location.reload());
            }
            actionCell.appendChild(rmShowingBtn);
        }

        showingRow.appendChild(dateCell);
        showingRow.appendChild(timeCell);
        showingRow.appendChild(theaterCell);
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

    if (isAdmin) {
        const inputRow = table.insertRow();
        const inputDateCell = inputRow.insertCell();
        const inputTimeCell = inputRow.insertCell();
        const inputTheaterCell = inputRow.insertCell();
        const btnCell = inputRow.insertCell();

        const dateInput = document.createElement("input");
        dateInput.type = "date";
        inputDateCell.appendChild(dateInput);

        const timeInput = document.createElement("input");
        timeInput.type = "time";
        inputTimeCell.appendChild(timeInput);

        const theaterInput = document.createElement("select");
        theaterInput.id = "theaterSelect";
        inputTheaterCell.appendChild(theaterInput);
        fetch("http://127.0.0.1:8080/theater")
            .then(response => response.json())
            .then(json => {
                if (Array.isArray(json)) {
                    json.forEach(fillTheaterSelect);
                } else {
                    fillTheaterSelect(json);
                }
            });
        
        const newShowingBtn = document.createElement("button");
        newShowingBtn.textContent = "Save showtime";
        newShowingBtn.onclick = async () => {

            if (dateInput.value === "" || timeInput.value === "") {
                alert("Date and time are required");
                return;
            }
            
            if (await overlap(dateInput.value, timeInput.value, theaterInput.value)) {
                alert("A showing is already happening in this theater at this time");
                return;
            }

            fetch("http://127.0.0.1:8080/api/showing", {
                method: "POST",
                body: JSON.stringify({
                    date: dateInput.value,
                    time: timeInput.value,
                    movie: {
                        id: id
                    },
                    theater: {
                        id: theaterInput.value
                    }
                }),
                headers: {
                    "Content-Type": "application/json"
                }
            }).then(() => location.reload());
        }
        btnCell.appendChild(newShowingBtn);
    }
}

function fillTheaterSelect(theater) {
    const theaterSelect = document.getElementById("theaterSelect");

    const theaterOption = document.createElement("option");
    theaterOption.value = theater.id;
    theaterOption.textContent = `${theater.id}: ${theater.name}`;

    theaterSelect.appendChild(theaterOption);
}

function displayShowings() {
    document.getElementById("showings").style.display = "block";
    document.getElementById("displayshowings").onclick = hideShowings;
}

function showingsHash() {
    location.hash = "showings";
    location.reload();
}

function hideShowings() {
    location.hash = "";
    document.getElementById("showings").style.display = "none";
    document.getElementById("displayshowings").onclick = displayShowings;
}

function editMode() {
    location.href = `editmovie.html?id=${id}`;
}

async function overlap(date, time, theater) {
    let doesOverlap = false;
    const newShowingStart = Date.parse(`${date}T${time}`);
    const durationString = document.getElementById("duration").textContent
    const durationHours = parseInt(durationString);
    const durationMinutes = parseInt(durationString.substring(durationString.indexOf("h") + 2));
    const newShowingMillisec = (durationHours * 60 + durationMinutes) * 60000;
    const newShowingEnd = newShowingStart + newShowingMillisec;

    const checkOverlap = (showing) => {
        if (showing.theater.id == theater) {
            const showingStart = Date.parse(`${showing.date}T${showing.time}`);
            const movieDuration = getDurationHoursAndMinutes(showing.movie.duration);
            const durationMillisec = (movieDuration[0] * 60 + movieDuration[1]) * 60000;
            const showingEnd = showingStart + durationMillisec;

            const startsDuring = newShowingStart >= showingStart && newShowingStart < showingEnd;
            const endsDuring = newShowingEnd > showingStart && newShowingEnd <= showingEnd;
            console.log(showing.theater.id);
            if (startsDuring || endsDuring) {
                doesOverlap = true;
            }
        }
    }

    const response = await fetch("http://127.0.0.1:8080/showingall");
    const json = await response.json();

    if (Array.isArray(json)) {
        json.forEach(checkOverlap);
    } else {
        checkOverlap(json);
    }

    return doesOverlap;
}

function getDurationHoursAndMinutes(duration) {
    let durationHours;
    let durationMinutes;

    if (duration.includes("H") && duration.includes("M")) {
        durationHours = duration.substring(duration.indexOf("T") + 1, duration.indexOf("H"));
        durationMinutes = duration.substring(duration.indexOf("H") + 1, duration.indexOf("M"));
    } else if (duration.includes("H")) {
        durationHours = duration.substring(duration.indexOf("T") + 1, duration.indexOf("H"));
        durationMinutes = "0";
    } else if (duration.includes("M")) {
        durationHours = "0";
        durationMinutes = duration.substring(duration.indexOf("T") + 1, duration.indexOf("M"));
    } else {
        durationHours = "0";
        durationMinutes = "0";
    }

    return [parseInt(durationHours), parseInt(durationMinutes)];
}

function goToMovieList() {
    location.href = "customer.html";
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

                if (user.privilegeLevel === "EMPLOYEE" || user.privilegeLevel === "ADMINISTRATOR") {
                    document.getElementById("editmode").style.visibility = "visible";
                    loggedIn = true;
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

    return loggedIn;
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