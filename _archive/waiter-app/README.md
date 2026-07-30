# 📦 Archived: Waiter Mobile App

These files were part of the **Waiter Mobile Terminal** feature — a Zomato-inspired PWA for restaurant waitstaff.

The waiter app was removed from the main application routes because RestaurantOS currently focuses on the **POS & Admin Dashboard** functionality.

## What's Here

- `pages/waiter/` — Waiter app pages (Login, Home, Order, MyOrders, Alerts, Profile)
- `layouts/WaiterLayout.tsx` — Bottom-tab mobile navigation layout
- `components/auth/WaiterProtectedRoute.tsx` — Auth guard for waiter routes
- `pages/Delivery.tsx` — Delivery module stub (placeholder)

## Re-enabling

To restore the waiter app, move these files back to their original locations under `restaurant-hub-main/src/` and re-add the waiter routes in `App.tsx`. See `docs/WAITER_APP_PROMPT.md` for the full spec.
