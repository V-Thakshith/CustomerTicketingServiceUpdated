const mongoose = require("mongoose");

// Define possible categories and statuses
const categories = ["Technical", "Billing", "General", "Product"];
const statuses = ["Open", "In Progress", "Resolved", "Closed"];

const ticketSchema = new mongoose.Schema({
  title: {type: String,required: true},
  description: {type: String,required: true},
  category: {type: String,enum: categories,default: "General"},
  status: {type: String,enum: statuses,default: "Open"},
  attachments: [{type: String,}],
  assignedTo: {type: mongoose.Schema.Types.ObjectId,ref: "User" },
  customer: {type: mongoose.Schema.Types.ObjectId,ref: "User"},
  createdAt: {type: Date,default: Date.now},
  updatedAt: {type: Date,default: Date.now},
});

module.exports = mongoose.model("Ticket", ticketSchema);
