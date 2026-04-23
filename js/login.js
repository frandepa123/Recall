const loginForm = document.getElementById('login-page-form');

function showMessage(message) {
    alert(message);
}

function getSessionUser() {
    const stored = localStorage.getItem('recall-insiders-session');
    return stored ? JSON.parse(stored) : null;
}

function setSessionUser(user) {
    localStorage.setItem('recall-insiders-session', JSON.stringify(user));
}

const existingUser = getSessionUser();
if (existingUser) {
    window.location.href = 'agenda.html';
}

loginForm.addEventListener('submit', event => {
    event.preventDefault();

    const email = document.getElementById('login-page-email').value.trim();
    const password = document.getElementById('login-page-password').value.trim();

    if (!email || !password) {
        showMessage('Completá email y contraseña para ingresar.');
        return;
    }

    // Validar contra usuarios registrados
    const users = JSON.parse(localStorage.getItem('users')) || [];
    const user = users.find(u => u.email === email);

    if (!user || user.password !== password) {
        showMessage('Email o contraseña incorrectos. Verificá tus datos.');
        return;
    }

    localStorage.setItem('currentUser', JSON.stringify(user));
    setSessionUser({ email: user.email, userType: user.userType, name: user.name });
    showMessage(`Bienvenido ${user.name}. Ahora podés ir a la agenda.`);
    window.location.href = 'agenda.html';
});