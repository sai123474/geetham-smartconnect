import PDFDocument from "pdfkit";
import fetch from "node-fetch";
import { Setting } from "../models/Setting.js";

export const generateProgressCardPdfBuffer = async ({
  student,
  report,
  schoolName = "Geetham Educational Institutions",
  campusName = "School / Junior College"
}) => {
  return new Promise(async (resolve, reject) => {
    try {
      const doc = new PDFDocument({ margin: 40 });
      const buffers = [];

      doc.on("data", (chunk) => buffers.push(chunk));
      doc.on("end", () => resolve(Buffer.concat(buffers)));

      // Fetch Logo from DB Settings
      const logoSetting = await Setting.findOne({ key: "collegeLogo" });
      let logoUrl = logoSetting?.value || null;

      // Render logo if exists
      if (logoUrl) {
        try {
          const logoImg = await fetch(logoUrl).then((r) => r.arrayBuffer());
          doc.image(Buffer.from(logoImg), 50, 40, { width: 70 });
        } catch (err) {
          console.log("Logo render error:", err.message);
        }
      }

      // Header section
      doc.fontSize(18).text(schoolName, 150, 50, { align: "left" });
      doc.fontSize(12).text(campusName, { align: "center" }).moveDown(0.5);
      doc.fontSize(14).text("PROGRESS REPORT", { align: "center" }).moveDown(1);

      // Student basic details
      doc.fontSize(11)
        .text(`Student Name: ${student.name}`)
        .text(`Admission No: ${student.admissionNo}`)
        .text(`Class / Section: ${student.className} - ${student.section}`)
        .text(`Academic Year: ${report.academicYear}`)
        .text(`Exam: ${report.examName}`)
        .moveDown(1);

      doc.text(
        `Attendance: ${report.attendancePercentage.toFixed(2)}% | Fee Due: ₹${report.feeDue.toFixed(2)}`
      );
      doc.text(
        `Total: ${report.totalObtainedMarks}/${report.totalMaxMarks} | Percentage: ${report.percentage.toFixed(2)}%`
      );
      doc.text(`Overall Grade: ${report.overallGrade} | GPA: ${report.gpa}`);
      doc.moveDown(1);

      // Marks table
      let y = doc.y + 10;
      doc.fontSize(11).text("Subjects Performance:", 40, y - 10).moveDown(0.5);

      const tableTop = doc.y;

      doc.fontSize(10);
      doc.text("Subject", 40, tableTop);
      doc.text("Max", 220, tableTop);
      doc.text("Obtained", 270, tableTop);
      doc.text("Grade", 340, tableTop);
      doc.text("Teacher Remark", 390, tableTop);

      doc.moveTo(40, tableTop + 12)
        .lineTo(doc.page.width - 40, tableTop + 12)
        .stroke();

      report.subjects.forEach((subj, i) => {
        const rowY = tableTop + 18 + i * 16;
        if (rowY > doc.page.height - 80) {
          doc.addPage();
          y = 50;
        }

        doc.text(subj.subjectName, 40, rowY);
        doc.text(String(subj.maxMarks), 220, rowY);
        doc.text(String(subj.obtainedMarks), 270, rowY);
        doc.text(subj.grade || "-", 340, rowY);
        doc.text(subj.teacherRemark || "", 390, rowY, {
          width: doc.page.width - 430
        });
      });

      doc.moveDown(2);

      // Principal & remarks
      doc.fontSize(10)
        .text("Class Teacher's Remark:", 40).moveDown(0.3)
        .text(report.teacherGeneralRemark || "__________________________", { width: doc.page.width - 80 })
        .moveDown(1)
        .text("Principal / Dean Remark:", 40).moveDown(0.3)
        .text(report.principalRemark || "__________________________", { width: doc.page.width - 80 });

      // Footer signatures
      const footerY = doc.page.height - 90;
      doc.moveTo(40, footerY).lineTo(doc.page.width - 40, footerY).stroke();
      doc.fontSize(10)
        .text("Class Teacher", 60, footerY + 10)
        .text("Principal / Dean", doc.page.width / 2 - 40, footerY + 10)
        .text("Parent / Guardian", doc.page.width - 160, footerY + 10);

      doc.end();
    } catch (error) {
      reject(error);
    }
  });
};
