

# OIMS (Oradigitals Internal Management System)

**OIMS** is an internal management system designed to simplify business operations for Oradigitals. This system provides features for **project management**, **client management**, **employee management**, and **finance management**. Built with a modern tech stack, OIMS leverages **React.js** on the frontend, **Express.js** on the backend, and integrates key technologies such as **Recharts** for data visualization, **JWT** for secure authentication, and **Bcrypt** for password encryption. The data is securely stored in a **MySQL** database.

---

## Table of Contents

1. **Technologies Used**
2. **Features**
3. **Installation**
4. **Project Structure**
5. **Frontend Development**
6. **Backend Development**
7. **API Endpoints**
8. **Authentication**
9. **Charts and Data Visualization**
10. **Contributing**
11. **License**

---

## Technologies Used

* **Frontend**: React.js
* **Backend**: Express.js
* **Authentication**: JWT (JSON Web Tokens)
* **Password Hashing**: Bcrypt.js
* **Charts**: Recharts
* **Database**: MySQL
* **State Management**: Redux or Context API (optional)
* **API**: RESTful API

---

## Features

### 1. **Project Management**

* Ability to create, update, and track the progress of projects.
* Assign employees to specific projects and tasks.
* Monitor project deadlines, milestones, and completion status.
* View detailed project stats, analytics, and reports.

### 2. **Client Management**

* Manage clients, including adding new clients, tracking client interactions, and maintaining contact information.
* View financial data, such as invoices, payments, and outstanding balances for each client.

### 3. **Employee Management**

* Add, update, and remove employees.
* Assign employees to projects and manage their responsibilities.
* Track employee performance, hours worked, and other essential metrics.

### 4. **Finance Management**

* Track company finances, including income, expenses, and transactions related to projects and clients.
* Generate financial reports, summaries, and data visualizations.

---

## Installation

### 1. **Clone the Repository**

To get started, first clone the repository to your local machine:

```bash
git clone https://github.com/oradigitals/oims.git
cd oims
```

### 2. **Install Backend Dependencies**

Navigate to the `server` directory and install the backend dependencies:

```bash
cd server
npm install
```

### 3. **Install Frontend Dependencies**

Navigate to the `client` directory and install the frontend dependencies:

```bash
cd ../client
npm install
```

### 4. **Set Up MySQL Database**

* Ensure that MySQL is installed on your system. You can download it from the [official MySQL website](https://dev.mysql.com/downloads/).
* Create a new database for OIMS in MySQL.

### 5. **Configure Environment Variables**

Create a `.env` file in the `server` directory to define the following environment variables:

```
PORT=5000
DB_HOST=localhost
DB_USER=root
DB_PASSWORD=your_mysql_password
DB_NAME=oims
JWT_SECRET=your_jwt_secret
```

Replace `your_mysql_password` and `your_jwt_secret` with your own values.

### 6. **Start the Application**

#### Start the Backend:

```bash
cd server
npm start
```

#### Start the Frontend:

```bash
cd client
npm start
```

Once the servers are running, you can visit `http://localhost:3000` to interact with the system in the browser.

---

## Project Structure

The project is organized as follows:

```
oims/
├── client/                # React.js frontend
│   ├── src/
│   │   ├── components/    # Reusable components
│   │   ├── pages/         # Page components
│   │   ├── services/      # API service calls
│   │   ├── store/         # Redux or Context API setup
│   │   └── App.js         # Main React app component
│   └── public/            # Static assets (images, etc.)
│
├── server/                # Express.js backend
│   ├── controllers/       # API logic for different routes
│   ├── models/            # MySQL models and queries
│   ├── routes/            # API routes
│   ├── middleware/        # Middleware for authentication, validation, etc.
│   ├── config/            # Configuration files (DB, JWT, etc.)
│   └── server.js          # Entry point for the backend server
└── .env                   # Environment variables for backend
```

---

## Frontend Development

The frontend is built with **React.js**, providing an intuitive and responsive user interface. We use **Redux** or **Context API** for state management, which allows for a seamless experience across different modules, such as user authentication and project tracking.

**Recharts** is integrated for visualizing data in the form of charts and graphs, including project progress, finance tracking, and employee performance.

---

## Backend Development with Express.js and MySQL

The backend is built with **Express.js**, which serves as the API layer connecting the frontend to the MySQL database. We use the `mysql2` library to interact with MySQL directly, or you can choose to use an ORM such as **Sequelize** for easier management of database models and relationships.

### Example: MySQL Connection

```javascript
const mysql = require('mysql2');

const connection = mysql.createConnection({
  host: process.env.DB_HOST,
  user: process.env.DB_USER,
  password: process.env.DB_PASSWORD,
  database: process.env.DB_NAME
});

connection.connect(err => {
  if (err) throw err;
  console.log('Connected to MySQL database.');
});

module.exports = connection;
```

---

### Example: User Authentication with JWT and Bcrypt

**User registration and authentication** are handled securely using **JWT** (JSON Web Tokens) for session management and **Bcrypt** for password hashing.

```javascript
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const db = require('../config/db');

// Register new user
const registerUser = (req, res) => {
  const { name, email, password, role } = req.body;

  db.query('SELECT * FROM users WHERE email = ?', [email], (err, result) => {
    if (err) throw err;
    if (result.length > 0) {
      return res.status(400).json({ message: 'User already exists' });
    }

    bcrypt.hash(password, 10, (err, hashedPassword) => {
      if (err) throw err;

      db.query(
        'INSERT INTO users (name, email, password, role) VALUES (?, ?, ?, ?)',
        [name, email, hashedPassword, role],
        (err, result) => {
          if (err) throw err;
          const token = jwt.sign({ id: result.insertId }, process.env.JWT_SECRET, {
            expiresIn: '1h'
          });
          res.status(201).json({ token });
        }
      );
    });
  });
};
```

---

## API Endpoints

### Authentication

* **POST** `/api/auth/register`: Register a new user (admin/employee)
* **POST** `/api/auth/login`: Login and receive a JWT token

### Project Management

* **GET** `/api/projects`: Get all projects
* **POST** `/api/projects`: Create a new project
* **PUT** `/api/projects/:id`: Update project details
* **DELETE** `/api/projects/:id`: Delete a project

### Client Management

* **GET** `/api/clients`: Get all clients
* **POST** `/api/clients`: Add a new client
* **PUT** `/api/clients/:id`: Update client details
* **DELETE** `/api/clients/:id`: Delete a client

### Employee Management

* **GET** `/api/employees`: Get all employees
* **POST** `/api/employees`: Add a new employee
* **PUT** `/api/employees/:id`: Update employee details
* **DELETE** `/api/employees/:id`: Delete an employee

### Finance Management

* **GET** `/api/finance`: Get financial records
* **POST** `/api/finance`: Add a new financial record (income/expense)
* **GET** `/api/finance/stats`: Get financial statistics (reports)

---

## Authentication

**JWT Authentication** is used for securing API routes. When a user logs in, they receive a JWT token, which is then included in the **Authorization** header for subsequent requests. Passwords are securely hashed using **Bcrypt.js**.

---

## Charts and Data Visualization

Recharts is used for rendering various charts on the frontend, including:

* **Project Progress**: A line or bar chart showing the progress of different projects.
* **Financial Trends**: A pie or line chart visualizing income, expenses, and profit margins.
* **Employee Performance**: A bar chart depicting employee hours, completed tasks, and overall performance.

---

## Contributing

We encourage contributions to improve the functionality and usability of OIMS. To contribute:

1. Fork the repository.
2. Create a new branch (`git checkout -b feature/your


-feature`). 3. Make your changes. 4. Commit your changes (`git commit -am 'Add new feature'`). 5. Push to your branch (`git push origin feature/your-feature`).
6. Submit a pull request for review.

---

## License

This project is licensed under the MIT License. For more details, please refer to the **LICENSE** file.

---
