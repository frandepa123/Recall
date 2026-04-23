// Authentication and Data Management
class AppManager {
    constructor() {
        this.users = JSON.parse(localStorage.getItem('users')) || [];
        this.currentUser = JSON.parse(localStorage.getItem('currentUser')) || null;
        this.listings = JSON.parse(localStorage.getItem('listings')) || [];
        this.consultations = JSON.parse(localStorage.getItem('consultations')) || [];
        this.cities = {
            "lanus": ["Centro", "Valentín Alsina", "Gerli", "Monte Chingolo", "Remedios de Escalada"],
            "buenos aires": ["Palermo", "Recoleta", "Belgrano", "Almagro", "Balvanera"],
            "cordoba": ["Centro", "Nueva Córdoba", "Alberdi", "General Paz"],
            "rosario": ["Centro", "Pichincha", "Fisherton", "Alberdi"],
            "mendoza": ["Centro", "Godoy Cruz", "Maipú", "Luján de Cuyo"]
        };
        this.init();
    }

    init() {
        this.setupEventListeners();
        this.populateYearSelect();
        this.populateConsultationYearSelect();
        this.updateUI();
    }

    setupEventListeners() {
        // Auth tabs
        document.querySelectorAll('.tab-btn').forEach(btn => {
            btn.addEventListener('click', (e) => this.switchAuthTab(e.target.dataset.tab, e.target));
        });

        // Forms
        document.getElementById('login-form')?.addEventListener('submit', (e) => this.handleLogin(e));
        document.getElementById('register-form')?.addEventListener('submit', (e) => this.handleRegister(e));
        document.getElementById('buyer-data-form')?.addEventListener('submit', (e) => this.handleBuyerSubmit(e));
        document.getElementById('agency-data-form')?.addEventListener('submit', (e) => this.handleAgencySubmit(e));
        document.getElementById('consultation-form')?.addEventListener('submit', (e) => this.handleConsultationSubmit(e));

        // City autocomplete
        document.getElementById('buyer-city')?.addEventListener('input', (e) => this.handleCityInput(e, 'buyer'));
        document.getElementById('agency-city')?.addEventListener('input', (e) => this.handleCityInput(e, 'agency'));

        // Buttons
        document.getElementById('edit-buyer-btn')?.addEventListener('click', () => this.showBuyerForm());
        document.getElementById('cancel-buyer-btn')?.addEventListener('click', () => this.showBuyerProfile());
        document.getElementById('edit-agency-btn')?.addEventListener('click', () => this.showAgencyForm());
        document.getElementById('cancel-agency-btn')?.addEventListener('click', () => this.showAgencyProfile());
        document.getElementById('new-consultation-btn')?.addEventListener('click', () => this.showConsultationForm());
        document.getElementById('cancel-consultation-btn')?.addEventListener('click', () => this.showConsultations());
        document.getElementById('logout-btn')?.addEventListener('click', () => this.logout());

        // Nav buttons
        document.querySelectorAll('[data-page]').forEach(btn => {
            btn.addEventListener('click', (e) => {
                const page = e.target.dataset.page;
                if (page === 'profile') {
                    this.currentUser.userType === 'buyer' ? this.showBuyerProfile() : this.showAgencyProfile();
                } else if (page === 'consultations') {
                    this.showConsultations();
                }
            });
        });
    }

    populateYearSelect() {
        const yearSelect = document.getElementById('buyer-year');
        if (!yearSelect) return;
        
        const currentYear = new Date().getFullYear();
        for (let year = currentYear; year >= 1990; year--) {
            const option = document.createElement('option');
            option.value = year;
            option.textContent = year;
            yearSelect.appendChild(option);
        }
    }

    populateConsultationYearSelect() {
        const yearSelect = document.getElementById('consultation-year');
        if (!yearSelect) return;
        
        const currentYear = new Date().getFullYear();
        for (let year = currentYear; year >= 1990; year--) {
            const option = document.createElement('option');
            option.value = year;
            option.textContent = year;
            yearSelect.appendChild(option);
        }
    }

    handleCityInput(e, type) {
        const input = e.target;
        const value = input.value.toLowerCase();
        let suggestionsDiv = document.getElementById(`${type}-city-suggestions`);
        if (!suggestionsDiv) {
            suggestionsDiv = document.createElement('div');
            suggestionsDiv.id = `${type}-city-suggestions`;
            suggestionsDiv.className = 'city-suggestions';
            input.parentNode.style.position = 'relative';
            input.parentNode.appendChild(suggestionsDiv);
        }
        suggestionsDiv.innerHTML = '';
        if (value.length > 1) {
            const matchingCities = Object.keys(this.cities).filter(city => city.includes(value));
            if (matchingCities.length > 0) {
                matchingCities.forEach(city => {
                    const cityDiv = document.createElement('div');
                    cityDiv.textContent = city.charAt(0).toUpperCase() + city.slice(1);
                    cityDiv.addEventListener('click', () => {
                        input.value = city.charAt(0).toUpperCase() + city.slice(1);
                        suggestionsDiv.innerHTML = '';
                        this.showZones(city, type);
                    });
                    suggestionsDiv.appendChild(cityDiv);
                });
            }
        }
    }

    showZones(city, type) {
        const zones = this.cities[city.toLowerCase()];
        if (zones) {
            let zoneSelect = document.getElementById(`${type}-zone`);
            if (!zoneSelect) {
                const formGroup = document.createElement('div');
                formGroup.className = 'form-group';
                const label = document.createElement('label');
                label.textContent = 'Zona';
                zoneSelect = document.createElement('select');
                zoneSelect.id = `${type}-zone`;
                zoneSelect.required = true;
                formGroup.appendChild(label);
                formGroup.appendChild(zoneSelect);
                // Insert after city
                const cityGroup = document.getElementById(`${type}-city`).parentNode;
                cityGroup.parentNode.insertBefore(formGroup, cityGroup.nextSibling);
            }
            zoneSelect.innerHTML = '<option value="">-- Selecciona Zona --</option>';
            zones.forEach(zone => {
                const option = document.createElement('option');
                option.value = zone;
                option.textContent = zone;
                zoneSelect.appendChild(option);
            });
        }
    }

    switchAuthTab(tab, targetButton = null) {
        const activeButton = targetButton || document.querySelector(`.tab-btn[data-tab="${tab}"]`);
        document.querySelectorAll('.tab-btn').forEach(btn => btn.classList.remove('active'));
        document.querySelectorAll('.auth-form').forEach(form => form.classList.remove('active'));
        
        if (activeButton) {
            activeButton.classList.add('active');
        }
        document.getElementById(`${tab}-form`).classList.add('active');
    }

    handleLogin(e) {
        e.preventDefault();
        const email = document.getElementById('login-email').value;
        const password = document.getElementById('login-password').value;

        const user = this.users.find(u => u.email === email && u.password === password);
        
        if (user) {
            this.currentUser = user;
            localStorage.setItem('currentUser', JSON.stringify(user));
            this.updateUI();
            alert('Sesion iniciada exitosamente');
        } else {
            alert('Email o contrasena incorrectos');
        }

        e.target.reset();
    }

    handleRegister(e) {
        e.preventDefault();
        const name = document.getElementById('register-name').value;
        const email = document.getElementById('register-email').value;
        const password = document.getElementById('register-password').value;
        const userType = document.getElementById('user-type').value;

        if (this.users.find(u => u.email === email)) {
            alert('Este email ya esta registrado');
            return;
        }

        const newUser = {
            id: Date.now(),
            name,
            email,
            password,
            userType,
            buyerData: null,
            agencyData: null
        };

        this.users.push(newUser);
        localStorage.setItem('users', JSON.stringify(this.users));
        
        this.currentUser = newUser;
        localStorage.setItem('currentUser', JSON.stringify(newUser));
        
        this.updateUI();
        alert('Registro exitoso');
        
        e.target.reset();
    }

    handleBuyerSubmit(e) {
        e.preventDefault();
        
        const buyerData = {
            phone: document.getElementById('buyer-phone').value,
            city: document.getElementById('buyer-city').value,
            address: document.getElementById('buyer-address').value,
            zone: document.getElementById('buyer-zone')?.value || ''
        };

        this.currentUser.buyerData = buyerData;
        
        const userIndex = this.users.findIndex(u => u.id === this.currentUser.id);
        this.users[userIndex] = this.currentUser;
        
        localStorage.setItem('users', JSON.stringify(this.users));
        localStorage.setItem('currentUser', JSON.stringify(this.currentUser));
        
        alert('Informacion del ejecutivo guardada');
        this.showBuyerProfile();
    }

    handleAgencySubmit(e) {
        e.preventDefault();
        
        const agencyData = {
            agencyName: document.getElementById('agency-name').value,
            phone: document.getElementById('agency-phone').value,
            address: document.getElementById('agency-address').value,
            city: document.getElementById('agency-city').value,
            zone: document.getElementById('agency-zone')?.value || ''
        };

        this.currentUser.agencyData = agencyData;
        
        const userIndex = this.users.findIndex(u => u.id === this.currentUser.id);
        this.users[userIndex] = this.currentUser;
        
        localStorage.setItem('users', JSON.stringify(this.users));
        localStorage.setItem('currentUser', JSON.stringify(this.currentUser));
        
        alert('Informacion de la agencia guardada');
        this.showAgencyProfile();
    }

    showBuyerForm() {
        document.querySelectorAll('.page-content').forEach(el => el.classList.remove('active'));
        document.getElementById('buyer-form-page').classList.add('active');
        
        if (this.currentUser?.buyerData) {
            const data = this.currentUser.buyerData;
            document.getElementById('buyer-phone').value = data.phone;
            document.getElementById('buyer-city').value = data.city;
            document.getElementById('buyer-address').value = data.address || '';
            if (data.zone) {
                this.showZones(data.city.toLowerCase(), 'buyer');
                document.getElementById('buyer-zone').value = data.zone;
            }
        }
    }

    showBuyerProfile() {
        document.querySelectorAll('.page-content').forEach(el => el.classList.remove('active'));
        document.getElementById('buyer-profile-page').classList.add('active');
        this.displayBuyerInfo();
    }

    displayBuyerInfo() {
        const display = document.getElementById('buyer-info-display');
        
        if (!this.currentUser.buyerData) {
            display.innerHTML = '<p style="color: #999;">No hay informacion registrada. Haz clic en "Editar Informacion" para completar tus datos.</p>';
            return;
        }

        const data = this.currentUser.buyerData;
        display.innerHTML = `
            <div class="info-item">
                <strong>Nombre:</strong>
                <span>${this.currentUser.name}</span>
            </div>
            <div class="info-item">
                <strong>Email:</strong>
                <span>${this.currentUser.email}</span>
            </div>
            <div class="info-item">
                <strong>Telefono:</strong>
                <span>${data.phone}</span>
            </div>
            <div class="info-item">
                <strong>Ciudad:</strong>
                <span>${data.city}</span>
            </div>
            <div class="info-item">
                <strong>Dirección:</strong>
                <span>${data.address || 'No especificada'}</span>
            </div>
            <div class="info-item">
                <strong>Zona:</strong>
                <span>${data.zone || 'No especificada'}</span>
            </div>
        `;
    }

    showAgencyForm() {
        document.querySelectorAll('.page-content').forEach(el => el.classList.remove('active'));
        document.getElementById('agency-form-page').classList.add('active');
        
        if (this.currentUser?.agencyData) {
            const data = this.currentUser.agencyData;
            document.getElementById('agency-name').value = data.agencyName;
            document.getElementById('agency-phone').value = data.phone;
            document.getElementById('agency-address').value = data.address;
            document.getElementById('agency-city').value = data.city;
            if (data.zone) {
                this.showZones(data.city.toLowerCase(), 'agency');
                document.getElementById('agency-zone').value = data.zone;
            }
        }
    }

    showAgencyProfile() {
        document.querySelectorAll('.page-content').forEach(el => el.classList.remove('active'));
        document.getElementById('agency-profile-page').classList.add('active');
        this.displayAgencyInfo();
    }

    displayAgencyInfo() {
        const display = document.getElementById('agency-info-display');
        
        if (!this.currentUser.agencyData) {
            display.innerHTML = '<p style="color: #999;">No hay informacion registrada. Haz clic en "Editar Informacion" para completar los datos de tu agencia.</p>';
            return;
        }

        const data = this.currentUser.agencyData;
        display.innerHTML = `
            <div class="info-item">
                <strong>Nombre de la Agencia:</strong>
                <span>${data.agencyName}</span>
            </div>
            <div class="info-item">
                <strong>Email de Contacto:</strong>
                <span>${this.currentUser.email}</span>
            </div>
            <div class="info-item">
                <strong>Telefono:</strong>
                <span>${data.phone}</span>
            </div>
            <div class="info-item">
                <strong>Direccion:</strong>
                <span>${data.address}</span>
            </div>
            <div class="info-item">
                <strong>Ciudad:</strong>
                <span>${data.city}</span>
            </div>
            <div class="info-item">
                <strong>Zona:</strong>
                <span>${data.zone || 'No especificada'}</span>
            </div>
        `;
    }

    logout() {
        this.currentUser = null;
        localStorage.removeItem('currentUser');
        this.updateUI();
        alert('Sesion cerrada');
    }

    updateUI() {
        const authSection = document.getElementById('auth-section');
        const dashboardSection = document.getElementById('dashboard-section');
        const publicConsultationsSection = document.getElementById('public-consultations-section');
        
        if (this.currentUser) {
            authSection.classList.remove('active');
            dashboardSection.classList.add('active');
            publicConsultationsSection.classList.add('active');
            document.querySelectorAll('.page-content').forEach(el => el.classList.remove('active'));

            if (this.currentUser.userType === 'buyer') {
                this.showBuyerProfile();
            } else {
                this.showAgencyProfile();
            }
            this.displayPublicConsultations();
        } else {
            dashboardSection.classList.remove('active');
            publicConsultationsSection.classList.remove('active');
            authSection.classList.add('active');
            document.getElementById('login-form').classList.add('active');
            document.getElementById('register-form').classList.remove('active');
        }
    }

    showConsultations() {
        document.querySelectorAll('.page-content').forEach(el => el.classList.remove('active'));
        document.getElementById('consultations-page').classList.add('active');
        this.displayConsultations();
    }

    showConsultationForm() {
        document.querySelectorAll('.page-content').forEach(el => el.classList.remove('active'));
        document.getElementById('consultation-form-page').classList.add('active');
    }

    handleConsultationSubmit(e) {
        e.preventDefault();
        
        const consultation = {
            id: Date.now(),
            userId: this.currentUser.id,
            vehicleType: document.getElementById('consultation-vehicle-type').value,
            brand: document.getElementById('consultation-brand').value,
            year: document.getElementById('consultation-year').value,
            date: document.getElementById('consultation-date').value,
            status: 'pending'
        };

        this.consultations.push(consultation);
        localStorage.setItem('consultations', JSON.stringify(this.consultations));
        
        alert('Consulta creada exitosamente');
        this.showConsultations();
        this.displayPublicConsultations();
        e.target.reset();
    }

    displayConsultations() {
        const container = document.getElementById('consultations-container');
        container.innerHTML = '';

        const userConsultations = this.consultations.filter(c => c.userId === this.currentUser.id);

        if (userConsultations.length === 0) {
            container.innerHTML = '<p>No tienes consultas. Crea una nueva consulta.</p>';
            return;
        }

        userConsultations.forEach(consultation => {
            const card = document.createElement('div');
            card.className = 'consultation-card';
            card.innerHTML = `
                <h3>${consultation.vehicleType} ${consultation.brand} ${consultation.year}</h3>
                <p><strong>Fecha:</strong> ${consultation.date}</p>
                <p class="consultation-status"><strong>Estado:</strong> ${this.getStatusText(consultation.status)}</p>
                <div class="consultation-actions">
                    <button class="btn-secondary" onclick="app.editConsultation(${consultation.id})">Editar</button>
                    <button class="btn-secondary" onclick="app.deleteConsultation(${consultation.id})">Eliminar</button>
                </div>
            `;
            container.appendChild(card);
        });
    }

    displayPublicConsultations() {
        const container = document.getElementById('public-consultations-container');
        container.innerHTML = '';

        if (this.consultations.length === 0) {
            container.innerHTML = '<p>No hay consultas disponibles.</p>';
            return;
        }

        this.consultations.forEach(consultation => {
            const card = document.createElement('div');
            card.className = 'consultation-card';
            const user = this.users.find(u => u.id === consultation.userId);
            const canEdit = this.currentUser && consultation.userId === this.currentUser.id;
            const canMark = this.currentUser && this.currentUser.userType === 'agency';
            card.innerHTML = `
                <h3>${consultation.vehicleType} ${consultation.brand} ${consultation.year}</h3>
                <p><strong>Usuario:</strong> ${user ? user.name : 'Anónimo'}</p>
                <p><strong>Fecha:</strong> ${consultation.date}</p>
                <p class="consultation-status"><strong>Estado:</strong> ${this.getStatusText(consultation.status)}</p>
                ${canEdit ? `<button class="btn-secondary" onclick="app.editConsultation(${consultation.id})">Editar</button>` : ''}
                ${canMark ? `<div class="status-actions">
                    <button class="btn-primary" onclick="app.markConsultation(${consultation.id}, 'attended')">Asistió</button>
                    <button class="btn-secondary" onclick="app.markConsultation(${consultation.id}, 'not_attended')">No Asistió</button>
                    <button class="btn-danger" onclick="app.deleteConsultation(${consultation.id})">Eliminar</button>
                </div>` : ''}
            `;
            container.appendChild(card);
        });
    }

    getStatusText(status) {
        switch (status) {
            case 'pending': return 'Pendiente';
            case 'attended': return 'Asistió';
            case 'not_attended': return 'No Asistió';
            default: return 'Desconocido';
        }
    }

    editConsultation(id) {
        // For simplicity, not implementing edit, just alert
        alert('Función de editar no implementada aún');
    }

    deleteConsultation(id) {
        if (confirm('¿Estás seguro de eliminar esta consulta?')) {
            this.consultations = this.consultations.filter(c => c.id !== id);
            localStorage.setItem('consultations', JSON.stringify(this.consultations));
            this.displayConsultations();
            this.displayPublicConsultations();
        }
    }

    markConsultation(id, status) {
        const consultation = this.consultations.find(c => c.id === id);
        if (consultation) {
            consultation.status = status;
            localStorage.setItem('consultations', JSON.stringify(this.consultations));
            this.displayPublicConsultations();
        }
    }
}

document.addEventListener('DOMContentLoaded', () => {
    window.app = new AppManager();
});
