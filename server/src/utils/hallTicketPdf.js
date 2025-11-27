import PDFDocument from "pdfkit";
import QRCode from "qrcode";

export const generateHallTicketPdfBuffer = async ({
  student,
  hallTicket,
  schoolName = "Geetham Educational Institutions",
  campusName = "School / Junior College"
}) => {
  return new Promise(async (resolve, reject) => {
    try {
      const doc = new PDFDocument({ margin: 50 });

      const buffers = [];
      doc.on("data", (chunk) => buffers.push(chunk));
      doc.on("end", () => resolve(Buffer.concat(buffers)));

      // Header
      doc
        .fontSize(18)
        .text(schoolName, { align: "center" })
        .moveDown(0.2);
      doc
        .fontSize(12)
        .text(campusName, { align: "center" })
        .moveDown(0.5);
      doc
        .fontSize(14)
        .text(`EXAM HALL TICKET`, { align: "center" })
        .moveDown(0.5);

      // Basic details
      const s = student;
      const h = hallTicket;

      doc
        .fontSize(11)
        .text(`Hall Ticket No: ${h.hallTicketNumber || "Pending"}`)
        .text(`Exam: ${h.examName}`)
        .text(`Academic Year: ${h.academicYear}`)
        .text(`Quarter: ${h.quarter}`)
        .moveDown(0.5);

      doc
        .text(`Student Name: ${s.name}`)
        .text(`Admission No: ${s.admissionNo}`)
        .text(`Class / Section: ${s.className} - ${s.section}`)
        .text(`Attendance: ${h.attendancePercentage?.toFixed(2) || 0}%`)
        .text(`Fee Due: ₹${(h.feeDue || 0).toFixed(2)}`)
        .moveDown(1);

      // Subjects table
doc.moveDown(1).fontSize(12).text("Exam Subjects & Timetable:", { underline: true });
doc.moveDown(0.5);

const tableTop = doc.y;
doc.fontSize(10);

doc.text("Subject", 50, tableTop);
doc.text("Date", 200, tableTop);
doc.text("Time", 330, tableTop);
doc.moveDown(0.6);

hallTicket.subjects.forEach((subj, index) => {
  const y = tableTop + 15 + index * 15;

  doc.text(subj.name, 50, y);
  doc.text(new Date(subj.examDate).toDateString(), 200, y);
  doc.text(`${subj.startTime} - ${subj.endTime}`, 330, y);
});

      // QR Code
      const qrPayload = {
        hallTicketId: h._id,
        hallTicketNumber: h.hallTicketNumber,
        studentId: s._id,
        admissionNo: s.admissionNo,
        examName: h.examName,
        academicYear: h.academicYear,
        quarter: h.quarter
      };

      const qrDataUrl = await QRCode.toDataURL(JSON.stringify(qrPayload));
      const qrBase64 = qrDataUrl.split(",")[1];
      const qrBuffer = Buffer.from(qrBase64, "base64");

      doc.image(qrBuffer, doc.page.width - 150, 120, {
        fit: [100, 100],
        align: "right"
      });

      doc
        .moveDown(1.5)
        .fontSize(10)
        .text(
          "Instructions for Student:",
          { underline: true }
        )
        .moveDown(0.3)
        .text("1. This hall ticket must be brought on all exam days.")
        .text("2. Fee dues & attendance criteria must be satisfied.")
        .text("3. Any malpractice will cancel this hall ticket.")
        .moveDown(1);

      const y = doc.y;
      doc
        .moveTo(50, y)
        .lineTo(doc.page.width - 50, y)
        .stroke();

      doc
        .moveDown(1)
        .fontSize(10)
        .text("Signature of Class Teacher", 50)
        .text("Signature of Principal / Dean", doc.page.width - 220, y + 20);

      doc.end();
    } catch (err) {
      reject(err);
    }
  });
};
