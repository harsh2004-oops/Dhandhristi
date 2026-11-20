# DhanDrishti (धन दृष्टि)
### Intelligent Inventory, Financial Accounting & AI-Powered Invoice OCR System

DhanDrishti is a modern enterprise management platform designed for retail, wholesale, and small-to-medium businesses (SMEs). It streamlines stock tracking, purchase orders, sales transactions, expense auditing, and provides automated financial analytics (COGS, Gross Profit, Net Profit) alongside deep-learning Optical Character Recognition (OCR) for invoice digitization.

---

## 🏛️ System Architecture

```text
┌────────────────────────────────────────────────────────┐
│               Frontend: React 19 + Vite                │
│         (Port 5173 - Axios, Lucide Icons, Recharts)     │
└───────────────┬────────────────────────┬───────────────┘
                │                        │
       REST APIs (JSON)           Multipart / Uploads
                │                        │
                ▼                        ▼
┌──────────────────────────────┐ ┌──────────────────────────────┐
│  Backend: Spring Boot 4.x    │ │  AI Microservice: FastAPI    │
│  (Port 8080 - Java 21)       │ │  (Port 8000 - Python 3)      │
│  • Spring Data JPA           │ │  • PaddleOCR Deep Learning   │
│  • Transaction Management    │ │  • PyPDFium2 PDF Processor   │
│  • Business Insights Engine  │ │  • Regex & Heuristic Parser  │
│  • Reports & COGS Analytics  │ └──────────────────────────────┘
└───────────────┬──────────────┘
                │
         JPA / Hibernate
                │
                ▼
┌──────────────────────────────┐
│       MySQL Database         │
│  (Port 3306 - `dhandhristi`)  │
└──────────────────────────────┘
```

---

## ✨ Key Features

1. **Inventory & Warehouse Management:**
   - Real-time stock status monitoring.
   - Atomic stock updates on sales (automatic deduction) and purchases (automatic increment).
   - Low stock warnings (threshold: $\le 10$ units).

2. **Sales & Purchase Workflows:**
   - Sales ordering with instant customer linking and stock sufficiency validation.
   - Procurement orders linked to verified suppliers.
   - Full transaction rollback on order deletion/cancellation.

3. **Customer & Supplier CRM:**
   - Centralized customer profiles and contact directories.
   - Vendor catalog and supplier relationship tracking.

4. **Expense Management & Classification:**
   - Categorized operating expense records (Rent, Utilities, Logistics, Maintenance).
   - Overhead impact calculation against gross profit.

5. **Business Intelligence & Financial Reports:**
   - **Weighted Average COGS:** Accurately computes Cost of Goods Sold across fluctuating purchase batches.
   - **Gross & Net Profit Calculation:** Dynamically computes true earnings after operating costs.
   - **Dead Stock Detection:** Flags products with zero sales to facilitate clearance strategies.
   - **12-Month Rolling Sales Trends:** Visualized month-on-month sales performance.

6. **AI Invoice OCR Scanner:**
   - Upload scanned receipts and multi-page PDFs (JPG, PNG, PDF).
   - Deep-learning text recognition via PaddleOCR.
   - Regex-driven heuristic extraction for Invoice Number, Date, Supplier/Customer, Line Items, and Totals.
   - Visual verification screen with interactive data correction before committing.

---

## 🛠️ Technology Stack

| Layer | Technologies Used |
|---|---|
| **Frontend** | React 19, Vite, Axios, Lucide React, Recharts, Custom CSS |
| **Backend** | Java 21, Spring Boot 4.x, Spring Data JPA, Hibernate, MySQL Connector |
| **AI / OCR** | Python 3.x, FastAPI, Uvicorn, PaddleOCR, PyPDFium2, Pillow |
| **Database** | MySQL 8.x |

---

## 🚀 Getting Started

### 1. Database Setup
Create a MySQL database named `dhandhristi`:
```sql
CREATE DATABASE dhandhristi;
```
Verify `backend/src/main/resources/application.properties` credentials:
```properties
spring.datasource.url=jdbc:mysql://localhost:3306/dhandhristi
spring.datasource.username=root
spring.datasource.password=root
```

### 2. Run Backend (Spring Boot)
```bash
cd backend
./mvnw spring-boot:run
```
Backend runs on `http://localhost:8080`.

### 3. Run AI OCR Microservice (FastAPI)
```bash
cd ocr-service
# Activate virtual environment if configured
./venv/Scripts/activate
uvicorn main:app --reload --port 8000
```
OCR service runs on `http://127.0.0.1:8000`.

### 4. Run Frontend (React + Vite)
```bash
cd frontend
npm install
npm run dev
```
Frontend runs on `http://localhost:5173`.

---

## 👥 Project Team & Modules

- **Member 1 (Backend & DB Architect):** Spring Boot Architecture, MySQL Relational Schema, Atomic Transaction Management, REST APIs.
- **Member 2 (Frontend & UI/UX Lead):** React 19 Dashboard, Client-Side State Management, Axios Integration, Form Validation.
- **Member 3 (AI / OCR Engineer):** Python FastAPI OCR Microservice, PaddleOCR Integration, Regex Extraction Parser, Verification UI.
- **Member 4 (Insights & Financial Analytics):** Business Intelligence Algorithms, Weighted Average COGS, Profit/Loss Modeling, Reports & Charts.
