const express = require("express");
const router = express.Router();
const clientController = require("../controller/clientController")
const {authenticateToken} = require("../middleware/verifyJWT")
const {authenticateRoles} = require("../middleware/authenticateRole")


router.post("/add",authenticateToken,authenticateRoles("project_manager","super_admin"),clientController.addNewClientController)

router.put("/edit/:clientId",authenticateToken,authenticateRoles("project_manager","super_admin"),clientController.updateClientController)

router.delete("/delete/:clientId",authenticateToken,authenticateRoles("project_manager","super_admin"),clientController.deleteClientController)

router.get("/all",authenticateToken,authenticateRoles("project_manager","super_admin"),clientController.getAllClientsController)

module.exports = router




