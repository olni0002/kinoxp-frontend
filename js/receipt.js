
const urlParams = new URLSearchParams(window.location.search);
const showingId = urlParams.get('showingId');
const seats = JSON.parse(urlParams.get('seats'));
const totalPriceElement = document.getElementById('total-price');

// Calculate the total price
let totalPrice = 0;
seats.forEach(seat => {
    // Assuming each seat has a price property
    totalPrice += seat.price;
});

// Update the totalPriceElement with the formatted total price
totalPriceElement.textContent = `$${totalPrice.toFixed(2)}`;

// Update the receipt HTML with the booking details
document.getElementById('showing-id').textContent = showingId;
const seatsList = document.getElementById('seats-list');
seats.forEach(seat => {
    const seatListItem = document.createElement('li');
    seatListItem.textContent = `Row ${seat.numberRow}, Seat ${seat.numberSeat}`;
    seatsList.appendChild(seatListItem);
});