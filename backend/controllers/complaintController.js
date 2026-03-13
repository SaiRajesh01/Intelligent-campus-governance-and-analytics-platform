const Complaint = require("./models/Complaint");
const aiCategorization = require("../services/aiCategorizationService");

exports.createComplaint = async (req, res) => {

  const { title, description } = req.body;

  const department = await aiCategorization(description);

  const complaint = await Complaint.create({
    title,
    description,
    department,
    createdBy: req.user.id
  });

  res.json(complaint);
};

exports.getComplaints = async (req, res) => {

  const complaints = await Complaint.find()
    .populate("createdBy", "name")
    .populate("department");

  res.json(complaints);
};

exports.updateStatus = async (req, res) => {

  const complaint = await Complaint.findById(req.params.id);

  complaint.status = req.body.status;

  if (req.body.status === "resolved") {
    complaint.resolvedAt = new Date();
  }

  await complaint.save();

  res.json(complaint);
};