import { Complaint } from "../models/Complaint.js";
import { uploadToS3 } from "../utils/s3.js";

// Helper: auto-assign targetRole by category
const getTargetRoleFromCategory = (category) => {
  switch (category) {
    case "mess":
    case "hostel":
      return "warden";
    case "fees":
      return "admin";
    case "discipline":
    case "academic":
      return "teacher";
    case "safety":
      return "principal";
    default:
      return "management";
  }
};

// Create complaint (student/parent/teacher/staff)
export const createComplaint = async (req, res, next) => {
  try {
    const { title, description, category, priority, studentId } = req.body;

    if (!title || !description) {
      return res.status(400).json({ message: "Title and description are required" });
    }

    const reporterRole = req.user.role; // from auth middleware
    const targetRole = getTargetRoleFromCategory(category);

    const attachments = [];
    if (req.files && req.files.length) {
      for (const file of req.files) {
        const uploaded = await uploadToS3(
          file.buffer,
          file.originalname,
          file.mimetype,
          "complaints"
        );
        attachments.push({
          url: uploaded.Location,
          fileName: file.originalname,
          fileType: file.mimetype
        });
      }
    }

    const complaint = await Complaint.create({
      title,
      description,
      category,
      priority,
      createdBy: req.user._id,
      reporterRole,
      studentId: studentId || null,
      targetRole,
      attachments,
      lastUpdatedBy: req.user._id
    });

    res.status(201).json({
      status: "success",
      complaint
    });
  } catch (error) {
    next(error);
  }
};

// Get complaints for logged-in user (smart filtered)
export const getMyComplaints = async (req, res, next) => {
  try {
    let filter = { isActive: true };

    if (["student", "parent"].includes(req.user.role)) {
      filter.createdBy = req.user._id;
    } else if (["teacher", "staff"].includes(req.user.role)) {
      filter.$or = [{ assignedTo: req.user._id }, { createdBy: req.user._id }];
    } else if (["admin", "dean", "principal"].includes(req.user.role)) {
      // management can see all, optionally filter by status/category via query later
    }

    const complaints = await Complaint.find(filter)
      .populate("createdBy", "name role")
      .populate("assignedTo", "name role")
      .populate("escalatedTo", "name role")
      .populate("studentId", "name className section admissionNo")
      .sort({ createdAt: -1 });

    res.json({
      status: "success",
      count: complaints.length,
      complaints
    });
  } catch (error) {
    next(error);
  }
};

// Assign complaint to staff/teacher by admin/principal/dean
export const assignComplaint = async (req, res, next) => {
  try {
    const { complaintId, assignedTo, targetRole } = req.body;

    const complaint = await Complaint.findById(complaintId);
    if (!complaint || !complaint.isActive) {
      return res.status(404).json({ message: "Complaint not found" });
    }

    complaint.assignedTo = assignedTo || complaint.assignedTo;
    complaint.targetRole = targetRole || complaint.targetRole;
    complaint.status = "in_progress";
    complaint.lastUpdatedBy = req.user._id;

    await complaint.save();

    res.json({
      status: "success",
      message: "Complaint assigned successfully",
      complaint
    });
  } catch (error) {
    next(error);
  }
};

// Update status & optionally escalate
export const updateComplaintStatus = async (req, res, next) => {
  try {
    const { complaintId } = req.params;
    const { status, escalatedTo, remarks } = req.body;

    const allowedStatus = [
      "open",
      "in_progress",
      "escalated",
      "resolved",
      "closed",
      "rejected"
    ];
    if (status && !allowedStatus.includes(status)) {
      return res.status(400).json({ message: "Invalid status" });
    }

    const complaint = await Complaint.findById(complaintId);
    if (!complaint || !complaint.isActive) {
      return res.status(404).json({ message: "Complaint not found" });
    }

    if (status) complaint.status = status;
    if (escalatedTo) {
      complaint.escalatedTo = escalatedTo;
      complaint.status = "escalated";
    }

    if (remarks) {
      complaint.comments.push({
        userId: req.user._id,
        message: remarks,
        internal: true
      });
    }

    complaint.lastUpdatedBy = req.user._id;
    await complaint.save();

    res.json({
      status: "success",
      complaint
    });
  } catch (error) {
    next(error);
  }
};

// Add public comment (student/parent/staff/admin)
export const addComplaintComment = async (req, res, next) => {
  try {
    const { complaintId } = req.params;
    const { message } = req.body;

    if (!message) {
      return res.status(400).json({ message: "Comment message is required" });
    }

    const complaint = await Complaint.findById(complaintId);
    if (!complaint || !complaint.isActive) {
      return res.status(404).json({ message: "Complaint not found" });
    }

    complaint.comments.push({
      userId: req.user._id,
      message,
      internal: false
    });
    complaint.lastUpdatedBy = req.user._id;

    await complaint.save();

    res.json({
      status: "success",
      complaint
    });
  } catch (error) {
    next(error);
  }
};

// Get single complaint by ID with authorization
export const getComplaintById = async (req, res, next) => {
  try {
    const { complaintId } = req.params;

    const complaint = await Complaint.findById(complaintId)
      .populate("createdBy", "name role")
      .populate("assignedTo", "name role")
      .populate("escalatedTo", "name role")
      .populate("studentId", "name className section admissionNo");

    if (!complaint || !complaint.isActive) {
      return res.status(404).json({ message: "Complaint not found" });
    }

    // Access rules
    const isCreator = complaint.createdBy._id.equals(req.user._id);
    const isAssigned = complaint.assignedTo?.equals(req.user._id);
    const isEscalatedTo = complaint.escalatedTo?.equals(req.user._id);
    const isManagement = ["admin", "dean", "principal"].includes(req.user.role);

    if (!isCreator && !isAssigned && !isEscalatedTo && !isManagement) {
      return res.status(403).json({ message: "Not allowed to view this complaint" });
    }

    res.json({
      status: "success",
      complaint
    });
  } catch (error) {
    next(error);
  }
};
