
const API_URL = 'http://localhost:3000';

let authMode = 'login';

function openAuth(mode) {
    authMode = mode;

    document.getElementById('authModal').style.display = 'flex';

    document.getElementById('authTitle').textContent =
        mode === 'login' ? 'Вход в аккаунт' : 'Регистрация';

    document.getElementById('authMessage').textContent = '';

    document.getElementById('switchAuth').innerHTML =
        mode === 'login'
        ? 'Нет аккаунта? <a href="#" onclick="openAuth(\'register\')">Зарегистрироваться</a>'
        : 'Есть аккаунт? <a href="#" onclick="openAuth(\'login\')">Войти</a>';
}

function closeAuth() {
    document.getElementById('authModal').style.display = 'none';
}

document.getElementById('authForm').addEventListener('submit', async function(event) {
    event.preventDefault();

    const login = document.getElementById('login').value.trim();
    const password = document.getElementById('password').value;

    const message = document.getElementById('authMessage');

    const endpoint = authMode === 'login'
        ? '/api/login'
        : '/api/register';

    try {
        const response = await fetch(API_URL + endpoint, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json'
            },
            body: JSON.stringify({ login, password })
        });

        const data = await response.json();

        if (!response.ok) {
            message.textContent = data.message || 'Произошла ошибка';
            message.style.color = '#ff5555';
            return;
        }

        if (authMode === 'register') {
            message.textContent = 'Регистрация успешна! Теперь войди в аккаунт.';
            message.style.color = '#55dd77';

            document.getElementById('password').value = '';
            return;
        }

        localStorage.setItem('token', data.token);
        localStorage.setItem('user', JSON.stringify(data.user));

        message.style.color = '#55dd77';
        message.textContent = 'Вход выполнен!';

        setTimeout(() => {
            window.location.href = 'profile.html';
        }, 700);

    } catch (error) {
        message.textContent = 'Не удалось связаться с сервером';
        message.style.color = '#ff5555';
    }
});
