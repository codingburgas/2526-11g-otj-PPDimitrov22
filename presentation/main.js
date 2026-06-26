let currentUser = JSON.parse(localStorage.getItem("hotelCurrentUser")) || null;
let users = JSON.parse(localStorage.getItem("hotelUsers")) || [];

let rooms = JSON.parse(localStorage.getItem("rooms")) || [
    { id: "101", type: "Single", price: 80, capacity: 1, status: "available" },
    { id: "102", type: "Double", price: 120, capacity: 2, status: "available" },
    { id: "201", type: "Suite", price: 200, capacity: 4, status: "available" },
    { id: "301", type: "Quad", price: 250, capacity: 4, status: "available" }
];

let reservations = JSON.parse(localStorage.getItem("reservations")) || [];

/* ROLE HELPERS */
function isAdmin() {
    return currentUser && currentUser.role === "ADMIN";
}

function isGuest() {
    return currentUser && currentUser.role === "GUEST";
}

/* SAVE */
function saveRooms() {
    localStorage.setItem("rooms", JSON.stringify(rooms));
}

function saveReservations() {
    localStorage.setItem("reservations", JSON.stringify(reservations));
}

/* INIT */
window.onload = function () {
    currentUser = JSON.parse(localStorage.getItem("hotelCurrentUser")) || null;

    // hide admin menus if not admin
    const adminRooms = document.getElementById("adminRoomsMenu");
    const adminGuests = document.getElementById("adminGuestsMenu");

    if (adminRooms && adminGuests) {
        if (!isAdmin()) {
            adminRooms.style.display = "none";
            adminGuests.style.display = "none";
        }
    }

    renderRoomOptions();
    displayRooms();
    displayReservations();
    displayGuests();
};

/* NAV */
function showSection(sectionId) {
    document.querySelectorAll(".section").forEach(s => s.classList.remove("active"));
    document.getElementById(sectionId).classList.add("active");

    if (sectionId === "guests") displayGuests();
}

/* LOGOUT */
function logout() {
    localStorage.removeItem("hotelCurrentUser");
    window.location.href = "auth.html";
}

/* ROOMS */
function addRoom() {
    if (!isAdmin()) return;

    const id = document.getElementById("roomId").value.trim();
    const type = document.getElementById("roomType").value.trim();
    const price = Number(document.getElementById("roomPrice").value);
    const capacity = Number(document.getElementById("roomCapacity").value);

    if (!id || !type || !price || !capacity) {
        alert("Fill all fields!");
        return;
    }

    rooms.push({ id, type, price, capacity, status: "available" });
    saveRooms();

    renderRoomOptions();
    displayRooms();
}

/* DROPDOWN */
function renderRoomOptions() {
    const select = document.getElementById("resRoomId");
    if (!select) return;

    select.innerHTML = "";

    if (!currentUser) return;

    rooms.forEach(r => {
        if (r.status === "available") {
            select.innerHTML += `
                <option value="${r.id}">
                    ${r.id} - ${r.type} (${r.price} Лв)
                </option>
            `;
        }
    });
}

/* ROOMS */
function displayRooms() {
    const list = document.getElementById("roomsList");
    if (!list) return;

    if (!isAdmin()) {
        list.innerHTML = "";
        return;
    }

    list.innerHTML = "";

    rooms.forEach(r => {
        list.innerHTML += `
            <div class="list-item">
                <div class="list-item-header">Room #${r.id} - ${r.type}</div>
                <div class="list-item-detail">Price: ${r.price} Лв</div>
                <div class="list-item-detail">Capacity: ${r.capacity}</div>
                <div class="list-item-detail">Status: ${r.status}</div>
            </div>
        `;
    });
}

/* RESERVATIONS */
function addReservation() {

    if (!currentUser) {
        alert("You must login first!");
        return;
    }

    const roomId = document.getElementById("resRoomId").value;
    const checkIn = document.getElementById("resCheckIn").value;
    const checkOut = document.getElementById("resCheckOut").value;

    const room = rooms.find(r => r.id === roomId);
    if (!room) return alert("Room not found");

    const nights = Math.max(1,
        Math.floor((new Date(checkOut) - new Date(checkIn)) / 86400000)
    );

    const newId = reservations.length
        ? Math.max(...reservations.map(r => r.id)) + 1
        : 1;

    reservations.push({
        id: newId,
        guest: currentUser.username,
        guestName: currentUser.fullName || currentUser.username,
        roomId,
        nights,
        totalPrice: nights * room.price,
        status: "pending"
    });

    room.status = "occupied";

    saveRooms();
    saveReservations();

    renderRoomOptions();
    displayRooms();
    displayReservations();
}

/* RESERVATIONS VIEW */
function displayReservations() {
    const list = document.getElementById("reservationsList");
    if (!list) return;

    list.innerHTML = "";

    if (!currentUser) return;

    let filtered = [];

    if (isAdmin()) {
        filtered = reservations;
    } else {
        filtered = reservations.filter(
            r => r.guest === currentUser.username
        );
    }

    filtered.forEach(r => {
        list.innerHTML += `
            <div class="list-item">
                <div class="list-item-header">Резервация #${r.id}</div>
                <div class="list-item-detail">Стая: ${r.roomId}</div>
                <div class="list-item-detail">Нощи: ${r.nights}</div>
                <div class="list-item-detail">Цена: ${r.totalPrice} Лв</div>
            </div>
        `;
    });
}

/* GUESTS */
function displayGuests() {
    const list = document.getElementById("guestsList");
    if (!list) return;

    if (!isAdmin()) {
        list.innerHTML = "";
        return;
    }

    list.innerHTML = "";

    users = JSON.parse(localStorage.getItem("hotelUsers")) || [];
    const guestsOnly = users.filter(u => u.role === "GUEST");

    guestsOnly.forEach(u => {

        const userRes = reservations.filter(r => r.guest === u.username);

        list.innerHTML += `
            <div class="list-item">
                <div class="list-item-header">${u.fullName}</div>
                <div class="list-item-detail">@${u.username}</div>
                <div class="list-item-detail">${u.email}</div>
                <div class="list-item-detail">
                    ${userRes.length ? "Reservations: " + userRes.length : "No reservations"}
                </div>
            </div>
        `;
    });
}

/* GUEST PLACEHOLDER */
function addGuest() {
    alert("Guests are managed via registration page.");
}