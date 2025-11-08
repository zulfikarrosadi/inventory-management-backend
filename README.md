# Inventory Management API

An Inventory Management REST API built with **TypeScript**, **Express**, and **MySQL**.  
It provides secure and scalable management of warehouses, inventory items, and stock transactions with JWT-based authentication.

---

## Features

### Implemented
1. **Authentication & Authorization**
   - JSON Web Tokens (JWT) for authentication using **access** and **refresh tokens**.
   - Each user has an isolated workspace for managing their own inventory and warehouses.

2. **Warehouse Management**
   - Full CRUD operations for managing warehouse data.

3. **Inventory Management**
   - Full CRUD operations for managing inventory items across warehouses.

4. **Data Reporting**
   - Retrieve inventory data:
     - From individual warehouses.
     - From all warehouses (aggregated report).

5. **Logging**
   - **Debug Logger** implemented using a centralized logger utility for easier debugging and monitoring.

---

## Upcoming Improvements

### 1. Audit Logging
   Implement an **audit logger** to track user actions (e.g., stock updates, warehouse edits) for better traceability.

### 2. Improved Stock Tracking Logic
   Current implementation directly updates the `quantity` column in the inventory table.  
   This will be replaced with a **transaction-based stock movement system** (similar to financial ledgers).
   - Benefits:
     - Complete history of all stock activities.
     - Easier auditing and rollback.
     - Supports complex operations like transfers or adjustments.

### 3. Group Access Control (RBAC)
   Introduce **Role-Based Access Control (RBAC)** to allow multiple users to collaborate on the same workspace:
   - **Roles**: e.g., `owner`, `manager`, `staff`, `viewer`.
   - **Permissions**: configurable for warehouse and inventory operations.
   - Enables shared management of warehouses among multiple users.

---

## Tech Stack

- **Language:** TypeScript  
- **Framework:** Express.js  
- **Database:** MySQL  
- **Auth:** JWT (Access & Refresh Tokens)  
- **Logger:** Pino (for debug and audit logs)  

---

## 🧪 Development Setup

1. Clone the repository:
   ```bash
   git clone https://github.com/yourusername/inventory-api.git
   cd inventory-api
   ```
2. Install Dependencies
   `npm install`
3. Copy `.env.example` to `.env` and fill all variable
4. Run Migrations
   `npm run db:migrate-run`
5. Import Postman Schema `Inventory Management System.postman_collection.json`

## 📂 Project Structure

