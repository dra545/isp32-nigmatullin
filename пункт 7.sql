 FighterHub
 Пункт 7. SQL-запросы для работы с базой данных
 PostgreSQL
 Проверьте имена столбцов и таблиц перед выполнением запросов.

Просмотр всех бойцов
SELECT *
FROM fighters;

Поиск бойца по имени или фамилии
SELECT *
FROM fighters
WHERE full_name ILIKE '%Александр%';

 Фильтрация бойцов по виду спорта
SELECT f.*
FROM fighters AS f
JOIN sports AS s ON s.id = f.sports_id
WHERE s.name = 'Бокс';

 Сортировка бойцов по росту
SELECT *
FROM fighters
ORDER BY height ASC;

Добавление нового пользователя
role_id = 1 должен существовать в таблице roles.
 Значение password_hash ниже является заглушкой, а не безопасным хешем.
INSERT INTO users (login, password_hash, role_id)
VALUES ('new_fighter_demo', 'demo_hash_replace_before_use', 1);

Изменение роста бойца по ID
UPDATE fighters
SET height = 180
WHERE id = 1;

 Удаление бойца по ID
Проверьте связанные записи перед удалением.
DELETE FROM fighters
WHERE id = 1;

Просмотр тренировок конкретного бойца
SELECT
    w.*,
    wt.name AS workout_type_name
FROM workouts AS w
LEFT JOIN workout_types AS wt ON wt.id = w.workout_type_id
WHERE w.fighter_id = 1
ORDER BY w.workout_date DESC;

Подсчёт побед в спаррингах по бойцам
SELECT
    fighter_id,
    COUNT(*) AS wins
FROM sparrings
WHERE result = 'Победа'
GROUP BY fighter_id
ORDER BY wins DESC;

 Просмотр пользователей с ролью «manager»
SELECT
    u.id,
    u.login,
    r.name AS role_name
FROM users AS u
JOIN roles AS r ON r.id = u.role_id
WHERE r.name = 'manager';

 Проверка количества записей
SELECT COUNT(*) AS fighters_count FROM fighters;
SELECT COUNT(*) AS workouts_count FROM workouts;
SELECT COUNT(*) AS sparrings_count FROM sparrings;
