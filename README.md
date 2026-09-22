# WaHeN Marketplace

WaHeN is currently a mobile-first marketplace prototype with a complete **local demo flow**:

`Buyer → Product → Cart → Coupon → Checkout → Mock Payment → Order → Seller/Delivery status → Review → Commission`

## Included in the demo

- Somaliland test products and sellers from the master specification
- Ahmed Hassan buyer profile and test checkout details
- Search by product, seller, phone, and simple `$price` filter
- Category browsing, wishlist, compare, cart quantity and stock checks
- Coupon `WAHEN10` (10%, minimum $50, maximum $20)
- Delivery fee calculation for the demo ($5)
- ZAAD/E-Dahab/Premier mock payment outcomes: success, failure, timeout
- Order IDs such as `WH10001`, payment IDs, payment status, order history
- Order lifecycle progression and buyer notifications
- Delivery/order tracking demo
- Seller commission (5%) and revenue settlement after delivery
- Review action only after delivery
- Local persistence with `localStorage`

## Important production limitation

This repository is still a browser-only demo. It does **not** yet provide production security or real financial integration. A production launch requires a backend/database, server-side authentication and role permissions, payment-provider webhooks, transactional inventory locking, encrypted secrets, audit logs, delivery APIs, and automated tests. Browser `localStorage` and `sessionStorage` must never be used as the security boundary.

Open `index.html` with a local server to test the flow. Use the cart with Samsung Galaxy A15 and Type-C Fast Charger to reproduce the specification totals.
