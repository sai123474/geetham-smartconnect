import mongoose from "mongoose";

const subjectMarkSchema = new mongoose.Schema(
  {
    subjectName: { type: String, required: true },
    maxMarks: { type: Number, required: true },
    obtainedMarks: { type: Number, required: true },
    grade: { type: String },
    teacherRemark: { type: String }
  },
  { _id: false }
);

const progressReportSchema = new mongoose.Schema(
  {
    studentId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Student",
      required: true
    },
    examName: {
      type: String,
      required: true // e.g., "SA1", "Quarterly", "Final"
    },
    academicYear: {
      type: String,
      required: true
    },

    subjects: [subjectMarkSchema],

    totalMaxMarks: { type: Number, default: 0 },
    totalObtainedMarks: { type: Number, default: 0 },
    percentage: { type: Number, default: 0 },
    overallGrade: { type: String },
    gpa: { type: Number, default: 0 },

    classRank: { type: Number },
    sectionRank: { type: Number },

    attendancePercentage: { type: Number, default: 0 },
    feeDue: { type: Number, default: 0 },

    teacherGeneralRemark: { type: String },
    principalRemark: { type: String },

    generatedPdfUrl: { type: String }
  },
  { timestamps: true }
);

progressReportSchema.index(
  { studentId: 1, examName: 1, academicYear: 1 },
  { unique: true }
);

export const ProgressReport = mongoose.model(
  "ProgressReport",
  progressReportSchema
);
