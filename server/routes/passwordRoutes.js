const express = require("express");

const router = express.Router();

const passwordController = require("../controller/passwordController");

router.post("/forget",passwordController.getUserByEmail);
router.post("/reset" , passwordController.resetPassword);
module.exports=router