# 📘 Goals Achiever

> *Веб-застосунок для постановки та досягнення цілей з AI-генерацією планів, системою гейміфікації та інтерактивною дорожньою картою прогресу.*

---

## 👤 Автор

- **ПІБ**: Станішевська Софія
- **Група**: ФЕІ-42
- **Керівник**: Кулик Петро, асистент
- **Дата виконання**: 27.05.2026

---

## 📌 Загальна інформація

- **Тип проєкту**: Вебсайт (Full-Stack SPA)
- **Мова програмування**: TypeScript
- **Фреймворки / Бібліотеки**:
  - **Backend**: Node.js, Express 5, Prisma ORM, PostgreSQL, JWT, bcryptjs
  - **Frontend**: React 19, React Router v7, Three.js / React Three Fiber, Vite, SCSS
  - **AI**: Google Gemini API (`@google/genai`)

---

## 🧠 Опис функціоналу

- 🔐 Реєстрація та авторизація користувачів (JWT access + refresh токени)
- 🎯 Створення цілей з дедлайном та AI-генерованим планом задач
- 🤖 Автоматична генерація денних завдань через Gemini
- 🗺️ Інтерактивна 3D дорожня карта (roadmap) прогресу по цілі
- ✅ Відстеження та оновлення статусу завдань
- 🔥 Система серій активності (streaks) — мотивація щоденної роботи
- 💰 Віртуальна валюта (coins) та XP за виконання завдань
- 🏆 Рівні та досягнення (gamification)
- 📊 Аналітика активності користувача

---

## 🧱 Опис основних класів / файлів

| Файл | Призначення |
|------|-------------|
| `backend/src/server.ts` | Точка входу backend-сервера |
| `backend/src/app.ts` | Налаштування Express, CORS, підключення роутерів |
| `backend/src/modules/auth/auth.routes.ts` | Маршрути авторизації (реєстрація, логін, refresh) |
| `backend/src/modules/goal/goal.routes.ts` | REST API для цілей користувача |
| `backend/src/modules/task/task.routes.ts` | REST API для завдань у межах цілі |
| `backend/src/modules/ai/ai.routes.ts` | AI-ендпоінти: генерація плану та денних завдань |
| `backend/src/modules/user/user.routes.ts` | API профілю користувача |
| `backend/src/services/streak.ts` | Логіка підрахунку серій активності |
| `backend/prisma/seed.ts` | Початкове заповнення бази даних |
| `frontend/src/main.tsx` | Точка входу React-застосунку |
| `frontend/src/pages/WelcomePage` | Вітальна сторінка з 3D-сценою |
| `frontend/src/pages/NewGoalPage` | Форма створення нової цілі з AI-планом |
| `frontend/src/pages/RoadMapPage` | 3D дорожня карта прогресу по цілі |
| `frontend/src/pages/ProfilePage` | Профіль з гейміфікацією та статистикою |
| `frontend/src/pages/AnalyticsPage` | Аналітика прогресу користувача |
| `frontend/src/features/goals` | Стан та логіка цілей (feature-слайс) |
| `frontend/src/features/tasks` | Стан та логіка завдань |
| `frontend/src/features/auth` | Авторизація на frontend |

---

## ▶️ Як запустити проєкт "з нуля"

### 1. Встановлення інструментів

- Node.js v22+ + npm v11+
- PostgreSQL (локально або хмарний сервіс, наприклад Supabase / Neon)

### 2. Клонування репозиторію

```bash
git clone https://github.com/Sofiia13/goals_achiever.git
cd goals_achiever
```

### 3. Встановлення залежностей

```bash
# Backend
cd backend
npm install

# Frontend
cd ../frontend
npm install
```

### 4. Створення `.env` файлів

#### Для `backend/.env`:

```
PORT=3000
DATABASE_URL=postgresql://user:password@localhost:5432/goals_achiever
JWT_SECRET=your_jwt_secret
JWT_REFRESH_SECRET=your_refresh_secret
GEMINI_API_KEY=your_google_gemini_api_key
FRONTEND_URL=http://localhost:5173
```

#### Для `frontend/.env`:

```
VITE_API_URL=http://localhost:3000
```

### 5. Міграція та заповнення бази даних

```bash
cd backend
npx prisma migrate dev
npm run seed
```

### 6. Запуск

```bash
# Backend (термінал 1)
cd backend
npm run dev

# Frontend (термінал 2)
cd frontend
npm run dev
```

Застосунок буде доступний за адресою `http://localhost:5173`.

---

## 🔌 API приклади

### 🔐 Авторизація

**POST /auth/register**

```json
{
  "name": "Sophia",
  "email": "user@example.com",
  "password": "securepassword"
}
```

**Response:**

```json
{
  "accessToken": "eyJhbGc...",
  "refreshToken": "eyJhbGc..."
}
```

---

**POST /auth/login**

```json
{
  "email": "user@example.com",
  "password": "securepassword"
}
```

**Response:**

```json
{
  "accessToken": "eyJhbGc...",
  "refreshToken": "eyJhbGc..."
}
```

---

### 🎯 Цілі

**GET /goals** — Отримати всі цілі поточного користувача (потребує JWT)

**POST /goals**

```json
{
  "title": "Вивчити TypeScript",
  "description": "Опанувати TypeScript за 3 місяці",
  "deadline": "2026-08-01T00:00:00.000Z"
}
```

**DELETE /goals/:id** — Видалити ціль

---

### 📋 Завдання

**GET /tasks/goals/:goalId/** — Отримати завдання цілі

**POST /tasks/goals/:goalId/** — Створити завдання

```json
{
  "title": "Прочитати розділ про типи",
  "station": "Основи"
}
```

**PATCH /tasks/:taskId/status**

```json
{
  "status": "DONE"
}
```

---

### 🤖 AI

**POST /api/ai/plan** — Згенерувати план задач для цілі

```json
{
  "goalId": 1,
  "goalTitle": "Вивчити TypeScript",
  "deadline": "2026-08-01T00:00:00.000Z"
}
```

**POST /api/ai/daily-tasks** — Згенерувати денні завдання

```json
{
  "goalId": 1
}
```

---

## 🖱️ Інструкція для користувача

1. **Вітальна сторінка** — 3D-анімована заставка з кнопками:
   - `Увійти` — авторизація існуючого користувача
   - `Зареєструватись` — створення нового акаунту

2. **Після входу**:
   - Кнопка `Нова ціль` — відкриває форму, де AI автоматично генерує план завдань за назвою та дедлайном
   - `Дорожня карта` — 3D-візуалізація прогресу по станціях цілі
   - `Денні завдання` — AI пропонує завдання на сьогодні

3. **Виконання завдань**:
   - Позначення завдання як виконаного нараховує XP та монети
   - Щоденна активність збільшує streak 🔥

4. **Профіль**:
   - Відображає рівень, монети, поточний та найдовший streak
   - Фото профілю, статистика активності

5. **Аналітика** — графіки прогресу, активності та виконаних завдань

---

## 📷 Приклади / скриншоти

- Головна (вітальна) сторінка
- Форма створення цілі з AI-планом
- 3D дорожня карта прогресу
- Профіль з гейміфікацією
- Сторінка аналітики

*(додайте зображення у папку `/screenshots/`)*

---

## 🧪 Проблеми і рішення

| Проблема | Рішення |
|----------|---------|
| CORS помилка при запиті з frontend | Перевірити `FRONTEND_URL` у `.env` backend, увімкнути origins у `app.ts` |
| Prisma: не знаходить таблиці | Виконати `npx prisma migrate dev` перед запуском |
| AI не генерує план | Перевірити валідність `GEMINI_API_KEY` або `MISTRAL_API_KEY` |
| 401 Unauthorized | Перевірити наявність та актуальність JWT токена; при необхідності виконати `/auth/refresh` |
| 3D сцена не відображається | Оновити відеодрайвери або використати браузер з підтримкою WebGL |

---

## 🧾 Використані джерела / література

- [React документація](https://react.dev/)
- [Vite документація](https://vitejs.dev/)
- [Three.js документація](https://threejs.org/docs/)
- [React Three Fiber](https://docs.pmnd.rs/react-three-fiber/)
- [Express.js документація](https://expressjs.com/)
- [Prisma ORM документація](https://www.prisma.io/docs)
- [Google Gemini API](https://ai.google.dev/)
- [JWT.io](https://jwt.io/)
- [PostgreSQL документація](https://www.postgresql.org/docs/)

---

## 📷 Screenshots

