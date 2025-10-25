const Patient = require("../models/Patient");
const nodemailer = require("nodemailer");
const jwt = require("jsonwebtoken");
const bcrypt = require("bcryptjs")
//const secretKey = "hey";

const { JWT_SECRET, JWT_TTL } = require('../Configurations/crypto');

// Controller to add a new patient
// Add new patient — hash password before saving
exports.addPatient = async (req, res) => {
  try {
    const {
      email, password, firstName, lastName, gender, dob, civilStatus, phone,
      emergencyPhone, gaurdianNIC, gaurdianName, gaurdianPhone, height, weight,
      bloodGroup, allergies, medicalStatus, insuranceNo, insuranceCompany,
    } = req.body;

    // Required: hash the password
    const hashed = await bcrypt.hash(password, 10);

    const newPatient = new Patient({
      email,
      firstName,
      lastName,
      dob,
      gender,
      password: hashed,     // store hashed password
      civilStatus,
      phoneNo: phone,
      emergencyPhone,
      gaurdianName,
      gaurdianNIC,
      gaurdianPhone,
      height,
      weight,
      bloodGroup,
      allergies,
      medicalStatus,
      insuranceCompany,
      insuranceNo,
    });

    await newPatient.save();
    return res.status(201).json({ message: 'Patient Added' });
  } catch (err) {
    console.error(err);
    return res.status(500).json({ error: 'Internal Server Error' });
  }
};

// Controller for login
exports.loginPatient = async (req, res) => {
  const { email, password } = req.body;
  const patient = await Patient.findOne({ email });

  try {
    if (patient) {
      const result = password === patient.password;

      if (result) {
        const token = jwt.sign({ email: patient.email }, secretKey, {
          expiresIn: "1h",
        });
        res.status(200).send({ rst: "success", data: patient, tok: token });
      } else {
        res.status(200).send({ rst: "incorrect password" });
      }
    } else {
      res.status(200).send({ rst: "invalid user" });
    }
  } catch (error) {
    res.status(500).send({ error });
  }
};




// replace your checkToken with this:
exports.checkToken = async (req, res) => {
  try {
    const auth = req.headers.authorization || '';
    const token = auth.startsWith('Bearer ') ? auth.slice(7) : auth;
    if (!token) return res.status(401).json({ error: 'Unauthorized' });

    const decoded = jwt.verify(token, JWT_SECRET); // <-- use JWT_SECRET
    const patient = await Patient.findOne({ email: decoded.email });
    if (!patient) return res.status(404).json({ error: 'Patient not found' });

    return res.status(200).json({ rst: 'checked', patient });
  } catch (err) {
    console.error(err);
    return res.status(403).json({ error: 'Invalid or expired token' });
  }
};


// Controller to get patient by ID
exports.getPatientById = async (req, res) => {
  const pid = req.params.id;

  try {
    const patient = await Patient.findById(pid);
    res.status(200).send({ status: "Patient fetched", patient });
  } catch (err) {
    res.status(500).send({
      status: "Error in getting patient details",
      error: err.message,
    });
  }
};

// Controller to update a patient by ID
exports.updatePatient = async (req, res) => {
  const pid = req.params.id;
  const updatePatient = req.body;

  try {
    await Patient.findByIdAndUpdate(pid, updatePatient);
    res.status(200).send({ status: "Patient updated" });
  } catch (err) {
    res.status(500).send({
      status: "Error with updating information",
      error: err.message,
    });
  }
};

// Controller to delete a patient by ID
exports.deletePatient = async (req, res) => {
  const pid = req.params.id;

  try {
    await Patient.findByIdAndDelete(pid);
    res.status(200).send({ status: "Patient deleted" });
  } catch (err) {
    res.status(202).send({
      status: "Error with deleting the Patient",
      error: err.message,
    });
  }
};

// Controller to get all patients
exports.getAllPatients = async (req, res) => {
  try {
    const patients = await Patient.find();
    res.json(patients);
  } catch (err) {
    console.log(err);
  }
};
