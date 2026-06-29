let currentUser = JSON.parse(localStorage.getItem("hotelCurrentUser")) || null;
let users = JSON.parse(localStorage.getItem("hotelUsers")) || [];

let rooms = JSON.parse(localStorage.getItem("rooms")) || [
    { id: "101", type: "Single", price: 80, capacity: 1, status: "available" },
    { id: "102", type: "Double", price: 120, capacity: 2, status: "available" },
    { id: "201", type: "Suite", price: 200, capacity: 4, status: "available" },
    { id: "301", type: "Quad", price: 250, capacity: 4, status: "available" }
];

let reservations = JSON.parse(localStorage.getItem("reservations")) || [];

/* LOYALTY PROGRAM */
const LOYALTY_LEVELS = [
    { name: "Bronze", minPoints: 0, discount: 0 },
    { name: "Silver", minPoints: 100, discount: 5 },
    { name: "Gold", minPoints: 300, discount: 10 }
];

function getLoyaltyPoints(username) {
    return reservations
        .filter(r => r.guest === username && r.status !== "cancelled")
        .reduce((sum, r) => sum + Math.round(r.totalPrice), 0);
}

function getLoyaltyLevel(points) {
    let level = LOYALTY_LEVELS[0];
    for (const lvl of LOYALTY_LEVELS) {
        if (points >= lvl.minPoints) level = lvl;
    }
    return level;
}

function getLoyaltyInfo(username) {
    const points = getLoyaltyPoints(username);
    const level = getLoyaltyLevel(points);
    const next = LOYALTY_LEVELS.find(l => l.minPoints > points);
    return { points, level, next };
}

function displayLoyaltyCard() {
    const el = document.getElementById("loyaltyCard");
    if (!el || !currentUser || isAdmin()) return;

    const loyalty = getLoyaltyInfo(currentUser.username);
    const nextText = loyalty.next
        ? `До ниво ${loyalty.next.name}: ${loyalty.next.minPoints - loyalty.points} точки`
        : "Достигнато най-високо ниво!";

    el.innerHTML = `
        <div class="list-item" style="text-align:center;">
            <div class="list-item-header">Програма за лоялни клиенти</div>
            <div class="list-item-detail">Ниво: <strong>${loyalty.level.name}</strong></div>
            <div class="list-item-detail">Точки: ${loyalty.points}</div>
            <div class="list-item-detail">Текуща отстъпка: ${loyalty.level.discount}%</div>
            <div class="list-item-detail">${nextText}</div>
        </div>
    `;
}

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
    displayLoyaltyCard();
};

/* NAV */
function showSection(sectionId) {
    document.querySelectorAll(".section").forEach(s => s.classList.remove("active"));
    document.getElementById(sectionId).classList.add("active");

    if (sectionId === "guests") displayGuests();
    if (sectionId === "home") displayLoyaltyCard();
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

    const baseTotal = nights * room.price + servicesTotal;

    const loyalty = getLoyaltyInfo(currentUser.username);
    const discountAmount = baseTotal * (loyalty.level.discount / 100);
    const totalPrice = baseTotal - discountAmount;

    reservations.push({
        id: reservations.length + 1,
        guest: currentUser.username,
        roomId,
        nights,
        services,
        baseTotal,
        loyaltyLevel: loyalty.level.name,
        loyaltyDiscountPercent: loyalty.level.discount,
        discountAmount,
        totalPrice,
        status: "pending",
        paymentStatus: "Неплатено",
        paymentMethod: null
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
                <div class="list-item-detail">
                    Services: ${
                        r.services?.length
                            ? r.services.map(s => s.name + " (" + s.price + " lv)").join(", ")
                            : "None"
                    }
                </div>
                ${r.loyaltyDiscountPercent ? `
                <div class="list-item-detail">
                    Лоялна отстъпка (${r.loyaltyLevel}): -${r.loyaltyDiscountPercent}% (-${r.discountAmount.toFixed(2)} лв)
                </div>` : ""}
                <div class="list-item-detail"><strong>Price: ${r.totalPrice.toFixed(2)} lv</strong></div>
                <div class="list-item-detail">
                    Плащане: <strong>${r.paymentStatus}</strong>${r.paymentMethod ? " (" + r.paymentMethod + ")" : ""}
                </div>

                <button onclick="cancelReservation(${r.id})"
                    style="margin-top:8px;padding:6px 10px;cursor:pointer;">
                    Отмени
                </button>
                <button onclick="generateInvoice(${r.id})"
                    style="margin-top:8px;margin-left:6px;padding:6px 10px;cursor:pointer;">
                    Фактура
                </button>
                ${r.paymentStatus !== "Платено" ? `
                <button onclick="openPayment(${r.id})"
                    style="margin-top:8px;margin-left:6px;padding:6px 10px;cursor:pointer;">
                    Плати
                </button>` : ""}
            </div>
        `;
    });
}

/* INVOICE (RECEIPT) */
let invoiceCounter = JSON.parse(localStorage.getItem("invoiceCounter")) || 1000;

function generateInvoice(reservationId) {
    const r = reservations.find(res => res.id === reservationId);
    if (!r) return alert("Резервацията не е намерена!");

    invoiceCounter++;
    localStorage.setItem("invoiceCounter", JSON.stringify(invoiceCounter));

    const room = rooms.find(room => room.id === r.roomId);
    const roomPrice = room ? room.price : 0;
    const roomTotal = roomPrice * r.nights;

    const servicesRows = (r.services || []).length
        ? r.services.map(s => `
            <div class="receipt-row">
                <span>${s.name}</span>
                <span>${s.price.toFixed(2)} лв</span>
            </div>
        `).join("")
        : `<div class="receipt-row"><span>Без допълнителни услуги</span><span></span></div>`;

    const discountRow = r.loyaltyDiscountPercent ? `
        <div class="receipt-row">
            <span>Лоялна отстъпка (${r.loyaltyLevel}, -${r.loyaltyDiscountPercent}%)</span>
            <span>-${r.discountAmount.toFixed(2)} лв</span>
        </div>
    ` : "";

    const now = new Date();
    const dateStr = now.toLocaleDateString("bg-BG") + " " + now.toLocaleTimeString("bg-BG");

    const receiptHtml = `
        <div class="receipt-overlay" onclick="closeInvoice(event)">
            <div class="receipt" onclick="event.stopPropagation()">
                <div class="receipt-header">
                    <h3>Hotel Management</h3>
                    <p>Фактура № ${invoiceCounter}</p>
                    <p>${dateStr}</p>
                </div>
                <div class="receipt-divider"></div>
                <div class="receipt-row">
                    <span>Гост</span>
                    <span>${r.guest}</span>
                </div>
                <div class="receipt-row">
                    <span>Резервация №</span>
                    <span>${r.id}</span>
                </div>
                <div class="receipt-row">
                    <span>Стая</span>
                    <span>#${r.roomId}</span>
                </div>
                <div class="receipt-row">
                    <span>Нощувки</span>
                    <span>${r.nights}</span>
                </div>
                <div class="receipt-row">
                    <span>Цена/нощ</span>
                    <span>${roomPrice.toFixed(2)} лв</span>
                </div>
                <div class="receipt-row">
                    <span><strong>Настаняване общо</strong></span>
                    <span><strong>${roomTotal.toFixed(2)} лв</strong></span>
                </div>
                <div class="receipt-divider"></div>
                <p class="receipt-subtitle">Допълнителни услуги</p>
                ${servicesRows}
                <div class="receipt-divider"></div>
                ${discountRow}
                <div class="receipt-row receipt-total">
                    <span>ОБЩА СУМА</span>
                    <span>${r.totalPrice.toFixed(2)} лв</span>
                </div>
                <div class="receipt-row">
                    <span>Статус плащане</span>
                    <span>${r.paymentStatus}${r.paymentMethod ? " (" + r.paymentMethod + ")" : ""}</span>
                </div>
                <p class="receipt-footer">Благодарим Ви, че избрахте нашия хотел!</p>
                <button class="btn btn-primary" onclick="closeInvoice()">Затвори</button>
            </div>
        </div>
    `;

    const container = document.createElement("div");
    container.id = "invoiceContainer";
    container.innerHTML = receiptHtml;
    document.body.appendChild(container);
}

function closeInvoice(event) {
    if (event && event.target.id !== "invoiceContainer" && !event.target.classList.contains("receipt-overlay")) return;
    const el = document.getElementById("invoiceContainer");
    if (el) el.remove();
}

/* ONLINE PAYMENT */
function openPayment(reservationId) {
    const r = reservations.find(res => res.id === reservationId);
    if (!r) return alert("Резервацията не е намерена!");

    const paymentHtml = `
        <div class="receipt-overlay" onclick="closePayment(event)">
            <div class="receipt" onclick="event.stopPropagation()">
                <div class="receipt-header">
                    <h3>Плащане</h3>
                    <p>Резервация № ${r.id} — ${r.totalPrice.toFixed(2)} лв</p>
                </div>
                <div class="receipt-divider"></div>

                <div class="field-group">
                    <label>Метод на плащане</label>
                    <select id="paymentMethod" class="input-field">
                        <option value="Карта">Карта</option>
                        <option value="Кеш на рецепция">Кеш на рецепция</option>
                        <option value="Банков превод">Банков превод</option>
                    </select>
                </div>

                <div id="cardFields">
                    <div class="field-group">
                        <label>Номер на карта</label>
                        <input id="cardNumber" class="input-field" placeholder="4111 1111 1111 1111" maxlength="19">
                    </div>
                    <div class="field-group" style="display:flex; gap:0.5rem;">
                        <input id="cardExpiry" class="input-field" placeholder="MM/YY" maxlength="5">
                        <input id="cardCvv" class="input-field" placeholder="CVV" maxlength="3">
                    </div>
                </div>

                <p id="paymentMessage" style="color:#dc3545; font-size:0.85rem; display:none;"></p>

                <button class="btn btn-primary" onclick="confirmPayment(${r.id})">Плати ${r.totalPrice.toFixed(2)} лв</button>
                <button class="btn" style="margin-top:0.5rem; background:#eee;" onclick="closePayment()">Отказ</button>
            </div>
        </div>
    `;

    const container = document.createElement("div");
    container.id = "paymentContainer";
    container.innerHTML = paymentHtml;
    document.body.appendChild(container);

    document.getElementById("paymentMethod").addEventListener("change", (e) => {
        document.getElementById("cardFields").style.display = e.target.value === "Карта" ? "block" : "none";
    });
}

function closePayment(event) {
    if (event && event.target.id !== "paymentContainer" && !event.target.classList.contains("receipt-overlay")) return;
    const el = document.getElementById("paymentContainer");
    if (el) el.remove();
}

function confirmPayment(reservationId) {
    const method = document.getElementById("paymentMethod").value;

    if (method === "Карта") {
        const number = document.getElementById("cardNumber").value.replace(/\s/g, "");
        const expiry = document.getElementById("cardExpiry").value;
        const cvv = document.getElementById("cardCvv").value;

        if (!/^\d{16}$/.test(number) || !/^\d{2}\/\d{2}$/.test(expiry) || !/^\d{3}$/.test(cvv)) {
            const msg = document.getElementById("paymentMessage");
            msg.textContent = "Невалидни данни за картата!";
            msg.style.display = "block";
            return;
        }
    }

    const r = reservations.find(res => res.id === reservationId);
    if (!r) return;

    r.paymentStatus = "Платено";
    r.paymentMethod = method;

    saveReservations();
    closePayment();
    displayReservations();
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
        const loyalty = getLoyaltyInfo(u.username);

        list.innerHTML += `
            <div class="list-item">
                <div class="list-item-header">${u.fullName}</div>
                <div class="list-item-detail">@${u.username}</div>
                <div class="list-item-detail">${u.email}</div>
                <div class="list-item-detail">Reservations: ${resCount}</div>
                <div class="list-item-detail">Лоялност: ${loyalty.level.name} (${loyalty.points} точки)</div>
            </div>
        `;
    });
}

/* GUEST PLACEHOLDER */
function addGuest() {
    alert("Guests are managed via registration page.");
}