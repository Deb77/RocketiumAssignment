# 🚀 Rocketium Full Stack Assignment

![GitHub repo size](https://img.shields.io/github/repo-size/Deb77/RocketiumAssignment)
![GitHub issues](https://img.shields.io/github/issues/Deb77/RocketiumAssignment)
![GitHub license](https://img.shields.io/github/license/Deb77/RocketiumAssignment)

> This project is a lightweight, web-based design tool that enables users to create, edit, and organize vector-based designs effortlessly. It includes a canvas, object and layer management, and real-time collaboration for quick prototyping and UI/UX experimentation.

---

## 🏛 Architecture Overview & Library Choices

### Tech Stack

* **Frontend:** `React.js`
* **Backend:** `Node.js + Express`
* **Database:** `MongoDB`
* **State Management:** `Redux Toolkit + Context API`
* **Deployment:** `Cloudflare Pages + Render Worker`

### Libraries & Tools

| Layer        | Libraries / Tools                                             | Reason for Choice                                                                     |
| ------------ | ------------------------------------------------------------- | ------------------------------------------------------------------------------------- |
| Frontend     | React, Ant Design, Fabric.js, Axios, Socket.IO Client, UUID   | Efficient UI building, canvas handling, state management, and real-time collaboration |
| Backend/API  | Express, Socket.IO, Axios, BcryptJS, JWT, CORS, Dotenv, Redis | Secure API handling, real-time updates, and authentication                            |
| Database/ORM | MongoDB, Mongoose                                             | Flexible schema for storing canvas objects and user data                              |

---

## 📡 API Documentation

* **Base URL:** `https://rocketiumassignment.onrender.com`
* **Authentication:** `Bearer token / JWT`

### Endpoints

#### **User Authentication**

| Method | Endpoint         | Description             | Access |
| ------ | ---------------- | ----------------------- | ------ |
| POST   | `/auth/register` | Register a new user     | Public |
| POST   | `/auth/login`    | Login and get JWT token | Public |

#### **Canvas Management**

| Method | Endpoint      | Description                              | Access             |
| ------ | ------------- | ---------------------------------------- | ------------------ |
| POST   | `/canvas`     | Create a new canvas                      | Authenticated user |
| GET    | `/canvas`     | Get all canvases (owner or collaborator) | Authenticated user |
| GET    | `/canvas/:id` | Get single canvas by ID                  | Authenticated user |
| PUT    | `/canvas/:id` | Update canvas (owner or collaborator)    | Authenticated user |
| DELETE | `/canvas/:id` | Delete canvas (owner only)               | Owner only         |

#### **Canvas Sharing / Collaboration**

| Method | Endpoint                  | Description                                  | Access             |
| ------ | ------------------------- | -------------------------------------------- | ------------------ |
| POST   | `/canvas/:id/share-email` | Share canvas with another user by email      | Owner only         |
| DELETE | `/canvas/:id/share-email` | Remove a collaborator from a canvas by email | Owner only         |
| GET    | `/canvas/:id/users`       | Get all participants (owner + collaborators) | Owner/Collaborator |

#### **Comments & Replies**

| Method | Endpoint                              | Description                       | Access        |
| ------ | ------------------------------------- | --------------------------------- | ------------- |
| GET    | `/canvas/:id/comments`                | Get all comments for a canvas     | Authenticated |
| POST   | `/canvas/:id/comments`                | Add a comment to a canvas         | Authenticated |
| POST   | `/canvas/comments/:commentId/replies` | Add a reply to a specific comment | Authenticated |

---

## 🗄 Database Schema Design

### **User Model**

| Field        | Type   | Required | Description          |
| ------------ | ------ | -------- | -------------------- |
| name         | String | Yes      | User's full name     |
| email        | String | Yes      | Unique email address |
| passwordHash | String | Yes      | Hashed password      |
| createdAt    | Date   | Auto     | Timestamp created    |
| updatedAt    | Date   | Auto     | Timestamp updated    |

### **Canvas Model**

| Field         | Type                  | Required | Description            |
| ------------- | --------------------- | -------- | ---------------------- |
| name          | String                | Yes      | Canvas name            |
| data          | Object                | No       | Canvas JSON data       |
| image         | String                | No       | Canvas snapshot URL    |
| owner         | ObjectId (User ref)   | Yes      | Canvas owner           |
| collaborators | [ObjectId (User ref)] | No       | Array of collaborators |
| createdAt     | Date                  | Auto     | Timestamp created      |
| updatedAt     | Date                  | Auto     | Timestamp updated      |

### **Comment Model**

| Field     | Type                  | Required | Description                |
| --------- | --------------------- | -------- | -------------------------- |
| canvas    | ObjectId (Canvas ref) | Yes      | Associated canvas          |
| x         | Number                | Yes      | X-coordinate on canvas     |
| y         | Number                | Yes      | Y-coordinate on canvas     |
| text      | String                | Yes      | Comment text               |
| mentions  | [String]              | No       | Users mentioned in comment |
| author    | ObjectId (User ref)   | Yes      | Comment author             |
| replies   | [ReplySchema]         | No       | Replies to the comment     |
| createdAt | Date                  | Auto     | Timestamp created          |
| updatedAt | Date                  | Auto     | Timestamp updated          |

### **Reply Schema (Embedded in Comment)**

| Field     | Type                | Required | Description              |
| --------- | ------------------- | -------- | ------------------------ |
| text      | String              | Yes      | Reply text               |
| mentions  | [String]            | No       | Users mentioned in reply |
| author    | ObjectId (User ref) | Yes      | Reply author             |
| createdAt | Date                | Auto     | Timestamp created        |

---

## ❌ Features Cut / Decisions

| Feature                      | Reason for Cutting / Change      |
| ---------------------------- | -------------------------------- |
| Testing                      | Cut due to time constraints      |

---

## 📸 Screenshots 

[![Screenshot 1](https://i.ibb.co/fdJ7Ktsn/Screenshot-2025-10-03-at-9-06-00-AM.png)](https://ibb.co/5hZVzvPn)
[![Screenshot 2](https://i.ibb.co/cX7Xq5kx/Screenshot-2025-10-03-at-9-10-36-AM.png)](https://ibb.co/pr9rqDbn)


---

## ⚙ How to Run

```bash
# Clone repository
git clone https://github.com/Deb77/RocketiumAssignment.git

# Setup client
cd client
# Environment variables:
VITE_SERVER_URL
npm i
npm run dev

# Setup backend
cd server
# Environment variables:
PORT
MONGO_URI
JWT_SECRET
FRONTEND_URL
REDIS_URL
REDIS_PASSWORD
npm i
nodemon app.js
```

---
