const clientModel = require("../model/clientModel")

exports.addNewClientController = async (req, res) => {
    try {
      const insertId = await clientModel.addNewClientModel(req.body);
      res.status(200).json({ message: "Client added successfully", clientId: insertId });
    } catch (error) {
      console.error("Error adding client:", error);
      res.status(500).json({ error: "Failed to add client" });
    }
  };


// Update existing client
exports.updateClientController = async (req, res) => {
    try {
      const clientId = req.params.clientId;
      const result = await clientModel.updateClientModel(clientId, req.body);
      if (result.affectedRows === 0) {
        return res.status(404).json({ message: "Client not found" });
      }
      res.status(200).json({ message: "Client updated successfully" });
    } catch (error) {
      console.error("Error updating client:", error);
      res.status(500).json({ error: "Failed to update client" });
    }
  };

// Delete client
exports.deleteClientController = async (req, res) => {
  try {
    const clientId = req.params.clientId;
    const result = await clientModel.deleteClientModel(clientId);
    if (result.affectedRows === 0) {
      return res.status(404).json({ message: "Client not found" });
    }
    res.status(200).json({ message: "Client deleted successfully" });
  } catch (error) {
    console.error("Error deleting client:", error);
    res.status(500).json({ error: "Failed to delete client" });
  }
};

