# Authentication & Role Management

This project implements a **Role-Based Access Control (RBAC)** system with multi-level administrative permissions and email OTP verification.

---

# Roles

The system supports three administrative roles:

1. SuperAdmin
2. Admin
3. CompanyAdmin

Each role has different levels of permissions.

---

# Role Permissions

## SuperAdmin

The **SuperAdmin** has the highest level of access in the system.

### Permissions

- Create **Admin** users
- Perform **all actions that Admins can perform**
- Full access to the entire system

### Restrictions

- Only **one SuperAdmin** can exist in the system.

---

## Admin

Admins are responsible for managing companies and company-level administrators.

### Permissions

- Create **Companies**
- Create **CompanyAdmin**
- Manage company data
- Perform all actions available to **CompanyAdmin**

### Restrictions

- Cannot create **SuperAdmin**
- Cannot create other **Admin**

---

## CompanyAdmin

CompanyAdmins manage operations for their assigned company.

### Permissions

- Read company information (their own company only)
- Update company information (their own company only)
- Manage **Company Drivers**
- Perform company-level operational tasks

### Restrictions

- Cannot create **Admin**
- Cannot create **SuperAdmin**
- Cannot access other companies

---

# Role Creation

Users are created from the **Admin Dashboard**.

### Role IDs

| Role         | ID  |
| ------------ | --- |
| SuperAdmin   | 1   |
| Admin        | 2   |
| CompanyAdmin | 3   |

### Rules

- Only **one SuperAdmin** is allowed in the system
- Multiple **Admins** are allowed
- Multiple **CompanyAdmins** are allowed

---

# Authentication

The authentication system uses **Email + Password with OTP verification**.

## Login Flow

1. User enters **Email and Password**
2. System validates credentials
3. If credentials are correct:
   - An **OTP (One-Time Password)** is sent to the user's **email**
4. User enters the OTP
5. If OTP is valid:
   - User is successfully logged in

This adds an extra layer of security.

---

# Account Management

Users can manage their accounts after login.

### Features

- Update Profile
- Reset Password
- Change Password

Profile updates follow the **same structure as regular user profiles**.

---

# Login Methods

### Supported

- Email + Password
- Email OTP verification

### Not Supported

- Google Login
- Facebook Login
- Other Social Logins

---

# Summary

| Role         | Can Create            | Can Manage                | Restrictions                      |
| ------------ | --------------------- | ------------------------- | --------------------------------- |
| SuperAdmin   | Admin                 | Everything                | Only one allowed                  |
| Admin        | Company, CompanyAdmin | Companies & CompanyAdmins | Cannot create SuperAdmin or Admin |
| CompanyAdmin | None                  | Company & Drivers         