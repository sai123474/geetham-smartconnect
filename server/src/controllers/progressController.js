import { ProgressReport } from "../models/ProgressReport.js";
import { Student } from "../models/Student.js";
import { Attendance } from "../models/Attendance.js";
import { FeeStructure } from "../models/FeeStructure.js";
import { Concession } from "../models/Concession.js";
import { FeeTransaction } from "../models/FeeTransaction.js";
import { getGradeFromSubjectMarks, getGradeFromPercentage, getGpaFromPercentage } from "../utils/grading.js";
import { generateProgressCardPdfBuffer } from "../utils/progressCardPdf.js";
import { uploadToS3 } from "../utils/s3.js";

// helper: compute attendance %
const computeAttendance = async (studentId) => {
  const total = await Attendance.countDocuments({ studentId });
  const present = await Attendance.countDocuments({ studentId, status: "present" });
  return total > 0 ? (present / total) * 100 : 0;
};

// helper: compute fee due overall for year
const computeFeeDue = async (student, academicYear) => {
  const structure = await FeeStructure.findOne({
    academicYear,
    className: student.className,
    $or: [{ section: student.section }, { section: "ALL" }]
  }).sort({ section: -1 });

  if (!structure) return 0;

  const totalFee = structure.feeHeads.reduce(
    (sum, h) => sum + (h.amount || 0),
    0
  );

  const concessions = await Concession.find({
    studentId: student._id,
    academicYear,
    isActive: true
  });

  const concessionAmountFromFixed = concessions.reduce(
    (sum, c) => sum + (c.amount || 0),
    0
  );
  const concessionPct = concessions.reduce(
    (sum, c) => sum + (c.percentage || 0),
    0
  );
  const pctAmount = (totalFee * concessionPct) / 100;
  const totalConcession = concessionAmountFromFixed + pctAmount;

  const payments = await FeeTransaction.find({
    studentId: student._id,
    academicYear
  });
  const totalPaid = payments.reduce((sum, t) => sum + t.amount, 0);

  const feeDue = Math.max(totalFee - totalConcession - totalPaid, 0);
  return feeDue;
};

// 1) Create / update progress report for a student
export const upsertProgressReport = async (req, res, next) => {
  try {
    const { studentId } = req.params;
    const {
      examName,
      academicYear,
      subjects,
      teacherGeneralRemark,
      principalRemark
    } = req.body;

    if (!examName || !academicYear || !subjects || !subjects.length) {
      return res.status(400).json({
        message: "examName, academicYear and subjects are required"
      });
    }

    const student = await Student.findById(studentId);
    if (!student) {
      return res.status(404).json({ message: "Student not found" });
    }

    // Compute subject grades and totals
    let totalMax = 0;
    let totalObtained = 0;

    const processedSubjects = subjects.map((s) => {
      const max = Number(s.maxMarks || 0);
      const obt = Number(s.obtainedMarks || 0);
      totalMax += max;
      totalObtained += obt;

      return {
        subjectName: s.subjectName,
        maxMarks: max,
        obtainedMarks: obt,
        grade: getGradeFromSubjectMarks(obt, max),
        teacherRemark: s.teacherRemark || ""
      };
    });

    const percentage = totalMax > 0 ? (totalObtained / totalMax) * 100 : 0;
    const overallGrade = getGradeFromPercentage(percentage);
    const gpa = getGpaFromPercentage(percentage);

    const attendancePercentage = await computeAttendance(studentId);
    const feeDue = await computeFeeDue(student, academicYear);

    const payload = {
      studentId,
      examName,
      academicYear,
      subjects: processedSubjects,
      totalMaxMarks: totalMax,
      totalObtainedMarks: totalObtained,
      percentage,
      overallGrade,
      gpa,
      attendancePercentage,
      feeDue,
      teacherGeneralRemark: teacherGeneralRemark || "",
      principalRemark: principalRemark || ""
    };

    const report = await ProgressReport.findOneAndUpdate(
      { studentId, examName, academicYear },
      payload,
      { new: true, upsert: true, setDefaultsOnInsert: true }
    );

    res.json({
      status: "success",
      report
    });
  } catch (error) {
    next(error);
  }
};

// 2) Get a student's progress report for an exam
export const getProgressReport = async (req, res, next) => {
  try {
    const { studentId } = req.params;
    const { examName, academicYear } = req.query;

    const report = await ProgressReport.findOne({
      studentId,
      examName,
      academicYear
    });

    if (!report) {
      return res.status(404).json({ message: "Progress report not found" });
    }

    res.json({
      status: "success",
      report
    });
  } catch (error) {
    next(error);
  }
};

// 3) Generate Progress Card PDF
export const generateProgressCardPdf = async (req, res, next) => {
  try {
    const { reportId } = req.params;

    const report = await ProgressReport.findById(reportId);
    if (!report) {
      return res.status(404).json({ message: "Progress report not found" });
    }

    const student = await Student.findById(report.studentId);
    if (!student) {
      return res.status(404).json({ message: "Student not found" });
    }

    const buffer = await generateProgressCardPdfBuffer({
      student,
      report
    });

    const uploaded = await uploadToS3(
      buffer,
      `progress_${student.admissionNo}_${report.examName}_${report.academicYear}.pdf`,
      "application/pdf",
      "progress-cards"
    );

    report.generatedPdfUrl = uploaded.Location;
    await report.save();

    res.json({
      status: "success",
      pdfUrl: report.generatedPdfUrl
    });
  } catch (error) {
    next(error);
  }
};
