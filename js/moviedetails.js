const id = new URLSearchParams(location.search).get("id");

fetch(`http://127.0.0.1:8080/api/movie/${id}`).then(response => response.json())
                                              .then(data => addData(data));

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

    const image = document.getElementById("image");
    image.height = 630;
    image.width = 420;
    image.src = url;
}