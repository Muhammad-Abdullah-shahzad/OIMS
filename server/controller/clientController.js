const clientModel = require("../model/clientModel");
const {userActivityLogger} = require("../model/userActivityLogModel");

// Add new client
exports.addNewClientController = async (req, res) => {
  try {
    const insertId = await clientModel.addNewClientModel(req.body);

    // Log insert
    await userActivityLogger({
      userEmail: req.user.email,
      actionType: "INSERT",
      tableName: "clients",
      newData: req.body,
      actionDetails: `${req.user.email} added a new client (ID: ${insertId})`
    });

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
    const updatedData = req.body;
    const result = await clientModel.updateClientModel(clientId, updatedData);

    if (result.affectedRows === 0) {
      return res.status(404).json({ message: "Client not found" });
    }

    // Log update
    await userActivityLogger({
      userEmail: req.user.email,
      actionType: "UPDATE",
      tableName: "clients",
      newData: updatedData,
      actionDetails: `${req.user.email} updated client with ID: ${clientId}`
    });

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

    // Log delete
    await userActivityLogger({
      userEmail: req.user.email,
      actionType: "DELETE",
      tableName: "clients",
      newData: {},
      actionDetails: `${req.user.email} deleted client with ID: ${clientId}`
    });

    res.status(200).json({ message: "Client deleted successfully" });
  } catch (error) {
    console.error("Error deleting client:", error);
    res.status(500).json({ error: "Failed to delete client" });
  }
};

// Get all clients
exports.getAllClientsController = async (req, res) => {
  try {
    const clients = await clientModel.getAllClients();
    res.status(200).json({ success: true, data: clients });
  } catch (error) {
    console.error("Error fetching clients:", error);
    res.status(500).json({ success: false, message: "Internal server error" });
  }
};
