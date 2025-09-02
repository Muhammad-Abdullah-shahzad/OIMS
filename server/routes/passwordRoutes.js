const express = require("express");

const router = express.Router();

const passwordController = require("../controller/passwordController");

router.post("/forget",passwordController.getUserByEmail);

module.exports=router