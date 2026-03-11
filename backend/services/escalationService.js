 // escalationService.js - starter file
// const Complaint = require("./models/Complaint");

// exports.checkEscalations = async () => {

//   const complaints = await Complaint.find({ status: "pending" });

//   complaints.forEach(c => {

//     const diff = Date.now() - new Date(c.createdAt);

//     const hours = diff / (1000 * 60 * 60);

//     if (hours > 48) {
//       c.status = "escalated";
//       c.save();
//     }
//   });

// };