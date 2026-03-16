const Department = require("../models/Department");

module.exports = async function aiCategorization(text) {

  text = text.toLowerCase();

  let deptName;

  if (text.includes("wifi") || text.includes("internet")) {
    deptName = "CSE";
  } 
  else if (text.includes("lab") || text.includes("system")) {
    deptName = "A-CSE";
  } 
  else {
    deptName = "CSE";
  }

  const department = await Department.findOne({ name: deptName });

  return department._id;
};