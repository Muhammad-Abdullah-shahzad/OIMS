const express = require("express");
const router = express.Router();
const {authenticateToken} = require("../middleware/verifyJWT")

const {authenticateRoles} = require("../middleware/authenticateRole")

const paymentController = require("../controller/paymentController")

router.get("/all",authenticateToken,authenticateRoles("finance_manager","super_admin"),paymentController.getAllPaymentController)

router.post("/get-payment-slip",authenticateToken,authenticateRoles("finance_manager","super_admin"),paymentController.getPaymentSlipController)

router.post("/add",authenticateToken,authenticateRoles("finance_manager","super_admin"),paymentController.addNewPaymentController)

router.put("/edit/:paymentId",authenticateToken,authenticateRoles("finance_manager","super_admin"),paymentController.updatePaymentController)

router.delete("/delete/:paymentId",authenticateToken,authenticateRoles("finance_manager","super_admin"),paymentController.deletePaymentController)









module.exports = router;