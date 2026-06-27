let currentUser = JSON.parse(localStorage.getItem("hotelCurrentUser")) || null;
let users = JSON.parse(localStorage.getItem("hotelUsers")) || [];

let rooms = JSON.parse(localStorage.getItem("rooms")) || [
    { id: "101", type: "Single", price: 80, capacity: 1, status: "available" },
    { id: "102", type: "Double", price: 120, capacity: 2, status: "available" },
    { id: "201", type: "Suite", price: 200, capacity: 4, status: "available" },
    { id: "301", type: "Quad", price: 250, capacity: 4, status: "available" }
];

let reservations = JSON.parse(localStorage.getItem("reservations")) || [];

/* ROLE */
function isAdmin() {
    return currentUser && currentUser.role === "ADMIN";
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

    const adminRooms = document.getElementById("adminRoomsMenu");
    const adminGuests = document.getElementById("adminGuestsMenu");

    if (adminRooms && adminGuests && !isAdmin()) {
        adminRooms.style.display = "none";
        adminGuests.style.display = "none";
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

    rooms.push({ id, type, price, capacity, status: "available" });
    saveRooms();

    renderRoomOptions();
    displayRooms();
}

/* ROOM OPTIONS */
function renderRoomOptions() {
    const select = document.getElementById("resRoomId");
    if (!select) return;

    select.innerHTML = "";

    rooms.forEach(r => {
        if (r.status === "available") {
            select.innerHTML += `
                <option value="${r.id}">
                    ${r.id} - ${r.type} (${r.price} lv)
                </option>
            `;
        }
    });
}

/* ROOMS VIEW */
function displayRooms() {
    const list = document.getElementById("roomsList");
    if (!list || !isAdmin()) return;

    list.innerHTML = "";

    rooms.forEach(r => {
        list.innerHTML += `
            <div class="list-item">
                <div class="list-item-header">Room #${r.id} - ${r.type}</div>
                <div class="list-item-detail">Price: ${r.price} lv</div>
                <div class="list-item-detail">Capacity: ${r.capacity}</div>
                <div class="list-item-detail">Status: ${r.status}</div>
            </div>
        `;
    });
}

/* RESERVATION */
function addReservation() {
    if (!currentUser) return alert("Login first!");

    const roomId = document.getElementById("resRoomId").value;
    const checkIn = document.getElementById("resCheckIn").value;
    const checkOut = document.getElementById("resCheckOut").value;

    const room = rooms.find(r => r.id === roomId);
    if (!room) return alert("Room not found");

    const nights = Math.max(
        1,
        Math.floor((new Date(checkOut) - new Date(checkIn)) / 86400000)
    );

    const services = Array.from(document.querySelectorAll(".service-check:checked"))
        .map(s => ({
            name: s.dataset.name,
            price: Number(s.dataset.price)
        }));

    const servicesTotal = services.reduce((a, b) => a + b.price, 0);

    const totalPrice = nights * room.price + servicesTotal;

    reservations.push({
        id: reservations.length + 1,
        guest: currentUser.username,
        roomId,
        nights,
        services,
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

/* CANCEL RESERVATION */
function cancelReservation(id) {
    const index = reservations.findIndex(r => r.id === id);
    if (index === -1) return;

    const res = reservations[index];

    if (!isAdmin() && res.guest !== currentUser.username) {
        alert("You cannot cancel this reservation!");
        return;
    }

    const room = rooms.find(r => r.id === res.roomId);
    if (room) {
        room.status = "available";
    }

    reservations.splice(index, 1);

    saveRooms();
    saveReservations();

    renderRoomOptions();
    displayRooms();
    displayReservations();
}

/* RESERVATIONS */
function displayReservations() {
    const list = document.getElementById("reservationsList");
    if (!list || !currentUser) return;

    list.innerHTML = "";

    let data = isAdmin()
        ? reservations
        : reservations.filter(r => r.guest === currentUser.username);

    data.forEach(r => {
        list.innerHTML += `
            <div class="list-item">
                <div class="list-item-header">Reservation #${r.id}</div>
                <div class="list-item-detail">Room: ${r.roomId}</div>
                <div class="list-item-detail">Nights: ${r.nights}</div>
                <div class="list-item-detail">Price: ${r.totalPrice} lv</div>
                <div class="list-item-detail">
                    Services: ${
                        r.services?.length
                            ? r.services.map(s => s.name + " (" + s.price + " lv)").join(", ")
                            : "None"
                    }
                </div>

                <button onclick="cancelReservation(${r.id})"
                    style="margin-top:8px;padding:6px 10px;cursor:pointer;">
                    Отмени
                </button>
            </div>
        `;
    });
}

/* GUESTS */
function displayGuests() {
    const list = document.getElementById("guestsList");
    if (!list || !isAdmin()) return;

    users = JSON.parse(localStorage.getItem("hotelUsers")) || [];

    const guests = users.filter(u => u.role === "GUEST");

    list.innerHTML = "";

    guests.forEach(u => {
        const resCount = reservations.filter(r => r.guest === u.username).length;

        list.innerHTML += `
            <div class="list-item">
                <div class="list-item-header">${u.fullName}</div>
                <div class="list-item-detail">@${u.username}</div>
                <div class="list-item-detail">${u.email}</div>
                <div class="list-item-detail">Reservations: ${resCount}</div>
            </div>
        `;
    });
}

/* GUEST PLACEHOLDER */
function addGuest() {
    alert("Guests are managed via registration page.");
}