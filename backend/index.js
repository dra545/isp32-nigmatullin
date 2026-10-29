
require('dotenv').config();

const express = require('express');
const cors = require('cors');
const bcrypt = require('bcrypt');
const jwt = require('jsonwebtoken');
const { Pool } = require('pg');

const app = express();

app.use(cors());
app.use(express.json());

const pool = new Pool({
    host: process.env.DB_HOST,
    port: Number(process.env.DB_PORT || 5432),
    database: process.env.DB_NAME,
    user: process.env.DB_USER,
    password: process.env.DB_PASSWORD
});

const JWT_SECRET = process.env.JWT_SECRET;

// Проверка сервера
app.get('/', (req, res) => {
    res.json({ message: 'Backend работает!' });
});

// Регистрация
app.post('/api/register', async (req, res) => {
    try {
        const { login, password } = req.body;

        if (!login || !password) {
            return res.status(400).json({
                message: 'Введите логин и пароль'
            });
        }

        if (password.length < 8) {
            return res.status(400).json({
                message: 'Пароль должен содержать минимум 8 символов'
            });
        }

        const existing = await pool.query(
            'SELECT id FROM users WHERE login = $1',
            [login.trim()]
        );

        if (existing.rows.length > 0) {
            return res.status(409).json({
                message: 'Такой логин уже существует'
            });
        }

        const passwordHash = await bcrypt.hash(password, 12);

        // Обычный пользователь получает роль 2
        const result = await pool.query(
            `INSERT INTO users (login, password_hash, role_id)
             VALUES ($1, $2, 2)
             RETURNING id, login, role_id`,
            [login.trim(), passwordHash]
        );

        res.status(201).json({
            message: 'Регистрация успешна',
            user: result.rows[0]
        });
    } catch (error) {
        console.error(error.message);
        res.status(500).json({ message: 'Ошибка сервера' });
    }
});

// Вход
app.post('/api/login', async (req, res) => {
    try {
        const { login, password } = req.body;

        if (!login || !password) {
            return res.status(400).json({
                message: 'Введите логин и пароль'
            });
        }

        const result = await pool.query(
            `SELECT u.id, u.login, u.password_hash,
                    u.role_id, r.name AS role_name
             FROM users u
             LEFT JOIN roles r ON u.role_id = r.id
             WHERE u.login = $1`,
            [login.trim()]
        );

        if (result.rows.length === 0) {
            return res.status(401).json({
                message: 'Неверный логин или пароль'
            });
        }

        const user = result.rows[0];

        const validPassword = await bcrypt.compare(
            password,
            user.password_hash
        );

        if (!validPassword) {
            return res.status(401).json({
                message: 'Неверный логин или пароль'
            });
        }

        const token = jwt.sign(
            { id: user.id },
            JWT_SECRET,
            { expiresIn: '2h' }
        );

        res.json({
            message: 'Вход выполнен',
            token,
            user: {
                id: user.id,
                login: user.login,
                role_id: user.role_id,
                role: user.role_name
            }
        });
    } catch (error) {
        console.error(error.message);
        res.status(500).json({ message: 'Ошибка сервера' });
    }
});

// Проверка авторизации
async function auth(req, res, next) {
    try {
        const header = req.headers.authorization;

        if (!header || !header.startsWith('Bearer ')) {
            return res.status(401).json({
                message: 'Необходимо войти в аккаунт'
            });
        }

        const token = header.slice(7);
        const decoded = jwt.verify(token, JWT_SECRET);

        const result = await pool.query(
            `SELECT u.id, u.login, u.role_id, r.name AS role_name
             FROM users u
             LEFT JOIN roles r ON u.role_id = r.id
             WHERE u.id = $1`,
            [decoded.id]
        );

        if (result.rows.length === 0) {
            return res.status(401).json({
                message: 'Пользователь не найден'
            });
        }

        req.user = result.rows[0];
        next();
    } catch (error) {
        return res.status(401).json({
            message: 'Токен недействителен или истёк'
        });
    }
}

// Личный кабинет
app.get('/api/profile', auth, (req, res) => {
    res.json({ user: req.user });
});

// Проверка базы и запуск сервера
async function start() {
    await pool.query('SELECT 1');

    if (!JWT_SECRET ||
        JWT_SECRET === 'change_this_to_a_long_random_secret') {
        throw new Error('Настрой JWT_SECRET в .env');
    }

    const port = process.env.PORT || 3000;

    app.listen(port, () => {
        console.log(`Сервер запущен: http://localhost:${port}`);
    });
}

start().catch(error => {
    console.error('Ошибка запуска:', error.message);
    process.exit(1);
});
