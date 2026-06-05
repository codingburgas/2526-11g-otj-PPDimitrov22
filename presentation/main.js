
let guests = [];
let rooms = [];
let reservations = [];

function showSection(sectionId) {
    const sections = document.querySelectorAll('.section');
    sections.forEach(section => section.classList.remove('active'));
    document.getElementById(sectionId).classList.add('active');
}

function addGuest() {
    const id = document.getElementById('guestId').value;
    const name = document.getElementById('guestName').value;
    const email = document.getElementById('guestEmail').value;
    const phone = document.getElementById('guestPhone').value;
    const address = document.getElementById('guestAddress').value;

    if (!id || !name || !email || !phone || !address) {
        alert('Моля, попълнете всички полета!');
        return;
    }
    guests.push({
        id: id,
        name: name,
        email: email,
        phone: phone,
        address: address
    });
    document.getElementById('guestId').value = '';
    document.getElementById('guestName').value = '';
    document.getElementById('guestEmail').value = '';
    document.getElementById('guestPhone').value = '';
    document.getElementById('guestAddress').value = '';

    displayGuests();
    alert('Гост успешно регистриран!');
}
function displayGuests() {
    const list = document.getElementById('guestsList');
    list.innerHTML = '';

    if (guests.length === 0) {
        list.innerHTML = '<p>Няма регистрирани гости</p>';
        return;
    }
    guests.forEach(guest => {
        const item = document.createElement('div');
        item.className = 'list-item';
        item.innerHTML = `
            <div class="list-item-header">${guest.name}</div>
            <div class="list-item-detail">ID: ${guest.id}</div>
            <div class="list-item-detail">Имейл: ${guest.email}</div>
            <div class="list-item-detail">Телефон: ${guest.phone}</div>
            <div class="list-item-detail">Адрес: ${guest.address}</div>
        `;
        list.appendChild(item);
    });
}

function addRoom() {
    const id = document.getElementById('roomId').value;
    const type = document.getElementById('roomType').value;
    const price = document.getElementById('roomPrice').value;
    const capacity = document.getElementById('roomCapacity').value;

    if (!id || !type || !price || !capacity) {
        alert('Моля, попълнете всички полета!');
        return;
    }
    rooms.push({
        id: id,
        type: type,
        price: price,
        capacity: capacity,
        status: 'available'
    });
    document.getElementById('roomId').value = '';
    document.getElementById('roomType').value = '';
    document.getElementById('roomPrice').value = '';
    document.getElementById('roomCapacity').value = '';

    displayRooms();
    alert('Стая успешно добавена!');
}

function displayRooms() {
    const list = document.getElementById('roomsList');
    list.innerHTML = '';

    if (rooms.length === 0) {
        list.innerHTML = '<p>Няма добавени стаи</p>';
        return;
    }

    rooms.forEach(room => {
        const item = document.createElement('div');
        item.className = 'list-item';
        const statusColor = room.status === 'available' ? '#28a745' : '#dc3545';
        item.innerHTML = `
            <div class="list-item-header">Стая #${room.id} - ${room.type}</div>
            <div class="list-item-detail">Цена: ${room.price} лв/ноч</div>
            <div class="list-item-detail">Капацитет: ${room.capacity} лица</div>
            <div class="list-item-detail" style="color: ${statusColor}">Статус: ${room.status}</div>
        `;
        list.appendChild(item);
    });
}
function addReservation() {
    const guestId = document.getElementById('resGuestId').value;
    const roomId = document.getElementById('resRoomId').value;
    const checkIn = document.getElementById('resCheckIn').value;
    const checkOut = document.getElementById('resCheckOut').value;

    if (!guestId || !roomId || !checkIn || !checkOut) {
        alert('Моля, попълнете всички полета!');
        return;
    }

    const room = rooms.find(r => r.id === roomId);
    if (!room) {
        alert('Стаята не е намерена!');
        return;
    }

    if (room.status !== 'available') {
        alert('Стаята не е налична!');
        return;
    }

    const checkInDate = new Date(checkIn);
    const checkOutDate = new Date(checkOut);
    const nights = Math.ceil((checkOutDate - checkInDate) / (1000 * 60 * 60 * 24));
    const totalPrice = nights * room.price;

    reservations.push({
        id: reservations.length + 1,
        guestId: guestId,
        roomId: roomId,
        checkIn: checkIn,
        checkOut: checkOut,
        nights: nights,
        totalPrice: totalPrice,
        status: 'pending'
    });

    room.status = 'occupied';

    document.getElementById('resGuestId').value = '';
    document.getElementById('resRoomId').value = '';
    document.getElementById('resCheckIn').value = '';
    document.getElementById('resCheckOut').value = '';

    displayRooms();
    displayReservations();
    alert('Резервация успешно създадена!');
}

function displayReservations() {
    const list = document.getElementById('reservationsList');
    list.innerHTML = '';

    if (reservations.length === 0) {
        list.innerHTML = '<p>Няма резервации</p>';
        return;
    }

    reservations.forEach(res => {
        const item = document.createElement('div');
        item.className = 'list-item';
        item.innerHTML = `
            <div class="list-item-header">Резервация #${res.id}</div>
            <div class="list-item-detail">Гост ID: ${res.guestId} | Стая ID: ${res.roomId}</div>
            <div class="list-item-detail">Вход: ${res.checkIn} | Изход: ${res.checkOut}</div>
            <div class="list-item-detail">Нощи: ${res.nights} | Обща цена: ${res.totalPrice} лв</div>
            <div class="list-item-detail">Статус: ${res.status}</div>
        `;
        list.appendChild(item);
    });
}
