import csv from "csvtojson";
import { Student } from "../models/Student.js";

export const importStudentsCsv = async (req, res, next) => {
  try {
    if (!req.file) return res.status(400).json({ message: "CSV required" });

    const json = await csv().fromString(req.file.buffer.toString());
    const created = [];

    for (const s of json) {
      const student = await Student.create({
        name: s.Name,
        phone: s.Phone,
        parentName: s.ParentName,
        className: s.Class,
        section: s.Section,
        rollNo: Number(s.Roll),
        aadharNo: s.Aadhar || "",
        address: s.Address,
        academicYear: s.AcademicYear
      });

      created.push(student);
    }

    res.json({ status: "success", created });
  } catch (err) {
    next(err);
  }
};
