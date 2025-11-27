import { ProgressReport } from "../models/ProgressReport.js";
import { Student } from "../models/Student.js";

// GET /api/analytics/class-exam?academicYear=2025-26&examName=SA1&className=10&section=A
export const getClassExamAnalytics = async (req, res, next) => {
  try {
    const { academicYear, examName, className, section } = req.query;

    if (!academicYear || !examName || !className) {
      return res.status(400).json({
        message: "academicYear, examName and className are required"
      });
    }

    const baseStudentFilter = { className, isActive: true };
    if (section) baseStudentFilter.section = section;

    const students = await Student.find(baseStudentFilter).select("_id name className section admissionNo");
    const studentIds = students.map((s) => s._id);

    const reports = await ProgressReport.find({
      academicYear,
      examName,
      studentId: { $in: studentIds }
    });

    if (!reports.length) {
      return res.json({
        status: "success",
        message: "No reports found for this class & exam",
        analytics: null
      });
    }

    // Class-level metrics
    const classTotalMax = reports.reduce((sum, r) => sum + (r.totalMaxMarks || 0), 0);
    const classTotalObt = reports.reduce((sum, r) => sum + (r.totalObtainedMarks || 0), 0);
    const classAvgPct = classTotalMax > 0 ? (classTotalObt / classTotalMax) * 100 : 0;

    // Per-student details
    const studentMap = new Map(students.map((s) => [String(s._id), s]));
    const studentPerformances = reports.map((r) => ({
      studentId: r.studentId,
      studentName: studentMap.get(String(r.studentId))?.name || "",
      admissionNo: studentMap.get(String(r.studentId))?.admissionNo || "",
      className: studentMap.get(String(r.studentId))?.className,
      section: studentMap.get(String(r.studentId))?.section,
      percentage: r.percentage,
      totalObtainedMarks: r.totalObtainedMarks,
      totalMaxMarks: r.totalMaxMarks
    }));

    // Sort for ranks
    const sortedByMarks = [...studentPerformances].sort(
      (a, b) => b.totalObtainedMarks - a.totalObtainedMarks
    );

    const toppers = sortedByMarks.slice(0, 5);
    const weakStudents = sortedByMarks.filter((s) => s.percentage < 40).slice(0, 10);

    // Subject-wise analytics
    const subjectStats = {}; // { subjectName: { total, count, max, min } }

    reports.forEach((r) => {
      r.subjects.forEach((sub) => {
        const key = sub.subjectName;
        if (!subjectStats[key]) {
          subjectStats[key] = {
            subjectName: key,
            totalObtained: 0,
            totalMax: 0,
            count: 0,
            highest: null,
            lowest: null
          };
        }
        const s = subjectStats[key];
        s.totalObtained += sub.obtainedMarks;
        s.totalMax += sub.maxMarks;
        s.count += 1;
        const pct = sub.maxMarks ? (sub.obtainedMarks / sub.maxMarks) * 100 : 0;
        if (s.highest === null || pct > s.highest) s.highest = pct;
        if (s.lowest === null || pct < s.lowest) s.lowest = pct;
      });
    });

    const subjectAnalytics = Object.values(subjectStats).map((s) => ({
      subjectName: s.subjectName,
      avgPercentage: s.totalMax ? (s.totalObtained / s.totalMax) * 100 : 0,
      highestPercentage: s.highest,
      lowestPercentage: s.lowest
    }));

    return res.json({
      status: "success",
      analytics: {
        academicYear,
        examName,
        className,
        section: section || "ALL",
        classAveragePercentage: classAvgPct,
        studentCount: students.length,
        subjectAnalytics,
        toppers,
        weakStudents
      }
    });
  } catch (err) {
    next(err);
  }
};

// GET /api/analytics/toppers?academicYear=2025-26&examName=SA1&limit=10
export const getToppersForDisplay = async (req, res, next) => {
  try {
    const { academicYear, examName, limit = 10 } = req.query;
    if (!academicYear || !examName) {
      return res.status(400).json({ message: "academicYear & examName required" });
    }

    const reports = await ProgressReport.find({ academicYear, examName })
      .populate("studentId", "name className section admissionNo")
      .sort({ totalObtainedMarks: -1 })
      .limit(Number(limit));

    const data = reports.map((r, index) => ({
      rank: index + 1,
      studentName: r.studentId?.name,
      admissionNo: r.studentId?.admissionNo,
      className: r.studentId?.className,
      section: r.studentId?.section,
      percentage: r.percentage,
      totalObtained: r.totalObtainedMarks,
      totalMax: r.totalMaxMarks
    }));

    res.json({
      status: "success",
      toppers: data
    });
  } catch (err) {
    next(err);
  }
};
