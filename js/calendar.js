const bookingForm = document.getElementById('booking-form');
const bookingAgency = document.getElementById('booking-agency');
const bookingDate = document.getElementById('booking-date');
const calendarMonth = document.getElementById('calendar-month');
const calendarGrid = document.getElementById('calendar-grid');
const appointmentsList = document.getElementById('appointments-list');
const userGreeting = document.getElementById('user-greeting');

const state = {
    agencies: [
        { name: 'AutoPlus Centro' },
        { name: 'Agencia Norte' },
        { name: 'Garage Premium' },
    ],
    appointments: [],
    selectedDate: null,
    session: null,
};

function formatMonth(date) {
    return date.toLocaleString('es-AR', { month: 'long', year: 'numeric' });
}

function pad(value) {
    return value.toString().padStart(2, '0');
}

function getDaysInMonth(year, month) {
    return new Date(year, month + 1, 0).getDate();
}

function isToday(year, month, day) {
    const today = new Date();
    return today.getFullYear() === year && today.getMonth() === month && today.getDate() === day;
}

function renderAgencyOptions() {
    bookingAgency.innerHTML = '<option value="">Selecciona una agencia</option>';
    state.agencies.forEach((agency, index) => {
        const option = document.createElement('option');
        option.value = index;
        option.textContent = agency.name;
        bookingAgency.appendChild(option);
    });
}

function getSessionUser() {
    const stored = localStorage.getItem('recall-insiders-session');
    return stored ? JSON.parse(stored) : null;
}

function renderUserGreeting() {
    if (!userGreeting) return;
    const session = getSessionUser();
    if (session) {
        userGreeting.textContent = `Hola ${session.name || session.email}. Estás logueado como ${session.userType === 'buyer' ? 'Ejecutivos' : 'Agencia'} y podés reservar turnos.`;
    } else {
        userGreeting.innerHTML = 'No estás logueado. <a href="ingreso.html" class="primary-btn">Ingresar</a>';
    }
}

function renderCalendar() {
    const now = state.selectedDate ? new Date(state.selectedDate) : new Date();
    const year = now.getFullYear();
    const month = now.getMonth();
    calendarMonth.textContent = formatMonth(now);

    if (bookingDate) {
        const minDate = new Date().toISOString().split('T')[0];
        bookingDate.min = minDate;
        bookingDate.value = state.selectedDate || bookingDate.value;
    }

    calendarGrid.innerHTML = '';
    const firstDay = new Date(year, month, 1).getDay();
    const totalDays = getDaysInMonth(year, month);

    for (let i = 0; i < firstDay; i += 1) {
        const emptyCell = document.createElement('div');
        emptyCell.className = 'calendar-day';
        emptyCell.innerHTML = '';
        calendarGrid.appendChild(emptyCell);
    }

    for (let day = 1; day <= totalDays; day += 1) {
        const cell = document.createElement('button');
        cell.type = 'button';
        cell.className = 'calendar-day';
        if (isToday(year, month, day)) {
            cell.classList.add('--today');
        }

        const dateKey = `${year}-${pad(month + 1)}-${pad(day)}`;
        const appointmentsForDay = state.appointments.filter(item => item.date === dateKey);

        if (state.selectedDate === dateKey) {
            cell.classList.add('--selected');
        }

        const number = document.createElement('span');
        number.className = 'day-number';
        number.textContent = day;

        const badge = document.createElement('div');
        badge.className = 'day-badge';
        badge.textContent = appointmentsForDay.length
            ? `${appointmentsForDay.length} turno${appointmentsForDay.length > 1 ? 's' : ''}`
            : 'Libre';

        cell.appendChild(number);
        cell.appendChild(badge);

        cell.addEventListener('click', () => {
            state.selectedDate = dateKey;
            bookingDate.value = dateKey;
            renderCalendar();
        });

        calendarGrid.appendChild(cell);
    }
}

function renderAppointmentsList() {
    appointmentsList.innerHTML = '';
    if (!state.appointments.length) {
        const empty = document.createElement('p');
        empty.className = 'empty-state';
        empty.textContent = 'Aún no hay turnos programados.';
        appointmentsList.appendChild(empty);
        return;
    }

    state.appointments.forEach(appointment => {
        const card = document.createElement('article');
        card.className = 'appointment-card';
        const title = document.createElement('h4');
        title.textContent = `${appointment.name} - ${appointment.agency}`;
        const date = document.createElement('p');
        date.textContent = `Fecha: ${appointment.date} - Hora: ${appointment.time}`;
        const vehicle = document.createElement('p');
        vehicle.textContent = `Auto: ${appointment.model} (${appointment.license})`;
        const contact = document.createElement('p');
        contact.textContent = `Email: ${appointment.email} | Tel: ${appointment.phone}`;

        card.appendChild(title);
        card.appendChild(date);
        card.appendChild(vehicle);
        card.appendChild(contact);
        appointmentsList.appendChild(card);
    });
}

function loadAppointments() {
    const stored = localStorage.getItem('recall-insiders-appointments');
    if (stored) {
        state.appointments = JSON.parse(stored);
    }
}

function saveAppointments() {
    localStorage.setItem('recall-insiders-appointments', JSON.stringify(state.appointments));
}

function showMessage(message) {
    alert(message);
}

bookingForm.addEventListener('submit', event => {
    event.preventDefault();

    const name = document.getElementById('booking-name').value.trim();
    const email = document.getElementById('booking-email').value.trim();
    const phone = document.getElementById('booking-phone').value.trim();
    const agencyIndex = bookingAgency.value;
    const license = document.getElementById('booking-license').value.trim();
    const chassis = document.getElementById('booking-chassis').value.trim();
    const model = document.getElementById('booking-model').value.trim();
    const province = document.getElementById('booking-province').value.trim();
    const city = document.getElementById('booking-city').value.trim();
    const date = bookingDate.value;
    const time = document.getElementById('booking-time').value;

    if (!name || !email || !phone || !agencyIndex || !license || !model || !province || !city || !date || !time) {
        showMessage('Completa todos los campos obligatorios para reservar el turno.');
        return;
    }

    const agency = state.agencies[agencyIndex];
    const appointment = {
        name,
        email,
        phone,
        agency: agency.name,
        license,
        chassis,
        model,
        province,
        city,
        date,
        time,
    };

    state.appointments.push(appointment);
    saveAppointments();
    state.selectedDate = date;
    renderCalendar();
    renderAppointmentsList();
    showMessage('Turno reservado con éxito. Aparecerá en el calendario.');
    bookingForm.reset();
});

loadAppointments();
renderAgencyOptions();
renderUserGreeting();
const current = new Date();
state.selectedDate = `${current.getFullYear()}-${pad(current.getMonth() + 1)}-${pad(current.getDate())}`;
renderCalendar();
renderAppointmentsList();