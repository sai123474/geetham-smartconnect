import csv from "csvtojson";
import { Student } from "../models/Student.js";

export const previewStudentsCsv = async (req, res, next) => {
  try {
    if (!req.file) {
      return res.status(400).json({
        status: "error",
        message: "CSV file is required",
      });
    }

    const academicYearFromQuery = req.query.academicYear || null;
    const csvString = req.file.buffer.toString("utf-8");
    const rows = await csv().fromString(csvString);

    if (!rows.length) {
      return res.json({
        status: "success",
        summary: { totalRows: 0, newCount: 0, duplicateCount: 0 },
        rows: [],
      });
    }

    // Normalize CSV headers: expected columns
    // Name, Phone, Class, Section, Roll, ParentName, Aadhar, Address, AcademicYear
    const parsed = rows.map((row, index) => ({
      rowIndex: index + 1,
      name: row.Name?.trim(),
      phone: row.Phone?.trim(),
      parentName: row.ParentName?.trim(),
      className: row.Class?.trim(),
      section: row.Section?.trim(),
      rollNo: row.Roll ? Number(row.Roll) : null,
      aadharNo: row.Aadhar?.trim(),
      address: row.Address?.trim(),
      academicYear: (row.AcademicYear || academicYearFromQuery || "").trim(),
      raw: row,
    }));

    const academicYears = [
      ...new Set(parsed.map((p) => p.academicYear).filter(Boolean)),
    ];

    if (!academicYears.length) {
      return res.status(400).json({
        status: "error",
        message:
          "AcademicYear column missing. Add 'AcademicYear' column or pass ?academicYear=2025-26 in query.",
      });
    }

    // Load existing students in these academic years
    const existingStudents = await Student.find({
      academicYear: { $in: academicYears },
    }).select("admissionNo aadharNo className section phone name academicYear");

    const existingByAadhar = new Set(
      existingStudents.map((s) => `${s.academicYear}|${s.aadharNo}`).filter(Boolean)
    );
    const existingByAdmission = new Set(
      existingStudents
        .map((s) => `${s.academicYear}|${s.admissionNo}`)
        .filter(Boolean)
    );
    const existingByComposite = new Set(
      existingStudents.map(
        (s) =>
          `${s.academicYear}|${(s.name || "").toLowerCase()}|${s.className}|${
            s.section
          }|${s.phone}`
      )
    );

    let newCount = 0;
    let duplicateCount = 0;

    const resultRows = parsed.map((p) => {
      let duplicate = false;
      let duplicateReason = "";

      if (!p.name || !p.className || !p.academicYear) {
        duplicate = true;
        duplicateReason = "Missing mandatory fields (Name/Class/Year)";
      } else if (p.aadharNo && existingByAadhar.has(`${p.academicYear}|${p.aadharNo}`)) {
        duplicate = true;
        duplicateReason = "Aadhar already exists in this academic year";
      } else if (
        p.raw.AdmissionNo &&
        existingByAdmission.has(`${p.academicYear}|${p.raw.AdmissionNo}`)
      ) {
        duplicate = true;
        duplicateReason = "Admission number already exists in this academic year";
      } else if (
        existingByComposite.has(
          `${p.academicYear}|${p.name.toLowerCase()}|${p.className}|${p.section}|${p.phone}`
        )
      ) {
        duplicate = true;
        duplicateReason = "Same student (Name/Class/Section/Phone) already exists";
      }

      if (duplicate) duplicateCount++;
      else newCount++;

      return {
        ...p,
        duplicate,
        duplicateReason,
      };
    });

    res.json({
      status: "success",
      summary: {
        totalRows: resultRows.length,
        newCount,
        duplicateCount,
      },
      rows: resultRows,
    });
  } catch (err) {
    next(err);
  }
};
