const express = require("express");
const router = express.Router();

const clientController = require("../controller/clientController")


router.post("/add",clientController.addNewClientController)
router.put("/edit/:clientId",clientController.updateClientController)
router.delete("/delete/:clientId",clientController.deleteClientController)


module.exports = router




