# NYA HR Central

**Ghana Youth Authority (National Youth Authority - NYA) · HR Directorate**

NYA HR Central is a standalone, LAN-first human resources operations and internal communication platform designed for the Human Resources Directorate of the Ghana Youth Authority. It operates across internal office Local Area Networks (LAN) and Wi-Fi networks connecting the Accra Head Office, Regional Secretariats, District Directorates, and Youth Leadership and Skills Training Institutes (YLSTI) without external cloud or internet dependencies.

---

## 1. Visual & Architectural Alignment

The user interface reproduces the provided warm peach/coral glassmorphic aesthetic with high fidelity:
- **Left Navigation**: Stylized brand emblem, collapsible Dashboard with sub-views (Activity, Statistic, Performance Cases), Tasks counter badge (`5`), Libraries, Saved announcements, and Recent Direct Messages with status markers.
- **Top Header**: Pill search input, LAN connectivity badge, real-time notice center, and user account switcher with role badges.
- **Center Canvas**:
  - Three top metric cards: User greeting with avatar, New Cases (`104` with green sparkline and `+14,88%` trend), New Tasks (`34` with red sparkline and `-5,67%` trend).
  - "List of Cases to Be Accepted" table with checkboxes, date ranges, priority badges, downloadable file attachments, and assignee icons.
  - "Communication (Last 7 Days)" preview stream with unread status indicators.
  - Bottom analytical cards: "Case Type Breakdown" bar chart with category legend and "Number of Cases (Per Country)" workload table with trend ratios.
- **Right Rail**: "My Calendar" with color-coded day markers (green, blue, yellow), "List of My Tasks" with blue indicators, and "Task Assigned to Others" with orange indicators, each equipped with functioning `+` action buttons.

---

## 2. Technology Stack

- **Frontend**: React 19, TypeScript, Vite, Tailwind CSS v4, Lucide React, Socket.IO Client.
- **Backend**: Node.js, Express, Socket.IO, Multer.
- **Database & Persistence**: Embedded ACID persistent JSON storage with automated file backups in `./data/hr_central_database.json`.
- **File Repository**: Protected local directory storage in `./storage/uploads/` with hashed internal references and authorized download streaming.
- **Offline & LAN Capability**: 100% self-contained; runs on `0.0.0.0:3000` with zero external CDN or cloud API dependencies.

---

## 3. LAN Deployment Instructions

### A. Server Setup (Windows & Linux)
1. Ensure Node.js (v18+) is installed on the designated office server machine.
2. Clone or extract the HR Central application directory.
3. Install dependencies:
   ```bash
   npm install
   ```
4. Build the client bundle:
   ```bash
   npm run build
   ```
5. Start the platform:
   ```bash
   npm run start
   ```
   *(In development mode, run `npm run dev` to start Express with integrated Vite middleware).*

### B. Finding the Server's LAN IP Address
- **Windows**: Open Command Prompt and run `ipconfig`. Locate the IPv4 Address under your active Ethernet or Wi-Fi adapter (e.g., `192.168.1.100`).
- **Linux / macOS**: Run `ip a` or `ifconfig`.
- Alternatively, check the **Administration > LAN Configuration** panel inside HR Central.

### C. Accessing from Client Workstations
Any computer, laptop, or tablet connected to the same office Wi-Fi or Ethernet switch can access the platform by opening their browser and navigating to:
```
http://<SERVER-IP-ADDRESS>:3000
```
*(Example: `http://192.168.1.100:3000`)*

### D. Windows Firewall Configuration
If client machines cannot connect:
1. Open Windows Defender Firewall with Advanced Security.
2. Add an Inbound Rule for Port `3000` (TCP, Allow the connection).

---

## 4. Modules Overview

1. **Module A: Authentication & Access Control**: Real-time user switching between HR Director, HR Manager, HR Specialist, HR Officer, and Legal Counsel.
2. **Module B: Dashboard**: Direct reproduction of the reference screenshot with interactive data flows.
3. **Module C: Real-Time Messaging**: Direct and group chat channels with Socket.IO live broadcasts, reply preview, and document attachments.
4. **Module D: Document Management**: File storage divided into Policies, Arbitration Cases, Onboarding Kits, and Contracts with download logging.
5. **Module E: Announcements & Notices**: Pinned departmental memos, priority levels, and mandatory acknowledgement tracking.
6. **Module F: Tasks & Workflow Management**: Delegation, priority badges, due dates, and completion status toggles.
7. **Module G: Meetings & Calendars**: Schedule arbitration meetings, cross-border reviews, locations, and action item tracking.
8. **Module H: User Administration**: Account activation, role permissions, and LAN server telemetry.
9. **Module I: Reports & Audit Trails**: CSV export of cases, departmental workloads, and immutable audit logs recording actor, action, timestamp, and client IP.

---

## 5. Backup and Recovery

- **Export Backup**: Navigate to Administration and click "Download Full Database Backup" or issue a GET request to `/api/admin/backup`.
- **Restore Backup**: Use the "Restore Backup JSON File" control in the Administration console to restore all tables, cases, and logs.
