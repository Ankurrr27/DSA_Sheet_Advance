# DSA Track

DSA Track is a focused practice dashboard for a structured data-structures and algorithms curriculum. Track solved questions, personal difficulty, notes, revision items, colour-coded priorities, videos, and overall progress from one compact workspace.

## Local setup

Requirements: Node.js 20+, PostgreSQL, and a configured `DATABASE_URL`.

```bash
npm install
npm run db:generate
npm run db:push
npm run db:seed
npm run dev
```

Open [http://localhost:3000](http://localhost:3000).

Create a `.env` file with the database connection used by Prisma:

```env
DATABASE_URL="postgresql://USER:PASSWORD@HOST/DATABASE?sslmode=require"
```

## Useful commands

```bash
npm run dev       # start the development server
npm run build     # create a production build
npm run start     # serve the production build
npm run lint      # run ESLint
npm run db:seed   # load the curriculum data
```

The generated Prisma client is kept in `generated/prisma` because the application imports that local generated output. Regenerate it after changing the schema with `npm run db:generate`.
