const express = require("express");
const otpController = require("../controller/otpController")
const router = express.Router();


router.post("/request",otpController.requestOtp);
router.post("/verify",otpController.verifyOtp);

module.exports=router;

