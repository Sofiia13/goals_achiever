## Installation

1. **Clone the repository and navigate to backend:**

```bash
cd backend
```

2. **Install dependencies:**

```bash
npm install
```

3. **Create environment file:**

```bash
cp .env.example .env
```

4. **Edit `.env` and configure your environment variables:**

See [Environment Variables](#environment-variables) section for full configuration details.

## Database Setup

### Initial Setup

1. **Create a PostgreSQL database:**

```bash
createdb strathub_db
```

2. **Run Prisma migrations:**

```bash
npm run prisma:migrate:create -- init
```

This will:

- Create the database schema
- Generate Prisma Client
- Apply all migrations
