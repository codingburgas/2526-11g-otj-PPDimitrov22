let guests = [];
let reservations = [];

let rooms = [
    { id: "101", type: "Single", price: 80, capacity: 1, status: "available" },
    { id: "102", type: "Double", price: 120, capacity: 2, status: "available" },
    { id: "201", type: "Suite", price: 200, capacity: 4, status: "available" }
];

let currentUser = JSON.parse(localStorage.getItem("hotelCurrentUser")) || null;

/* INIT */
window.onload = function () {

    const adminMenu = document.getElementById("adminGuestsMenu");
    const adminRoomsMenu = document.getElementById("adminRoomsMenu");
    const roomForm = document.getElementById("roomForm");

    if (currentUser?.role === "GUEST") {
        if (adminMenu) adminMenu.style.display = "none";
        if (adminRoomsMenu) adminRoomsMenu.style.display = "none";
        if (roomForm) roomForm.style.display = "none";
    }

    renderRoomOptions();
    displayRooms();
    displayReservations();
};

/* LOGOUT */
function logout() {
    localStorage.removeItem("hotelCurrentUser");
    window.location.href = "auth.html";
}

/* NAV */
function showSection(sectionId) {
    document.querySelectorAll('.section').forEach(s => s.classList.remove('active'));
    document.getElementById(sectionId).classList.add('active');
}

/* ROOMS */
function addRoom() {
    const id = document.getElementById('roomId').value;
    const type = document.getElementById('roomType').value;
    const price = Number(document.getElementById('roomPrice').value);
    const capacity = document.getElementById('roomCapacity').value;

    rooms.push({ id, type, price, capacity, status: "available" });

    renderRoomOptions();
    displayRooms();
}

function renderRoomOptions() {
    const select = document.getElementById("resRoomId");
    select.innerHTML = "";

    rooms.filter(r => r.status === "available").forEach(r => {
        select.innerHTML += `
            <option value="${r.id}">
                ${r.id} - ${r.type} (${r.price} лв)
            </option>
        `;
    });
}

function displayRooms() {
    const list = document.getElementById('roomsList');
    list.innerHTML = '';

    rooms.forEach(r => {
        list.innerHTML += `
            <div class="list-item">
                <div class="list-item-header">Стая #${r.id} - ${r.type}</div>
                <div class="list-item-detail">Цена: ${r.price} лв</div>
                <div class="list-item-detail">Капацитет: ${r.capacity}</div>
                <div class="list-item-detail">Статус: ${r.status}</div>
            </div>
        `;
    });
}

/* GUESTS */
function addGuest() {
    const id = document.getElementById('guestId').value;
    const name = document.getElementById('guestName').value;
    const email = document.getElementById('guestEmail').value;
    const phone = document.getElementById('guestPhone').value;
    const address = document.getElementById('guestAddress').value;

    guests.push({ id, name, email, phone, address });
    displayGuests();
}

function displayGuests() {
    const list = document.getElementById('guestsList');
    list.innerHTML = '';

    guests.forEach(g => {
        list.innerHTML += `
            <div class="list-item">
                <div class="list-item-header">${g.name}</div>
                <div class="list-item-detail">${g.email}</div>
                <div class="list-item-detail">${g.phone}</div>
                <div class="list-item-detail">${g.address}</div>
            </div>
        `;
    });
}

/* RESERVATIONS */
function addReservation() {
    const roomId = document.getElementById('resRoomId').value;
    const checkIn = document.getElementById('resCheckIn').value;
    const checkOut = document.getElementById('resCheckOut').value;

    const room = rooms.find(r => r.id === roomId);
    if (!room) return alert("Стая не съществува");

    const diff = new Date(checkOut) - new Date(checkIn);
    const nights = Math.max(1, Math.floor(diff / 86400000));

    const totalPrice = nights * Number(room.price);

    reservations.push({
        id: reservations.length + 1,
        guest: currentUser?.username,
        roomId,
        nights,
        totalPrice,
        status: "pending"
    });

    room.status = "occupied";

    renderRoomOptions();
    displayRooms();
    displayReservations();
}

/* SHOW ONLY USER RESERVATIONS */
function displayReservations() {
    const list = document.getElementById('reservationsList');
    list.innerHTML = '';

    const filtered = reservations.filter(r => r.guest === currentUser?.username);

    filtered.forEach(r => {
        list.innerHTML += `
            <div class="list-item">
                <div class="list-item-header">Резервация #${r.id}</div>
                <div class="list-item-detail">Стая: ${r.roomId}</div>
                <div class="list-item-detail">Нощи: ${r.nights}</div>
                <div class="list-item-detail">Цена: ${r.totalPrice} лв</div>
            </div>
        `;
    });
}