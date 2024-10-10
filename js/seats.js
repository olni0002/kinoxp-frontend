const urlSeats = "http://localhost:8080/seats";
const seatingGrid = document.getElementById("seating-grid");
const selectedSeatsBody = document.getElementById("selectedSeatsBody");
const totalPriceElement = document.getElementById("totalPrice");

let selectedSeats = []; // Initialize the selected seats array

// Get the showing ID from the URL
const urlParams = new URLSearchParams(window.location.search);
const showingId = urlParams.get('showingId');



// Function to create the seating grid
// Function to create the seating grid
async function createSeatGrid(seats, reservedSeats, showingId) {
    // Fetch reserved seats from the server
    try {
        const response = await fetch(`http://localhost:8080/resevation/${showingId}`); // Corrected endpoint
        if (!response.ok) {
            throw new Error(`HTTP error! status: ${response.status}`);
        }
        reservedSeats = await response.json(); // Update reservedSeats with fetched data
        console.log(reservedSeats);
        var reservedSeatIds = reservedSeats.map(seatInfo => {
            return seatInfo.seat.id; // Return the seat id to be added to the new array
        });

// Now, reservedSeatIds contains all the seat ids of reserved seats

        console.log(reservedSeatIds);
    } catch (error) {
        console.error('Error fetching reserved seats:', error);
        reservedSeats = []; // Fallback to an empty array on error
    }

    seatingGrid.innerHTML = ''; // Clear existing seats

    // Determine grid dimensions dynamically based on the data
    const numRows = Math.max(...seats.map(seat => seat.numberRow));  // Highest row number
    const numSeatsPerRow = Math.max(...seats.map(seat => seat.numberSeat));  // Highest seat number

    seatingGrid.style.gridTemplateColumns = `repeat(${numSeatsPerRow}, 1fr)`;
    seatingGrid.style.gridTemplateRows = `repeat(${numRows}, 1fr)`;
    seats.forEach(seat => {
        const seatElement = document.createElement('div');
        seatElement.classList.add('seat');

        // Check if the seat is reserved for the current showingId
        if (reservedSeatIds.includes(seat.id)) {
            seatElement.classList.add('reserved'); // Add a reserved class
            seatElement.style.backgroundColor = 'red'; // Change the background color to red
            seatElement.style.pointerEvents = 'none'; // Make reserved seats unclickable
        } else {
            // Add click event to toggle selection for non-reserved seats
            seatElement.addEventListener('click', () => {
                if (seatElement.classList.contains('selected')) {
                    seatElement.classList.remove('selected');
                    selectedSeats = selectedSeats.filter(selectedSeat => selectedSeat.id !== seat.id);
                    console.log(`Seat deselected: Seat ID ${seat.id}`);
                } else {
                    seatElement.classList.add('selected');
                    selectedSeats.push(seat);
                    console.log(`Seat selected: Seat ID ${seat.id}`);
                }

                // Update selected seats table and pricing logic
                updateSelectedSeatsTable();
            });
        }

        // Append the seat element to the grid
        seatingGrid.appendChild(seatElement);
    });

}




if (showingId) {
    // Use the showing ID to fetch the relevant seats and theater details
    fetchSeatsForShowing(showingId);
} else {
    console.error("No showing ID found in the URL.");
}

// Function to fetch seats based on showing ID
async function fetchSeatsForShowing(showingId) {
    try {
        // Fetch the showing details to get the theater ID
        const showingDetails = await fetchAnyUrl(`http://localhost:8080/showings/${showingId}`);
        const theaterId = showingDetails.theater.id; // Assuming the showing details include the theater ID

        // Now fetch the seats for the specific theater
        fetchSeats(theaterId, showingId);
    } catch (error) {
        console.error(`Error fetching showing details or seats: ${error}`);
    }
}

const urlUser  = "http://localhost:8080/users";

async function checkUser  (email, password) {
    try {
        // Fetch all users from the backend
        const users = await fetchAnyUrl(urlUser );

        // Find if the user with the entered email exists
        const user = users.find(us => us.email === email);

        if (user) {
            // Check if the password matches
            if (user.password === password) {
                // Log the userid to the console if the email and password are correct
                console.log(`Logged in successfully with userid ${user.id}`);
                // You can also return the userid if needed
                return user.id;
            } else {
                showError("Invalid password");
            }
        } else {
            showError("User  not found");
        }
    } catch (error) {
        console.error("Error during login:", error);
        showError("An error occurred during login. Please try again.");
    }
}
function updateSelectedSeatsTable() {
    // Clear the current contents of the table body
    selectedSeatsBody.innerHTML = '';

    // Populate the table with selected seats
    selectedSeats.forEach(seat => {
        const row = document.createElement('tr');

        const seatNumberCell = document.createElement('td');
        seatNumberCell.textContent = seat.numberSeat;
        row.appendChild(seatNumberCell);

        const rowNumberCell = document.createElement('td');
        rowNumberCell.textContent = seat.numberRow;
        row.appendChild(rowNumberCell);

        selectedSeatsBody.appendChild(row);
    });

    // Add a "Book" button to the table
    const bookButtonRow = document.createElement('tr');
    const bookButtonCell = document.createElement('td');
    bookButtonCell.colSpan = 2; // Make the button span across both columns
    const bookButton = document.createElement('button');
    bookButton.id = 'bookButton';
    bookButton.textContent = 'Book';
    bookButton.onclick = async () => {
        // Get the email and password from HTML input fields
        const emailInput = document.getElementById('email');
        const passwordInput = document.getElementById('password');
        const email = emailInput.value;
        const password = passwordInput.value;

        if (email && password) {
            // Get the userid from the checkUser  function
            const userid = await checkUser (email, password);

            if (userid) {
                // Create a new reservation object for each selected seat
                const reservations = selectedSeats.map(seat => {
                    return {
                        showing: { id: showingId }, // Use the actual showing ID
                        seat: { id: seat.id }, // Use the actual seat ID
                        user: { id: userid } // Use the userid returned from checkUser
                    };
                });

                // Define the postObjectAsJson function within the same scope
                async function postObjectAsJson(url, object, httpVerbum) {
                    try {
                        const obj = JSON.stringify(object);
                        console.log(obj);
                        const fetchOption = {
                            method: httpVerbum,
                            headers: {
                                "Content-Type": "application/json",
                            },
                            body: obj
                        };
                        const response = await fetch(url, fetchOption);
                        if (!response.ok) throw new Error('Network response was not ok');
                        return response;
                    } catch (error) {
                        console.error(`Error posting to ${url}: ${error}`);
                    }
                }

                // Send a POST request to create a new reservation for each selected seat
                const promises = reservations.map(reservation => postObjectAsJson("http://localhost:8080/reservations", reservation, "POST"));
                const responses = await Promise.all(promises);

                if (responses.every(response => response.ok)) {
                    console.log("Reservations created successfully!");

                    // Redirect to receipt.html with query parameters
                    const seatsParam = encodeURIComponent(JSON.stringify(selectedSeats));
                    window.location.href = `receipt.html?email=${encodeURIComponent(email)}&seats=${seatsParam}`;
                } else {
                    console.error("Error creating reservations:", responses.map(response => response.status));
                }
            } else {
                console.log("Login failed");
            }
        } else {
            console.log("Please enter both email and password");
        }
    };
    bookButtonCell.appendChild(bookButton);
    bookButtonRow.appendChild(bookButtonCell);
    selectedSeatsBody.appendChild(bookButtonRow);
}
// Function to fetch seats from backend
async function fetchSeats(theaterId, showingId) {
    try {
        // Fetch seat data for the theater
        const url = `${urlSeats}/${theaterId}`;
        const response = await fetchAnyUrl(url); // Fetch seat data from the server
        const seatsWithTheaterId = response.map(seat => ({ ...seat, theaterId })); // Add theaterId to each seat

        // Fetch reservation data for the showingId
        const reservationUrl = `http://localhost:8080/resevation/${showingId}`;
        const reservationResponse = await fetch(reservationUrl);
        if (!reservationResponse.ok) {
            throw new Error('Failed to fetch reservation data');
        }

        const reservations = await reservationResponse.json();
        const reservedSeats = reservations.map(reservation => ({
            seatId: reservation.seatId,    // The seat ID from the reservation
            showingId: reservation.showingId // The showing ID from the reservation
        }));

        // Create seat grid, marking reserved seats as unclickable
        createSeatGrid(seatsWithTheaterId, reservedSeats, showingId);
    } catch (error) {
        console.error(`Error fetching seats for theater ${theaterId} or reservations: ${error}`);
    }
}



// Helper function to fetch data from the server
async function fetchAnyUrl(url) {
    try {
        const response = await fetch(url);
        if (!response.ok) throw new Error('Network response was not ok');
        return response.json(); // Return JSON data
    } catch (error) {
        console.error(`Error fetching ${url}: ${error}`);
    }
}
function showError(message) {
    const errorElement = document.getElementById('error-message');
    if (errorElement) {
        errorElement.textContent = message;
        errorElement.style.display = 'block';
    }
}

// Example of how you might initially hide the error message element
document.addEventListener('DOMContentLoaded', () => {
    const errorElement = document.getElementById('error-message');
    if (errorElement) {
        errorElement.style.display = 'none';
    }
});

