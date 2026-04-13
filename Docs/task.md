# Task List: Phase 1 - Foundation, UI & Onboarding (UI-First & RBAC)

> [!IMPORTANT]
> **DEVELOPER DISCLAIMER:** This task list serves as a strategic roadmap, not a copy-paste script. The developer must exercise critical thinking, adhere to clean code principles, and apply professional judgement during implementation. DO NOT blindly feed these tasks into another AI; lead the implementation with intent and architect for long-term maintainability.

This document provides a mission-critical breakdown of tasks for Phase 1. Development is sequenced to prioritize UI foundation before backend logic, using raw PostgreSQL and explicit Role-Based Access Control (RBAC).

## 1. UI Foundation & Shared Components (UI First)
*Goal: Setup the visual and structural base for the application.*
- [ ] **1.1 Component Library Setup**:
    - [ ] Install Shadcn/UI and ensure "Premium/Modern" theme configuration in `tailwind.config.ts`.
    - [ ] Add core components: `Button`, `Input`, `Label`, `Card`, `Dialog`, `Toast`, `Badge`, `Tabs`, `Skeleton`.
- [ ] **1.2 RBAC-Aware Navigation**:
    - [ ] Setup a global `AuthContext` to manage user state and `role` (`admin`, `user`, `garage`).
    - [ ] Implement a `Sidebar` or `Header` that conditionally displays links based on the active role.
    - [ ] Create a `ProtectedLink` component that hides/disables interaction for insufficient permissions.

## 2. Authentication UI & flows
*Goal: Complete all visual flows for identity management.*
- [ ] **2.1 Login & Security Screens**:
    - [ ] Build the **Login Page**: Phone number input field + Social sign-in options (Google/Apple).
    - [ ] Build the **OTP Verification Screen**: 6-digit PIN input with auto-focus and "Resend Code" countdown (OTP will be `1234` for now; do not mention this in the UI).
- [ ] **2.2 RBAC Landing Logic**:
    - [ ] Implement logic to redirect users to their specific onboarding flows based on their assigned role.

## 3. Onboarding & Profile UI
*Goal: Capture all necessary data for Users and Garages.*
- [ ] **3.1 User/Vehicle Onboarding Flow**:
    - [ ] **Step A: Personal Profile**: Name, Email, and Avatar upload (mock S3 for now).
    - [ ] **Step B: Vehicle Addition**: Wizard with dropdowns or text fields for Year, Make, Model, Fuel Type. Include VIN/Plate fields.
- [ ] **3.2 Garage Professional Onboarding**:
    - [ ] Build the **Garage Registration Form**: Business Name, Address, Specializations (Engine, EV, etc.), Business Hours.
    - [ ] Build the **Document Upload Slot**: Placeholders for Certifications/Business License images or text.

## 4. Database & RBAC Backend (PostgreSQL)
*Goal: Setup the resilient data layer without Prisma.*
- [ ] **4.1 Postgres Schema Definition (Raw SQL)**:
    - [ ] Create `users` table: `id (UUID)`, `email`, `phone`, `full_name`, `role (ENUM: admin, user, garage)`, `created_at`.
    - [ ] Create `profiles` table: `id`, `user_id (FK)`, `avatar_url`, `bio`.
    - [ ] Create `vehicles` table: `id`, `user_id (FK)`, `make`, `model`, `year`, `fuel_type`, `vin`, `plate_number`.
    - [ ] Create `garages` table: `id`, `user_id (FK)`, `business_name`, `address`, `specializations`, `hours`, `is_approved (BOOLEAN)`.
- [ ] **4.2 Postgres Connection**:
    - [ ] Install `pg` (node-postgres).
    - [ ] Create a `db.ts` utility with a `Pool` configuration and a `query` helper function.

## 5. Backend Logic & RBAC Guards
*Goal: Wired security and data persistence.*
- [ ] **5.1 Auth & RBAC Middleware**:
    - [ ] Implement `POST /auth/otp/send` and `POST /auth/otp/verify`.
    - [ ] Implement **RBAC Guards**: `authorizeRole(['admin'])`, `authorizeRole(['garage'])`, etc., to protect API routes.
- [ ] **5.2 Core Data APIs (Raw SQL)**:
    - [ ] `POST /vehicles`: Insert new vehicle for authenticated user.
    - [ ] `GET /vehicles`: Fetch vehicles for the active user session.
    - [ ] `POST /garages/register`: Create a garage profile for users with the `garage` role.

## 6. Notification System (Final Step)
*Goal: Integrated alerting for all roles.*
- [ ] **6.1 Notification UI Component**:
    - [ ] Build the `NotificationTab` in the header.
    - [ ] Add categories for "System", "Bookings", and "Reminders".
- [ ] **6.2 Notification Persistence**:
    - [ ] Create `notifications` table: `id`, `user_id (FK)`, `title`, `message`, `is_read`, `created_at`.
    - [ ] Implement `GET /notifications` and `PATCH /notifications/:id/read`.
