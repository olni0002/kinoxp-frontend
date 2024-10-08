
const urlSeats = "http://localhost:8080/seats";
const seatingGrid = document.getElementById("seating-grid");
const selectedSeatsBody = document.getElementById("selectedSeatsBody");
const totalPriceElement = document.getElementById("totalPrice");

let selectedSeats = []; // Initialize the selected seats array

// Function to create the seating grid
async function createSeatGrid(seats) {
    seatingGrid.innerHTML = ''; // Clear existing seats

    // Determine grid dimensions dynamically based on the data
    const numRows = Math.max(...seats.map(seat => seat.numberRow));  // Highest row number
    const numSeatsPerRow = Math.max(...seats.map(seat => seat.numberSeat));  // Highest seat number

    // Set the CSS grid properties dynamically to match the fetched seat layout
    seatingGrid.style.gridTemplateColumns = `repeat(${numSeatsPerRow}, 1fr)`;
    seatingGrid.style.gridTemplateRows = `repeat(${numRows}, 1fr)`;

    seats.forEach(seat => {
        const seatElement = document.createElement('div');
        seatElement.classList.add('seat');

        // Add click event to toggle selection for all seats
        seatElement.addEventListener('click', () => {
            if (seatElement.classList.contains('selected')) {
                seatElement.classList.remove('selected');
                // Remove the seat from the selected seats array
                selectedSeats = selectedSeats.filter(selectedSeat => selectedSeat.numberSeat !== seat.numberSeat || selectedSeat.numberRow !== seat.numberRow);
                console.log(`Seat deselected: Row ${seat.numberRow}, Seat ${seat.numberSeat}`);
            } else {
                seatElement.classList.add('selected');
                // Add the seat to the selected seats array
                selectedSeats.push(seat);
                console.log(`Seat selected: Row ${seat.numberRow}, Seat ${seat.numberSeat}`);
            }

            // Update the table with selected seats
            updateSelectedSeatsTable();

            // Calculate total price
            let totalPrice = selectedSeats.reduce((sum, selectedSeat) => sum + selectedSeat.price, 0);

            // Apply reservation fee if 5 or fewer seats are selected
            const reservationFee = 5; // Example reservation fee
            if (selectedSeats.length <= 5) {
                totalPrice += reservationFee;
            }

            // Apply discount if more than 10 seats are selected
            if (selectedSeats.length > 10) {
                totalPrice *= 0.93; // Apply 7% discount
            }

            // Update total price in the HTML
            totalPriceElement.textContent = `Total Price: $${totalPrice.toFixed(2)}`;
        });

        // Append the seat element to the grid
        seatingGrid.appendChild(seatElement);
    });
}

const urlUser = "http://localhost:8080/users";

async function checkUser (email, password) {
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
                        showing: { id: 1 }, // Replace with the actual showing ID
                        seat: { id: seat.id }, // Replace with the actual seat ID
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
                    // Refresh the page after reservations are created
                    location.reload();
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
async function fetchSeats(theaterId) {
    try {
        const url = `${urlSeats}/${theaterId}`;
        const response = await fetchAnyUrl(url); // Fetch data from the server
        const seatsWithTheaterId = response.map(seat => ({ ...seat, theaterId })); // Add theaterId to each seat
        createSeatGrid(seatsWithTheaterId); // Create the seat grid with the fetched data
    } catch (error) {
        console.error(`Error fetching seats for theater ${theaterId}: ${error}`);
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

// Fetch seat data for theater 1 or 2 on page load
fetchSeats(2);  // Change to 1 or 2 based on the theater you want to test


