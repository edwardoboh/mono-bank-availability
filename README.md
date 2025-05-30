# Bank Availability Service (BAS)

**Stack**

- Node.js (NestJS)
- PostgreSQL
- Prisma ORM
- Scheduled jobs via `@nestjs/schedule`
- Config via `@nestjs/config`
- Tests with Jest

## Setup

1. Clone repo and install deps:

   ```bash
   npm install
   ```

2. Copy `.env.example` to `.env` and adjust values.

3. Generate Prisma client & migrate DB:

   ```bash
   npm run migrate
   ```

4. Seed (loads `transactions.json` demo data):

   ```bash
   npm run seed
   ```

5. Start dev server:

   ```bash
   npm run start:dev
   ```

## API Examples

```bash
curl -H "x-api-key: $API_KEY" http://localhost:3000/banks/availability?window=6h
curl -H "x-api-key: $API_KEY" http://localhost:3000/banks/NIP001/availability
```

## Design Notes

- **Stateless**: Each instance reads config and jobs run independently.
- **Scalability**: Horizontal scaling via containerisation & load balancer.
- **Caching (Bonus)**: Add Redis cache layer in `availability.service.ts`.
- **Real‑time**: Replace polling job with Kafka consumer (see comments in scheduler for guidance).

## Testing

```bash
npm test
```
