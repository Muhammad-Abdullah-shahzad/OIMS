const express = require("express")
// In Express backend:
const cors = require('cors');
const dotenv = require("dotenv").config();


const app = express();

const authenticationRoutes = require("./routes/authenticationRoutes")
const employeeRoutes = require("./routes/employeeRoutes")
const projectRoutes = require("./routes/projectsRoutes")
const clientRoutes = require("./routes/clientRoutes")
const dashboardRoute = require("./routes/dashboardsRoutes")
const paymentRoutes = require("./routes/paymentRoutes")
const expenseRoutes = require("./routes/expenseRoute")
const salaryRoutes = require("./routes/salaryRoutes")
app.use(cors());
app.use(express.json())


const port = process.env.port
/*
POST http://localhost:5000/auth/login
POST http://localhost:5000/auth/signup 
*/

app.use("/auth",authenticationRoutes);

// POST http://localhost:5000/employee/add 
// DELETE http://localhost:5000/employee/remove/:id
// PUT http://localhost:5000/employee/update/:id
// GET http://localhost:5000/employee/all

app.use("/employee",employeeRoutes)
/*
POST http://localhost:5000/project/add
expects data like {
    "title":"web app",
    "description":"creating oims web app in which ora digital can manage work",
    "client_id" :1,
    "start_date":"2025/12/12",
    "end_date":"2025/12/18",
    "budget":5000.90
  }
 returns 
{
    "message": "Project created",
    "projectId": 1
}

PUT http://localhost:5000/project/update/1
   expects 
   {
    "title":"react js web application",
  "description":"creating oims web app in which ora digital can manage internal tasks"
} 
return 
{
    "message": "Project updated"
}

POST http://localhost:5000/project/assign
expects
{ "project_id":1, 
"employee_id":2,
 "role_in_project":"front end developer", 
 "assigned_date":"2025/12/3" 
 }
returns 
{
    "message": "Employee assigned to project"
}

DELETE http://localhost:5000/project/delete/1
deletes a project
returns
{
    "message":"Project deleted"
}


GET http://localhost:5000/project/1/employee
returns employees linked to project no 1


PUT http://localhost:5000/project/assign/update/2/employee/2


GET http://localhost:5000/project/all
*/
app.use("/project",projectRoutes)
/*
POST http://localhost:5000/client/add
expects 
{
    "name": "abdullah shahzad",
    "company": "abdullah Corporation",
    "email": "abdullah.shahzad@example.com",
    "phone": "+923001112233",
    "whatsapp": "+923004445566",
    "address": "123 Main Street, Model Town",
    "city": "Lahore",
    "country": "Pakistan",
    "is_active": true
  }
*/
// DELETE http://localhost:5000/client/delete/4  -> deletes client with id 4
// DELETE http://localhost:5000/client/edit/4  -> updates client with id 4 ->expects json data that you want to update like {name:"abdullah"}

app.use("/client",clientRoutes)

app.use("/dashboard",dashboardRoute)

app.use("/payment",paymentRoutes)

app.use("/expense",expenseRoutes)

app.use("/salary",salaryRoutes)
app.listen(port,()=>{
    console.log("server listening on port ", port);
})
