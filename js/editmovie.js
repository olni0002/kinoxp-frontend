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

document.getElementById("oldimage").height = 630;
document.getElementById("oldimage").width = 420;

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
    document.getElementById("deleteBtn").remove();
    document.getElementById("cancelBtn").onclick = () => location.href = "customer.html";
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

    const sendData = (imgData)  => {

        fetch(movieApi, {
            method: httpMethod,
            body: JSON.stringify({
                title: title,
                category: category,
                description: description,
                duration: `PT${durationHours}H${durationMinutes}M`,
                price: price,
                image: imgData
            }),
            headers: {
                "Content-Type": "application/json"
            }
        }).then(goToMovie);
    }

    if (imageElement.value === "") {
        sendData(null);
    } else {
        imageElement.files[0].arrayBuffer()
            .then(arr => btoa(Array.from(new Uint8Array(arr))
                .map(char => String.fromCharCode(char))
                    .join("")))
            .then(imgData => sendData(imgData));
    }
    
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
    categories.value = data.category;
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
    
    if (uint8.toString() !== "158,233,101") {
        addRmImgBtn();
    }
    
    let blob = new Blob([uint8]);
    let file = new File([blob], "movieimage",);
    const url = URL.createObjectURL(file);

    document.getElementById("oldimage").src = url;    
}

function deleteMovie() {
    fetch(movieApi, {
        method: "DELETE"
    }).then(() => location.href = "customer.html");
}

imageElement.addEventListener("change", () => {
    const rmImgBtn = document.getElementById("rmImgBtn");
    if (rmImgBtn !== null) rmImgBtn.remove();
    document.getElementById("oldimage").src = URL.createObjectURL(imageElement.files[0]);
    addRmImgBtn();
});

function addRmImgBtn() {
    const rmImgBtn = document.createElement("button");
    rmImgBtn.textContent = "Remove image";
    rmImgBtn.id = "rmImgBtn";
    rmImgBtn.onclick = removeImage;

    const table = document.querySelector(".imgOptions");
    const row = table.insertRow(0);
    const cell = row.insertCell(0);
    cell.appendChild(rmImgBtn);
}

function removeImage() {
    document.getElementById("oldimage").src = "";
    document.getElementById("rmImgBtn").remove();
    imageElement.value = "";
}