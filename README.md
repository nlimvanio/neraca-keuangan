# Inventory Management Base

A simple Next.js inventory management base project.

## Features

- Dashboard summary cards
- Product inventory table
- Working product search
- Working Add Product modal
- Add products with name, SKU, category, stock, and reorder level
- New products immediately update the table and dashboard totals
- Low-stock status is calculated automatically
- Category summary updates automatically
- Mock data only; no database or authentication

## Getting started

```bash
npm install
npm run dev
```

Open http://localhost:3000.

## Note

Products are stored in React state, so changes are only kept while the browser page is open. Refreshing the page restores the original mock data.
