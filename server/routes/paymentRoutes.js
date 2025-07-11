const express = require("express");
const router = express.Router();
const {authenticateToken} = require("../middleware/verifyJWT")
const {authenticateRoles} = require("../middleware/authenticateRole")

const paymentController = require("../controller/paymentController")

router.get("/all",paymentController.getAllPaymentController)

router.post("/get-payment-slip",paymentController.getPaymentSlipController)

router.post("/add",paymentController.addNewPaymentController)

router.put("/edit/:paymentId",paymentController.updatePaymentController)

router.delete("/delete/:paymentId",paymentController.deletePaymentController)









module.exports = router;