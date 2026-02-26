# 🧩 Identity Reconciliation Service

A backend web service that consolidates customer contact information
based on shared **email** or **phone number**.

The service exposes a single endpoint:

    POST /identify

It links multiple contact records belonging to the same customer and
ensures the oldest record is treated as **primary**, while the rest are
marked as **secondary**.

------------------------------------------------------------------------

## 🚀 Live Service

🔗 **Service URL:**

    https://bitespeed-backend-task-pspd.onrender.com/identify

------------------------------------------------------------------------

## 📌 API Endpoint

### POST `/identify`

### Request Body

``` json
{
  "email": "string (optional)",
  "phoneNumber": "string (optional)"
}
```

At least one of `email` or `phoneNumber` must be provided.

------------------------------------------------------------------------

## ✅ Response Format

``` json
{
  "contact": {
    "primaryContatctId": 1,
    "emails": [
      "primary@email.com",
      "secondary@email.com"
    ],
    "phoneNumbers": [
      "1234567890"
    ],
    "secondaryContactIds": [23, 45]
  }
}
```

------------------------------------------------------------------------

## 🧠 Business Logic

-   Contacts are linked if:

    -   They share the same **email**, OR
    -   They share the same **phone number**

-   The **oldest contact (based on `createdAt`)** becomes:

        linkPrecedence = "primary"

-   All other linked contacts become:

        linkPrecedence = "secondary"
        linkedId = primaryContactId

-   If new information is received:

    -   If it belongs to an existing cluster → a new secondary contact
        is created (if needed)
    -   If no match is found → a new primary contact is created

------------------------------------------------------------------------

## 🗄 Database Schema (Contact)

``` ts
{
  id: number
  email?: string
  phoneNumber?: string
  linkedId?: number
  linkPrecedence: "primary" | "secondary"
  createdAt: Date
  updatedAt: Date
  deletedAt?: Date
}
```

------------------------------------------------------------------------

## 🏗 Tech Stack

-   Node.js
-   Express.js
-   TypeScript
-   MongoDB
-   Mongoose

------------------------------------------------------------------------

## 📂 Project Structure

    src/
     ├── config/
     ├── models/
     ├── controllers/
     ├── routes/
     ├── index.ts
     └── server.ts

------------------------------------------------------------------------

## ⚙️ Setup Instructions

### 1️⃣ Clone the Repository

``` bash
git clone https://github.com/vibhasapretwar/bitespeed-backend-task.git
cd bitespeed-backend-task
```

### 2️⃣ Install Dependencies

``` bash
npm install
```

### 3️⃣ Create `.env` File

    PORT=5000
    MONGO_URI=mongodb://127.0.0.1:27017/identityDB

### 4️⃣ Run Development Server

``` bash
npm run dev
```

Server will start at:

    http://localhost:5000

------------------------------------------------------------------------

## 🧪 Sample cURL Request

``` bash
curl -X POST http://localhost:5000/identify \
-H "Content-Type: application/json" \
-d '{"email":"mcfly@hillvalley.edu","phoneNumber":"123456"}'
```

------------------------------------------------------------------------

## 🔥 Edge Cases Handled

-   Multiple contacts merging into one cluster
-   Two primary clusters merging
-   Duplicate email/phone prevention
-   Oldest contact preserved as primary
-   Soft deleted contacts ignored

------------------------------------------------------------------------

## 👨‍💻 Author

Vibhas Apretwar\
GitHub: `https://github.com/vibhasapretwar`
