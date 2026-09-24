# Archeological System - System Accounts & Credentials Reference

This document contains all predefined user accounts configured in the system. Use these credentials to sign in directly from the login page (`/login`).

---

## Pre-Configured Accounts

All seeded accounts use the default password: **`password123`**

| Role | Name | Email Address | Password | Permissions & Capabilities |
| :--- | :--- | :--- | :--- | :--- |
| **Admin (Director General)** | Dr. Rajesh Sharma | `admin@archrecords.com` | `password123` | **Full access**: Team & User Management (`/users`), excavation sites, artifact records, field logs, approvals, settings, and full system configuration. |
| **Lead Archaeologist** | Dr. Priya Natarajan | `lead@archrecords.com` | `password123` | **Elevated access**: Create and edit sites, catalog artifacts, publish field logs, review findings, export data. |
| **Field Assistant** | Dr. Anand Joshi | `field@archrecords.com` | `password123` | **Operational access**: Record daily excavation field logs, upload artifact photographs, log trench measurements. |
| **Lead Archaeologist** | Dr. Sunita Deshmukh | `sunita@archrecords.com` | `password123` | **Research access**: Environmental logs, artifact cataloguing, stratigraphy reports. |
| **Viewer** | Dr. Vikram Mehta | `viewer@archrecords.com` | `password123` | **Read-only access**: Browse discovered sites, view artifact galleries, inspect public field notes. |

---

## How to Sign In
1. Navigate to the login page (`http://localhost:5173/login` or click **Sign In**).
2. Enter the desired **Email Address** (for example, `admin@archrecords.com`).
3. Enter the **Password**: `password123`.
4. Click **Sign in**.

---

## Creating Your Own Custom Account
You can create a new account in two ways:
1. **Self-Registration**: Click **"Create an account"** on the login page or visit `/register` to sign up with your own name, email, and password.
2. **Admin User Management**:
   - Sign in as the Admin (`admin@archrecords.com`).
   - Go to **Team & Users** in the sidebar (or navigate to `/users`).
   - Add new users, assign specific roles (**Admin**, **Lead Archaeologist**, **Field Assistant**, or **Viewer**), and update active statuses.
