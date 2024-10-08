const categories = document.getElementById("category");

addCategories("HORROR", "Horror");
addCategories("ROMANCE", "Romance");
addCategories("ACTION", "Action");
addCategories("SCIENCE_FICTION", "Science fiction");

function addCategories(category, prettyName) {
    const option = document.createElement("option");
    option.value = category;
    option.textContent = prettyName;
    categories.add(option);
}

const titleElement = document.getElementById("title");
const descriptionElement = document.getElementById("description");
const durationHoursElement = document.getElementById("duration-hours");
const durationMinutesElement = document.getElementById("duration-minutes");
const priceElement = document.getElementById("price");
const imageElement = document.getElementById("image");

const paramSearch = new URLSearchParams(location.search);

let movieApi = "http://127.0.0.1:8080/api/movie";

let httpMethod;
if (paramSearch.has("id")) {
    movieApi += "/" + paramSearch.get("id");
    httpMethod = "PUT";
    fetch(movieApi).then(response => response.json())
                   .then(data => addData(data));

} else {
    httpMethod = "POST";
}

function saveMovie() {
    const title = titleElement.value;
    if (title === "") {
        alert("Movie must have a title");
        return;
    }

    const category = categories.value;
    const description = descriptionElement.value;
    const durationHours = durationHoursElement.value;
    const durationMinutes = durationMinutesElement.value;
    const price = priceElement.value;

    imageElement.files[0].arrayBuffer().then(imgData => {

        fetch(movieApi, {
            method: httpMethod,
            body: JSON.stringify({
                title: title,
                category: category,
                description: description,
                duration: `PT${durationHours}H${durationMinutes}M`,
                price: price,
                image: btoa(Array.from(new Uint8Array(imgData)).map(char => String.fromCharCode(char)).join(""))
            }),
            headers: {
                "Content-Type": "application/json"
            }
        }).then(goToMovie);
    });
    
}



function goToMovie() {
    fetch(movieApi).then(response => response.json())
                   .then(getJson)
                   .then(id => location.href = `moviedetails.html?id=${id}`);
}

function getJson(data) {
    if (Array.isArray(data)) {
        return data[data.length - 1].id;
    } else {
        return data.id;
    }
}

function addData(data) {

    titleElement.value = data.title;
    descriptionElement.value = data.description;

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

    durationHoursElement.value = durationHours;
    durationMinutesElement.value = durationMinutes;

    priceElement.value = data.price;
    
    const uint8 = Uint8Array.from(atob(data.image).split("").map(char => char.charCodeAt()))
    
    let blob = new Blob([uint8]);

    let file = new File([blob], "movieimage",);

    const url = URL.createObjectURL(file);

    document.getElementById("oldimage").src = url;    
}

function deleteMovie() {
    fetch(movieApi, {
        method: "DELETE"
    });
}