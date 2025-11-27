// server/src/controllers/auditController.js
import PDFDocument from "pdfkit";
import { AuditLog } from "../models/AuditLog.js";
import { uploadToS3 } from "../utils/s3.js";
import { Parser as CsvParser } from "json2csv";

export const exportAuditLogsCsv = async (req, res, next) => {
  try {
    const { from, to, module, userId } = req.query;

    const filter = {};
    if (from || to) {
      filter.createdAt = {};
      if (from) filter.createdAt.$gte = new Date(from);
      if (to) filter.createdAt.$lte = new Date(to);
    }
    if (module) filter.module = module;
    if (userId) filter.user = userId;

    const logs = await AuditLog.find(filter)
      .populate("user", "name role phone")
      .sort({ createdAt: -1 })
      .lean();

    const fields = [
      { label: "Time", value: (row) => row.createdAt },
      { label: "User", value: (row) => row.user?.name || "" },
      { label: "Role", value: (row) => row.user?.role || "" },
      { label: "Action", value: "action" },
      { label: "Module", value: "module" },
      { label: "IP", value: "ip" },
    ];

    const parser = new CsvParser({ fields });
    const csv = parser.parse(logs);

    // Either send directly as download:
    res.setHeader("Content-Type", "text/csv");
    res.setHeader(
      "Content-Disposition",
      `attachment; filename="audit_logs_${Date.now()}.csv"`
    );
    return res.send(csv);
  } catch (err) {
    next(err);
  }
};

export const exportAuditLogsPdf = async (req, res, next) => {
  try {
    const { from, to, module, userId } = req.query;

    const filter = {};
    if (from || to) {
      filter.createdAt = {};
      if (from) filter.createdAt.$gte = new Date(from);
      if (to) filter.createdAt.$lte = new Date(to);
    }
    if (module) filter.module = module;
    if (userId) filter.user = userId;

    const logs = await AuditLog.find(filter)
      .populate("user", "name role phone")
      .sort({ createdAt: -1 });

    const doc = new PDFDocument({ margin: 40, size: "A4" });
    const buffers = [];

    doc.on("data", (chunk) => buffers.push(chunk));
    doc.on("end", () => {
      const pdf = Buffer.concat(buffers);
      res.setHeader("Content-Type", "application/pdf");
      res.setHeader(
        "Content-Disposition",
        `attachment; filename="audit_logs_${Date.now()}.pdf"`
      );
      res.send(pdf);
    });

    doc.fontSize(16).text("Geetham Educational Institutions", { align: "center" });
    doc.moveDown(0.5);
    doc.fontSize(13).text("System Activity / Audit Log", { align: "center" });
    doc.moveDown(1);

    logs.forEach((log) => {
      doc
        .fontSize(10)
        .text(
          `${new Date(log.createdAt).toLocaleString()} | ${log.module} | ${
            log.action
          }`,
          { continued: false }
        );
      doc.text(
        `By: ${log.user?.name || "Unknown"} (${log.user?.role || "-"}) | IP: ${
          log.ip || "-"
        }`,
        { indent: 10 }
      );
      if (log.meta && Object.keys(log.meta).length > 0) {
        doc.text(`Meta: ${JSON.stringify(log.meta)}`, {
          indent: 10,
          width: 500,
        });
      }
      doc.moveDown(0.5);
      if (doc.y > 750) doc.addPage();
    });

    doc.end();
  } catch (err) {
    next(err);
  }
};
export const listAuditLogs = async (req, res, next) => {
  try {
    const logs = await AuditLog.find({})
      .populate("user", "name role phone")
      .sort({ createdAt: -1 })
      .limit(200);

    res.json({ status: "success", logs });
  } catch (err) {
    next(err);
  }
};
