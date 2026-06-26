let guests = [];

function loadUsers() {
    return JSON.parse(localStorage.getItem("hotelUsers")) || [];
}

/* ===== STORAGE ===== */
let rooms = JSON.parse(localStorage.getItem("rooms")) || [
    { id: "101", type: "Single", price: 80, capacity: 1, status: "available" },
    { id: "102", type: "Double", price: 120, capacity: 2, status: "available" },
    { id: "201", type: "Suite", price: 200, capacity: 4, status: "available" }
];

let reservations = JSON.parse(localStorage.getItem("reservations")) || [];

let currentUser = JSON.parse(localStorage.getItem("hotelCurrentUser")) || null;

/* ===== SAVE ===== */
function saveRooms() {
    localStorage.setItem("rooms", JSON.stringify(rooms));
}

function saveReservations() {
    localStorage.setItem("reservations", JSON.stringify(reservations));
}

/* ===== INIT ===== */
window.onload = function () {

    rooms = JSON.parse(localStorage.getItem("rooms")) || rooms;
    reservations = JSON.parse(localStorage.getItem("reservations")) || reservations;

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
    displayGuests();
};

/* ===== LOGOUT ===== */
function logout() {
    localStorage.removeItem("hotelCurrentUser");
    window.location.href = "auth.html";
}

/* ===== NAV ===== */
function showSection(sectionId) {
    document.querySelectorAll('.section').forEach(s => s.classList.remove('active'));
    document.getElementById(sectionId).classList.add('active');

    if (sectionId === "guests") {
        displayGuests();
    }
}

/* ===== ADD ROOM (ADMIN) ===== */
function addRoom() {
    const idEl = document.getElementById('roomId');
    const typeEl = document.getElementById('roomType');
    const priceEl = document.getElementById('roomPrice');
    const capEl = document.getElementById('roomCapacity');

    const id = idEl.value.trim();
    const type = typeEl.value.trim();
    const price = Number(priceEl.value);
    const capacity = Number(capEl.value);

    if (!id || !type || !price || !capacity) {
        alert("Попълни всички полета!");
        return;
    }

    rooms.push({
        id,
        type,
        price,
        capacity,
        status: "available"
    });

    saveRooms();

    renderRoomOptions();
    displayRooms();

    idEl.value = "";
    typeEl.value = "";
    priceEl.value = "";
    capEl.value = "";
}

/* ===== ROOM OPTIONS ===== */
function renderRoomOptions() {
    const select = document.getElementById("resRoomId");
    if (!select) return;

    select.innerHTML = "";

    rooms.filter(r => r.status === "available").forEach(r => {
        select.innerHTML += `
            <option value="${r.id}">
                ${r.id} - ${r.type} (${r.price} лв)
            </option>
        `;
    });
}

/* ===== ROOMS DISPLAY ===== */
function displayRooms() {
    const list = document.getElementById('roomsList');
    if (!list) return;

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

/* ===== GUESTS (ADMIN) ===== */
function displayGuests() {
    const list = document.getElementById('guestsList');
    if (!list) return;

    list.innerHTML = '';

    const users = loadUsers();
    const allGuests = users.filter(u => u.role === "GUEST");

    allGuests.forEach(u => {

        const userReservations = reservations.filter(r => r.guest === u.username);

        let resHTML = userReservations.length
            ? userReservations.map(r => `
                <div class="list-item-detail">
                    Рез #${r.id} | Стая ${r.roomId} | ${r.nights} нощ(и) | ${r.totalPrice} лв
                </div>
            `).join("")
            : `<div class="list-item-detail">Няма резервации</div>`;

        list.innerHTML += `
            <div class="list-item">
                <div class="list-item-header">${u.fullName}</div>
                <div class="list-item-detail">@${u.username}</div>
                <div class="list-item-detail">${u.email}</div>
                ${resHTML}
            </div>
        `;
    });
}

/* ===== ADD RESERVATION ===== */
function addReservation() {
    const roomId = document.getElementById('resRoomId').value;
    const checkIn = document.getElementById('resCheckIn').value;
    const checkOut = document.getElementById('resCheckOut').value;

    const room = rooms.find(r => r.id === roomId);
    if (!room) return alert("Стая не съществува");

    const diff = new Date(checkOut) - new Date(checkIn);
    const nights = Math.max(1, Math.floor(diff / 86400000));

    const totalPrice = nights * room.price;

    reservations.push({
        id: reservations.length + 1,
        guest: currentUser?.username,
        guestName: currentUser?.fullName || currentUser?.username,
        roomId,
        nights,
        totalPrice,
        status: "pending"
    });

    room.status = "occupied";

    saveRooms();
    saveReservations();

    renderRoomOptions();
    displayRooms();
    displayReservations();
}

/* ===== RESERVATIONS ===== */
function displayReservations() {
    const list = document.getElementById('reservationsList');
    if (!list) return;

    list.innerHTML = '';

    const isAdmin = currentUser?.role === "ADMIN";

    const filtered = isAdmin
        ? reservations
        : reservations.filter(r => r.guest === currentUser?.username);

    filtered.forEach(r => {
        list.innerHTML += `
            <div class="list-item">
                <div class="list-item-header">Резервация #${r.id}</div>
                <div class="list-item-detail">Гост: ${r.guestName}</div>
                <div class="list-item-detail">Стая: ${r.roomId}</div>
                <div class="list-item-detail">Нощи: ${r.nights}</div>
                <div class="list-item-detail">Цена: ${r.totalPrice} лв</div>
            </div>
        `;
    });
}