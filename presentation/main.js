const guestForm = document.getElementById('guestForm');
const guestList = document.getElementById('guestList');
const reservationForm = document.getElementById('reservationForm');
const reservationList = document.getElementById('reservationList');

async function loadGuests() {
    const res = await fetch('http://localhost:8080/api/guests');
    const data = await res.json();
    guestList.innerHTML = '';
    data.forEach(g => {
        const li = document.createElement('li');
        li.textContent = g.name + ' (' + g.email + ')';
        guestList.appendChild(li);
    });
}
guestForm.onsubmit = async (e) => {
    e.preventDefault();
    await fetch('http://localhost:8080/api/guests', {
        method: 'POST',
        headers: {'Content-Type':'application/json'},
        body: JSON.stringify({
            name: document.getElementById('gname').value,
            email: document.getElementById('gemail').value
        })
    });
    loadGuests();
    guestForm.reset();
};
loadGuests();

async function loadReservations() {
    const res = await fetch('http://localhost:8080/api/reservations');
    const data = await res.json();
    reservationList.innerHTML = '';
    data.forEach(r => {
        const li = document.createElement('li');
        li.textContent = r.guestName + ' – стая: ' + r.room;
        reservationList.appendChild(li);
    });
}
reservationForm.onsubmit = async (e) => {
    e.preventDefault();
    await fetch('http://localhost:8080/api/reservations', {
        method: 'POST',
        headers: {'Content-Type':'application/json'},
        body: JSON.stringify({
            guestName: document.getElementById('rguest').value,
            room: document.getElementById('rroom').value
        })
    });
    loadReservations();
    reservationForm.reset();
};
loadReservations();