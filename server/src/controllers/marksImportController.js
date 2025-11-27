import XLSX from "xlsx";

export const importMarksFromExcel = async (req, res, next) => {
  try {
    if (!req.file) {
      return res.status(400).json({ message: "Excel file required" });
    }

    const workbook = XLSX.read(req.file.buffer, { type: "buffer" });
    const sheet = workbook.Sheets[workbook.SheetNames[0]];
    const rows = XLSX.utils.sheet_to_json(sheet);

    // expected sheet headers:
    // Roll | Name | Maths | Science | English | Social | Telugu | Hindi | Total

    const students = rows.map((row) => ({
      roll: row["Roll"],
      name: row["Name"],
      subjects: Object.entries(row)
        .filter(([k]) => !["Roll", "Name"].includes(k))
        .map(([subject, marks]) => ({
          subjectName: subject,
          obtainedMarks: Number(marks),
        })),
    }));

    return res.json({
      status: "success",
      extracted: students,
      message: "Excel parsed successfully"
    });
  } catch (err) {
    next(err);
  }
};
