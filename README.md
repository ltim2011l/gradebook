# Электронный журнал

## Запуск

```bash
cd server
npm install
npx prisma db push
npx tsx prisma/seed.ts
npx tsx src/index.ts