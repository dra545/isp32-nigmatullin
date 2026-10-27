const express = require('express');
const pool = require('./db');

const app = express();
const PORT = 3000;

app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.use(express.static('public'));

app.get('/api', async (req, res) => {
    try {
        const result = await pool.query(
            'SELECT * FROM roles'
        );

        res.json({
            message: 'Подключение к базе успешно',
            database: result.rows[0].database,
            serverTime: result.rows[0].server_time
        });
    } catch (error) {
        console.error(error.message);
        res.status(500).json({
            message: 'Не удалось подключиться к базе данных'
        });
    }
});

app.listen(PORT, () => {
    console.log(`Сервер запущен: http://localhost:${PORT}`);
});