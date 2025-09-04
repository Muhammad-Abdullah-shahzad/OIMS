const dotenv = require("dotenv").config();
//  Express backend:
const express = require("express");
const cors = require("cors");
const app = express();
const authenticationRoutes = require("./routes/authenticationRoutes");
const employeeRoutes = require("./routes/employeeRoutes");
const projectRoutes = require("./routes/projectsRoutes");
const clientRoutes = require("./routes/clientRoutes");
const dashboardRoute = require("./routes/dashboardsRoutes");
const paymentRoutes = require("./routes/paymentRoutes");
const expenseRoutes = require("./routes/expenseRoute");
const salaryRoutes = require("./routes/salaryRoutes");
const userRoutes = require("./routes/userRoutes");
const financeRoute = require("./routes/financeRoute");
const adminRoute = require("./routes/adminRoute");
const profileRoutes = require("./routes/profileRoutes");
const logsRoutes = require("./routes/userActivityLogsRoutes");
const otpRoutes = require("./routes/otpRoutes");
const passwordRoutes=require("./routes/passwordRoutes")

app.use(cors());

app.use(express.json());

const port = process.env.port;
app.use("/auth", authenticationRoutes);
app.use("/users", userRoutes);
app.use("/employee", employeeRoutes);
app.use("/project", projectRoutes);
app.use("/client", clientRoutes);
app.use("/dashboard", dashboardRoute);
app.use("/payment", paymentRoutes);
app.use("/expense", expenseRoutes);
app.use("/salary", salaryRoutes);
app.use("/finance", financeRoute);
app.use("/admin", adminRoute);
app.use("/profile", profileRoutes);
app.use("/activitylogs", logsRoutes);
app.use("/otp", otpRoutes);
app.use("/password",passwordRoutes);

app.listen(process.env.PORT || 5000, () => {
  console.log("server listening on port ", port);
});
