let currentUser = JSON.parse(localStorage.getItem("hotelCurrentUser")) || null;
let users = JSON.parse(localStorage.getItem("hotelUsers")) || [];

let rooms = JSON.parse(localStorage.getItem("rooms")) || [
    { id: "101", type: "Single", price: 40, capacity: 1, status: "available" },
    { id: "102", type: "Double", price: 80, capacity: 2, status: "available" },
    { id: "201", type: "Suite", price: 150, capacity: 4, status: "available" },
    { id: "301", type: "Quad", price: 200, capacity: 4, status: "available" }
];

let reservations = JSON.parse(localStorage.getItem("reservations")) || [];

let services = JSON.parse(localStorage.getItem("hotelServices")) || [
    { id: 1, name: "Храна", description: "Закуска и вечеря", price: 25 },
    { id: 2, name: "СПА", description: "Масажи и басейн", price: 60 },
    { id: 3, name: "Транспорт", description: "Летищен трансфер", price: 50 },
    { id: 4, name: "Турове", description: "Екскурзии", price: 100 }
];

function saveServices() {
    localStorage.setItem("hotelServices", JSON.stringify(services));
}

function addService() {
    if (!isAdmin()) return;

    const name = document.getElementById("serviceName").value.trim();
    const description = document.getElementById("serviceDescription").value.trim();
    const price = Number(document.getElementById("servicePrice").value);

    if (!name || !price) return alert("Въведи име и цена!");

    const id = services.length ? Math.max(...services.map(s => s.id)) + 1 : 1;
    services.push({ id, name, description, price });
    saveServices();

    document.getElementById("serviceName").value = "";
    document.getElementById("serviceDescription").value = "";
    document.getElementById("servicePrice").value = "";

    displayServices();
    renderServiceCheckboxes();
}

function deleteService(id) {
    if (!isAdmin()) return;
    services = services.filter(s => s.id !== id);
    saveServices();
    displayServices();
    renderServiceCheckboxes();
}

function displayServices() {
    const grid = document.getElementById("servicesGrid");
    if (!grid) return;

    const adminForm = document.getElementById("adminServiceForm");
    if (adminForm) adminForm.style.display = isAdmin() ? "block" : "none";

    grid.innerHTML = "";
    services.forEach(s => {
        grid.innerHTML += `
            <div class="service-card">
                <h3>${s.name}</h3>
                <p>${s.description}</p>
                <p class="price">${s.price} €</p>
                ${isAdmin() ? `<button onclick="deleteService(${s.id})" style="margin-top:8px;padding:4px 8px;cursor:pointer;background:#dc3545;color:white;border:none;border-radius:4px;">Изтрий</button>` : ""}
            </div>
        `;
    });
}

function renderServiceCheckboxes() {
    const container = document.getElementById("serviceCheckboxes");
    if (!container) return;

    container.innerHTML = "";
    services.forEach(s => {
        container.innerHTML += `
            <label>
                <input type="checkbox" class="service-check" data-name="${s.name}" data-price="${s.price}">
                ${s.name} (${s.price} €)
            </label><br>
        `;
    });
}

//STAY TYPES
const STAY_TYPES = [
    { name: "Краткосрочен престой", minNights: 1, maxNights: 3 },
    { name: "Дългосрочен престой", minNights: 4, maxNights: 13 },
    { name: "Дългосрочен престой", minNights: 14, maxNights: Infinity }
];

const PACKAGE_OFFERS = [
    { id: "weekend", name: "Уикенд пакет", nights: 2, discount: 10, description: "2 нощувки с 10% отстъпка" },
    { id: "week",    name: "Седмичен пакет", nights: 7, discount: 15, description: "7 нощувки с 15% отстъпка" },
    { id: "spa",     name: "Спа пакет", nights: 3, discount: 5, description: "3 нощувки + спа процедури включени" }
];

function getStayType(nights) {
    if (nights <= 3) return "Краткосрочен престой";
    if (nights <= 13) return "Дългосрочен престой";
    return "Дългосрочен престой (extended)";
}

// LOYALTY PROGRAM 
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

//  ПЕРСОНАЛИЗИРАНИ ПРЕДЛОЖЕНИЯ 
function getPersonalizedSuggestions(username) {
    const userReservations = reservations.filter(r => r.guest === username && r.status !== "cancelled");

    if (userReservations.length === 0) return [];

    const suggestions = [];

    // Брой нощувки общо
    const totalNights = userReservations.reduce((sum, r) => sum + r.nights, 0);

    // Най-използвани услуги
    const serviceCount = {};
    userReservations.forEach(r => {
        (r.services || []).forEach(s => {
            serviceCount[s.name] = (serviceCount[s.name] || 0) + 1;
        });
    });

    const favouriteService = Object.entries(serviceCount).sort((a, b) => b[1] - a[1])[0];

    // Предложение базирано на любима услуга
    if (favouriteService) {
        suggestions.push({
            icon: "⭐",
            text: `Забелязахме, че обичате "${favouriteService[0]}" — добавете я и към следващата си резервация!`
        });
    }

    // Предложение за пакет ако има много нощувки
    if (totalNights >= 5) {
        suggestions.push({
            icon: "🏨",
            text: `Вие сте при нас ${totalNights} нощи общо! Разгледайте нашия Седмичен пакет с 15% отстъпка.`
        });
    }

    // Предложение за СПА ако никога не е ползвал
    const hasSpa = userReservations.some(r => (r.services || []).some(s => s.name === "СПА"));
    if (!hasSpa) {
        suggestions.push({
            icon: "💆",
            text: `Опитайте нашите СПА процедури — релакс и масажи на специална цена за лоялни гости!`
        });
    }

    // Предложение за уикенд пакет ако резервациите са кратки
    const avgNights = totalNights / userReservations.length;
    if (avgNights <= 2) {
        suggestions.push({
            icon: "🌅",
            text: `Забелязахме, че предпочитате кратки престои — нашият Уикенд пакет е идеален за вас (-10%)!`
        });
    }

    return suggestions;
}

function displaySuggestions() {
    const el = document.getElementById("suggestionsCard");
    if (!el || !currentUser || isAdmin()) return;

    const suggestions = getPersonalizedSuggestions(currentUser.username);

    if (suggestions.length === 0) {
        el.innerHTML = "";
        return;
    }

    el.innerHTML = `
        <div class="list-item">
            <div class="list-item-header">Персонализирани предложения за вас</div>
            ${suggestions.map(s => `
                <div class="list-item-detail" style="margin:6px 0; padding:8px; background:#f8f9fa; border-radius:6px;">
                    ${s.icon} ${s.text}
                </div>
            `).join("")}
        </div>
    `;
}

// ROLE CHECK
function isAdmin() {
    return currentUser && currentUser.role === "ADMIN";
}

// SAVE
function saveRooms() {
    localStorage.setItem("rooms", JSON.stringify(rooms));
}

function saveReservations() {
    localStorage.setItem("reservations", JSON.stringify(reservations));
}

// INIT
window.onload = function () {
    currentUser = JSON.parse(localStorage.getItem("hotelCurrentUser")) || null;

    console.log("DEBUG currentUser:", currentUser);
    console.log("DEBUG isAdmin:", isAdmin());
    console.log("DEBUG location:", window.location.href);

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
    displaySuggestions();
    displayServices();
    renderServiceCheckboxes();
};

// NAVIGATION
function showSection(sectionId) {
    document.querySelectorAll(".section").forEach(s => s.classList.remove("active"));
    document.getElementById(sectionId).classList.add("active");

    if (sectionId === "guests") displayGuests();
    if (sectionId === "home") { displayLoyaltyCard(); displaySuggestions(); }
    if (sectionId === "services") displayServices();
}

// LOGOUT
function logout() {
    localStorage.removeItem("hotelCurrentUser");
    window.location.href = "auth.html";
}

// ROOMS
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

// ROOM OPTIONS
function renderRoomOptions() {
    const select = document.getElementById("resRoomId");
    if (!select) return;

    select.innerHTML = "";

    rooms.forEach(r => {
        if (r.status === "available") {
            select.innerHTML += `
                <option value="${r.id}">
                    ${r.id} - ${r.type} (${r.price} €)
                </option>
            `;
        }
    });
}

// ROOMS VIEW
function displayRooms() {
    const list = document.getElementById("roomsList");
    if (!list || !isAdmin()) return;

    list.innerHTML = "";

    rooms.forEach(r => {
        list.innerHTML += `
            <div class="list-item">
                <div class="list-item-header">Room #${r.id} - ${r.type}</div>
                <div class="list-item-detail">Price: ${r.price}€</div>
                <div class="list-item-detail">Capacity: ${r.capacity}</div>
                <div class="list-item-detail">Status: ${r.status}</div>
            </div>
        `;
    });
}

// RESERVATION
function addReservation() {
    if (!currentUser) return alert("Login first!");

    const roomId = document.getElementById("resRoomId").value;
    const checkIn = document.getElementById("resCheckIn").value;
    const checkOut = document.getElementById("resCheckOut").value;
    const selectedPackage = document.getElementById("resPackage")?.value || "";

    const room = rooms.find(r => r.id === roomId);
    if (!room) return alert("Room not found");

    let nights = Math.max(
        1,
        Math.floor((new Date(checkOut) - new Date(checkIn)) / 86400000)
    );

    let packageDiscount = 0;
    let packageName = null;

    if (selectedPackage) {
        const pkg = PACKAGE_OFFERS.find(p => p.id === selectedPackage);
        if (pkg) {
            nights = pkg.nights;
            packageDiscount = pkg.discount;
            packageName = pkg.name;
        }
    }

    const stayType = getStayType(nights);

    const services = Array.from(document.querySelectorAll(".service-check:checked"))
        .map(s => ({
            name: s.dataset.name,
            price: Number(s.dataset.price)
        }));

    const servicesTotal = services.reduce((a, b) => a + b.price, 0);
    const baseTotal = nights * room.price + servicesTotal;

    const loyalty = getLoyaltyInfo(currentUser.username);
    const totalDiscountPercent = Math.min(loyalty.level.discount + packageDiscount, 30);
    const discountAmount = baseTotal * (totalDiscountPercent / 100);
    const totalPrice = baseTotal - discountAmount;

    const userReservationCount = reservations.filter(r => r.guest === currentUser.username).length;

    reservations.push({
        id: userReservationCount + 1,
        guest: currentUser.username,
        roomId,
        nights,
        stayType,
        packageName,
        packageDiscount,
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

// CANCEL RESERVATION
function cancelReservation(id, guest) {
    const index = reservations.findIndex(r => r.id === id && r.guest === (guest || currentUser.username));
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

// RESERVATIONS
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
                <div class="list-item-header">Reservation #${r.id} ${isAdmin() ? `— ${r.guest}` : ""}</div>
                <div class="list-item-detail">Room: ${r.roomId}</div>
                <div class="list-item-detail">Nights: ${r.nights}</div>
                <div class="list-item-detail">Тип престой: <strong>${r.stayType || getStayType(r.nights)}</strong></div>
                ${r.packageName ? `<div class="list-item-detail">Пакет: <strong>${r.packageName}</strong> (-${r.packageDiscount}%)</div>` : ""}
                <div class="list-item-detail">
                    Services: ${
                        r.services?.length
                            ? r.services.map(s => s.name + " (" + s.price + " €)").join(", ")
                            : "None"
                    }
                </div>
                ${r.loyaltyDiscountPercent ? `
                <div class="list-item-detail">
                    Лоялна отстъпка (${r.loyaltyLevel}): -${r.loyaltyDiscountPercent}% (-${r.discountAmount.toFixed(2)} euro)
                </div>` : ""}
                <div class="list-item-detail"><strong>Price: ${r.totalPrice.toFixed(2)} €</strong></div>
                <div class="list-item-detail">
                    Плащане: <strong>${r.paymentStatus}</strong>${r.paymentMethod ? " (" + r.paymentMethod + ")" : ""}
                </div>

                <button onclick="cancelReservation(${r.id}, '${r.guest}')"
                    style="margin-top:8px;padding:6px 10px;cursor:pointer;">
                    Отмени
                </button>
                <button onclick="generateInvoice(${r.id}, '${r.guest}')"
                    style="margin-top:8px;margin-left:6px;padding:6px 10px;cursor:pointer;">
                    Фактура
                </button>
                ${r.paymentStatus !== "Платено" ? `
                <button onclick="openPayment(${r.id}, '${r.guest}')"
                    style="margin-top:8px;margin-left:6px;padding:6px 10px;cursor:pointer;">
                    Плати
                </button>` : ""}
            </div>
        `;
    });
}

// INVOICE (RECEIPT)
let invoiceCounter = JSON.parse(localStorage.getItem("invoiceCounter")) || 1000;

function generateInvoice(reservationId, guest) {
    const r = reservations.find(res => res.id === reservationId && res.guest === (guest || currentUser.username));
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
                <span>${s.price.toFixed(2)} €</span>
            </div>
        `).join("")
        : `<div class="receipt-row"><span>Без допълнителни услуги</span><span></span></div>`;

    const discountRow = r.loyaltyDiscountPercent ? `
        <div class="receipt-row">
            <span>Лоялна отстъпка (${r.loyaltyLevel}, -${r.loyaltyDiscountPercent}%)</span>
            <span>-${r.discountAmount.toFixed(2)} €</span>
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
                    <span>Тип престой</span>
                    <span>${r.stayType || getStayType(r.nights)}</span>
                </div>
                ${r.packageName ? `
                <div class="receipt-row">
                    <span>Пакет</span>
                    <span>${r.packageName} (-${r.packageDiscount}%)</span>
                </div>` : ""}
                <div class="receipt-row">
                    <span>Нощувки</span>
                    <span>${r.nights}</span>
                </div>
                <div class="receipt-row">
                    <span>Цена/нощ</span>
                    <span>${roomPrice.toFixed(2)} €</span>
                </div>
                <div class="receipt-row">
                    <span><strong>Настаняване общо</strong></span>
                    <span><strong>${roomTotal.toFixed(2)} €</strong></span>
                </div>
                <div class="receipt-divider"></div>
                <p class="receipt-subtitle">Допълнителни услуги</p>
                ${servicesRows}
                <div class="receipt-divider"></div>
                ${discountRow}
                <div class="receipt-row receipt-total">
                    <span>ОБЩА СУМА</span>
                    <span>${r.totalPrice.toFixed(2)} €</span>
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

// ONLINE PAYMENT
function openPayment(reservationId, guest) {
    const r = reservations.find(res => res.id === reservationId && res.guest === (guest || currentUser.username));
    if (!r) return alert("Резервацията не е намерена!");

    const paymentHtml = `
        <div class="receipt-overlay" onclick="closePayment(event)">
            <div class="receipt" onclick="event.stopPropagation()">
                <div class="receipt-header">
                    <h3>Плащане</h3>
                    <p>Резервация № ${r.id} — ${r.totalPrice.toFixed(2)} €</p>
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

                <button class="btn btn-primary" onclick="confirmPayment(${r.id}, '${r.guest}')">Плати ${r.totalPrice.toFixed(2)} €</button>
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

function confirmPayment(reservationId, guest) {
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

    const r = reservations.find(res => res.id === reservationId && res.guest === (guest || currentUser.username));
    if (!r) return;
    r.paymentStatus = "Платено";
    r.paymentMethod = method;

    saveReservations();
    closePayment();
    displayReservations();
}

// GUESTS
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

// GUEST PLACEHOLDER
function addGuest() {
    alert("Guests are managed via registration page.");
}