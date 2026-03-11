const Department = require("../models/Department")

// Create Department
exports.createDepartment = async (req, res) => {
  try {

    const { name, head } = req.body

    const department = new Department({
      name,
      head
    })

    await department.save()

    res.status(201).json(department)

  } catch (error) {
    res.status(500).json({ message: error.message })
  }
}

// Get all departments
exports.getDepartments = async (req, res) => {
  try {

    const departments = await Department.find()

    res.json(departments)

  } catch (error) {
    res.status(500).json({ message: error.message })
  }
}