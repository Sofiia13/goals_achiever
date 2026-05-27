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

1. **Сторінка реєстрації/логіну** — форма з кнопками:
   - `Увійти` — авторизація існуючого користувача
   - `Зареєструватись` — створення нового акаунту

2. **Після входу**:
   - Кнопка `New Goal` — відкриває форму, де AI автоматично генерує план завдань за назвою та дедлайном
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
<img width="1280" height="823" alt="image" src="https://github.com/user-attachments/assets/d7ee5097-cda3-40bf-bb95-7e6eb07a9b0f" />
<img width="1280" height="820" alt="image" src="https://github.com/user-attachments/assets/ef7d88df-b3f7-41b7-aca7-c3c38e22fc62" />
<img width="1280" height="855" alt="image" src="https://github.com/user-attachments/assets/2cc657ba-8c73-457f-96bb-0d7bdef9d855" />
<img width="1280" height="849" alt="image" src="https://github.com/user-attachments/assets/38f8058b-e254-4b72-bef1-d9d26d4b0844" />
<img width="1280" height="851" alt="image" src="https://github.com/user-attachments/assets/7972b990-ce08-4db4-87b4-a77c05de511a" />
<img width="1280" height="854" alt="image" src="https://github.com/user-attachments/assets/8494e017-7813-4a88-bde4-c285b94dc6c7" />
<img width="1280" height="851" alt="image" src="https://github.com/user-attachments/assets/7fccd47c-305e-4ce0-a0ce-2d38ef31bf65" />
<img width="1280" height="859" alt="image" src="https://github.com/user-attachments/assets/bed7b573-9cb5-4204-ae57-8cd0dd648970" />
<img width="1280" height="854" alt="image" src="https://github.com/user-attachments/assets/2f15ac2f-fcd0-462d-bc4f-45c12e952086" />
<img width="1280" height="855" alt="image" src="https://github.com/user-attachments/assets/8e087342-f200-4015-89d4-70639bd825da" />
<img width="1280" height="849" alt="image" src="https://github.com/user-attachments/assets/92ee12d2-66fa-4e6d-ad75-0d534a0da1bd" />
<img width="1280" height="851" alt="image" src="https://github.com/user-attachments/assets/2be8a0ef-050c-443d-89cc-2bf1c3c0eb10" />
