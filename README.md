# EliteKicks

Full-stack e-commerce boilerplate for the Pakistani sneaker market.

## Stack
- Frontend: Next.js 14 (App Router) + Tailwind + Redux Toolkit + RTK Query
- Backend: Node.js + Express + MongoDB (Mongoose)
- Auth: JWT + bcrypt
- Media: Cloudinary

## Quick Start
1. Install dependencies
   - `npm install`
2. Copy environment variables
   - Create `.env` at repo root using `.env.example`
3. Start MongoDB
   - Local MongoDB service, or Docker:
   - `docker run -d --name elitekicks-mongo -p 27017:27017 mongo:7`
4. Seed sample data
   - `npm run seed`
5. Run both apps
   - `npm run dev`
   - If MongoDB is not installed locally: `npm run dev:memory`

Frontend: `http://localhost:3000`
Backend API: `http://localhost:5000/api`

## Seeded Demo Accounts
- Admin: `admin@elitekicks.pk` / `Admin@123456`
- Customer: `customer@elitekicks.pk` / `Customer@123`

## Useful Scripts
- `npm run dev` - start frontend + backend
- `npm run dev:memory` - start frontend + backend with in-memory Mongo + auto-seed
- `npm run smoke:memory` - run API smoke checks on in-memory Mongo and exit
- `npm run build` - build frontend
- `npm run seed` - clear and import sample categories/products/users/order
- `npm run seed:clear` - clear categories/products/users/orders

## Notes
- Admin routes require a JWT from an admin user.
- Product image upload endpoints expect `multipart/form-data` with field `images`.
- WhatsApp order links are generated server-side and in PDP CTA.
