"use client";

import { useEffect, useState } from "react";
import LogoUploader from "@/components/LogoUploader";

const API_BASE = process.env.NEXT_PUBLIC_API_URL; // e.g. https://geetham-backend.onrender.com/api

const defaultSubjects = [
  { subjectName: "English", maxMarks: 100, obtainedMarks: "" },
  { subjectName: "Maths", maxMarks: 100, obtainedMarks: "" },
  { subjectName: "Science", maxMarks: 100, obtainedMarks: "" },
];

export default function ProgressEntryPage() {
  const [academicYear, setAcademicYear] = useState("2025-26");
  const [examName, setExamName] = useState("SA1");
  const [className, setClassName] = useState("");
  const [section, setSection] = useState("");
  const [students, setStudents] = useState([]);
  const [selectedStudentId, setSelectedStudentId] = useState("");

  const [subjects, setSubjects] = useState(defaultSubjects);
  const [teacherRemark, setTeacherRemark] = useState("");
  const [principalRemark, setPrincipalRemark] = useState("");

  const [logoFile, setLogoFile] = useState(null);
  const [saving, setSaving] = useState(false);
  const [pdfUrl, setPdfUrl] = useState("");
  const [reportId, setReportId] = useState("");
  const [loadingStudents, setLoadingStudents] = useState(false);

  const [excelImporting, setExcelImporting] = useState(false);
  const [aiLoading, setAiLoading] = useState(false);

  // Fetch students when class/section changes
  useEffect(() => {
    const fetchStudents = async () => {
      if (!className) {
        setStudents([]);
        setSelectedStudentId("");
        return;
      }

      try {
        setLoadingStudents(true);
        const token = localStorage.getItem("token");
        const params = new URLSearchParams();
        params.append("className", className);
        if (section) params.append("section", section);

        const res = await fetch(`${API_BASE}/students?${params.toString()}`, {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        });

        const data = await res.json();
        if (data.status === "success") {
          setStudents(data.students || []);
        } else {
          console.error(data);
        }
      } catch (err) {
        console.error("Error fetching students:", err);
      } finally {
        setLoadingStudents(false);
      }
    };

    fetchStudents();
  }, [className, section]);

  const updateSubjectField = (index, field, value) => {
    setSubjects((prev) => {
      const copy = [...prev];
      copy[index] = { ...copy[index], [field]: value };
      return copy;
    });
  };

  const addSubjectRow = () => {
    setSubjects((prev) => [
      ...prev,
      { subjectName: "", maxMarks: 100, obtainedMarks: "" },
    ]);
  };

  const removeSubjectRow = (index) => {
    setSubjects((prev) => prev.filter((_, i) => i !== index));
  };

  const handleExcelUpload = async (event) => {
    const file = event.target.files?.[0];
    if (!file) return;

    try {
      setExcelImporting(true);
      const XLSX = await import("xlsx"); // ensure `xlsx` installed in client
      const data = await file.arrayBuffer();
      const workbook = XLSX.read(data, { type: "array" });
      const sheetName = workbook.SheetNames[0];
      const sheet = workbook.Sheets[sheetName];
      const json = XLSX.utils.sheet_to_json(sheet, { header: 1 });

      // Expect format: Subject | MaxMarks | ObtainedMarks
      const rows = json.slice(1).filter((row) => row && row[0]);
      const mapped = rows.map((row) => ({
        subjectName: row[0],
        maxMarks: Number(row[1] || 100),
        obtainedMarks: row[2] ?? "",
      }));

      if (mapped.length) {
        setSubjects(mapped);
      } else {
        alert("No valid rows found in Excel. Expect columns: Subject, MaxMarks, ObtainedMarks");
      }
    } catch (error) {
      console.error(error);
      alert("Failed to read Excel file. Ensure it's a valid .xlsx sheet.");
    } finally {
      setExcelImporting(false);
    }
  };

  const validateBeforeSave = () => {
    if (!academicYear || !examName || !className || !section || !selectedStudentId) {
      alert("Please select Academic Year, Exam, Class, Section, and Student.");
      return false;
    }
    if (!subjects.length) {
      alert("Please add at least one subject.");
      return false;
    }
    return true;
  };

  const handleSaveReport = async () => {
    if (!validateBeforeSave()) return;

    try {
      setSaving(true);
      const token = localStorage.getItem("token");

      const cleanSubjects = subjects.map((s) => ({
        subjectName: s.subjectName,
        maxMarks: Number(s.maxMarks || 0),
        obtainedMarks: Number(s.obtainedMarks || 0),
        teacherRemark: s.teacherRemark || "",
      }));

      const res = await fetch(
        `${API_BASE}/progress/student/${selectedStudentId}`,
        {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${token}`,
          },
          body: JSON.stringify({
            examName,
            academicYear,
            teacherGeneralRemark: teacherRemark,
            principalRemark,
            subjects: cleanSubjects,
          }),
        }
      );

      const data = await res.json();
      if (data.status === "success") {
        setReportId(data.report._id);
        alert("Progress report saved successfully.");
      } else {
        alert(data.message || "Failed to save report.");
      }
    } catch (err) {
      console.error(err);
      alert("Error saving report.");
    } finally {
      setSaving(false);
    }
  };

  const handleGeneratePdf = async () => {
    if (!reportId) {
      alert("Save the report first to get a report ID.");
      return;
    }

    try {
      const token = localStorage.getItem("token");
      const res = await fetch(
        `${API_BASE}/progress/${reportId}/generate-pdf`,
        {
          method: "POST",
          headers: {
            Authorization: `Bearer ${token}`,
          },
        }
      );
      const data = await res.json();
      if (data.status === "success") {
        setPdfUrl(data.pdfUrl);
      } else {
        alert(data.message || "Failed to generate PDF.");
      }
    } catch (err) {
      console.error(err);
      alert("Error generating PDF.");
    }
  };

  const handlePrintView = () => {
    window.print();
  };

  const handleAiRemarks = async () => {
    if (!selectedStudentId) {
      alert("Select a student first.");
      return;
    }
    if (!subjects.length) {
      alert("Please add at least one subject.");
      return;
    }

    try {
      setAiLoading(true);
      const token = localStorage.getItem("token");
      const res = await fetch("/api/ai/remarks", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: token ? `Bearer ${token}` : "",
        },
        body: JSON.stringify({
          examName,
          academicYear,
          className,
          section,
          subjects,
        }),
      });

      const data = await res.json();
      if (data.teacherRemark) setTeacherRemark(data.teacherRemark);
      if (data.principalRemark) setPrincipalRemark(data.principalRemark);
    } catch (err) {
      console.error(err);
      alert("Error using AI for remarks.");
    } finally {
      setAiLoading(false);
    }
  };

  const totalMax = subjects.reduce((sum, s) => sum + Number(s.maxMarks || 0), 0);
  const totalObtained = subjects.reduce(
    (sum, s) => sum + Number(s.obtainedMarks || 0),
    0
  );
  const percentage = totalMax > 0 ? (totalObtained / totalMax) * 100 : 0;

  return (
    <div className="p-4 md:p-8 max-w-6xl mx-auto print:p-2">
      {/* Header with logo slot */}
      <div className="flex flex-col md:flex-row items-center justify-between mb-6 gap-4 print:flex-row print:items-center">
        <div className="flex items-center gap-3">
          <div className="w-14 h-14 rounded-full bg-blue-100 flex items-center justify-center text-blue-700 font-bold text-xl">
            G
          </div>
          <div>
            <h1 className="text-xl md:text-2xl font-bold">
              Geetham Educational Institutions
            </h1>
            <p className="text-xs text-gray-500">
              Progress Report Entry & Generation (Powered by Gemini 1.5)
            </p>
          </div>
        </div>
        <div className="print:hidden">
         <div className="mb-4 p-4 border rounded-lg bg-white">
  <p className="text-sm font-semibold">College Logo (Auto applied)</p>
  <img
    src={`${process.env.NEXT_PUBLIC_API_URL}/settings/logo`}
    alt="College Logo"
    className="mt-2 w-28 h-28 object-contain"
  />
</div>

        </div>
      </div>

      {/* Filters row */}
      <div className="grid grid-cols-1 md:grid-cols-5 gap-3 mb-5 text-sm">
        <input
          className="border p-2 rounded-md"
          placeholder="Academic Year"
          value={academicYear}
          onChange={(e) => setAcademicYear(e.target.value)}
        />
        <input
          className="border p-2 rounded-md"
          placeholder="Exam Name (SA1, SA2...)"
          value={examName}
          onChange={(e) => setExamName(e.target.value)}
        />
        <input
          className="border p-2 rounded-md"
          placeholder="Class (e.g., 10)"
          value={className}
          onChange={(e) => setClassName(e.target.value)}
        />
        <input
          className="border p-2 rounded-md"
          placeholder="Section (e.g., A)"
          value={section}
          onChange={(e) => setSection(e.target.value)}
        />
        <select
          className="border p-2 rounded-md"
          value={selectedStudentId}
          onChange={(e) => setSelectedStudentId(e.target.value)}
        >
          <option value="">
            {loadingStudents ? "Loading students..." : "Select Student"}
          </option>
          {students.map((s) => (
            <option key={s._id} value={s._id}>
              {s.name} ({s.admissionNo}) {s.className}-{s.section}
            </option>
          ))}
        </select>
      </div>

      {/* Excel import & stats */}
      <div className="flex flex-wrap items-center justify-between gap-3 mb-4 text-xs md:text-sm">
        <label className="flex items-center gap-2 cursor-pointer">
          <span className="border px-3 py-1 rounded-md bg-gray-50 hover:bg-gray-100">
            {excelImporting ? "Importing..." : "Import from Excel"}
          </span>
          <input
            type="file"
            accept=".xlsx,.xls"
            onChange={handleExcelUpload}
            className="hidden"
          />
        </label>
        <div className="text-gray-600">
          Total: <b>{totalObtained}</b> / {totalMax} —{" "}
          <b>{percentage.toFixed(2)}%</b>
        </div>
      </div>

      {/* Subjects table */}
      <div className="overflow-x-auto border rounded-2xl bg-white shadow-sm mb-4">
        <table className="w-full text-sm">
          <thead className="bg-gray-100 text-left">
            <tr>
              <th className="p-2">#</th>
              <th className="p-2">Subject</th>
              <th className="p-2">Max Marks</th>
              <th className="p-2">Obtained</th>
              <th className="p-2 print:hidden">Actions</th>
            </tr>
          </thead>
          <tbody>
            {subjects.map((sub, idx) => (
              <tr
                key={idx}
                className="border-t hover:bg-gray-50 transition-colors"
              >
                <td className="p-2 text-xs text-gray-500">{idx + 1}</td>
                <td className="p-2">
                  <input
                    className="border p-1 rounded-md w-full"
                    value={sub.subjectName}
                    onChange={(e) =>
                      updateSubjectField(idx, "subjectName", e.target.value)
                    }
                    placeholder="Subject name"
                  />
                </td>
                <td className="p-2">
                  <input
                    type="number"
                    className="border p-1 rounded-md w-20"
                    value={sub.maxMarks}
                    onChange={(e) =>
                      updateSubjectField(idx, "maxMarks", e.target.value)
                    }
                  />
                </td>
                <td className="p-2">
                  <input
                    type="number"
                    className="border p-1 rounded-md w-24"
                    value={sub.obtainedMarks}
                    onChange={(e) =>
                      updateSubjectField(idx, "obtainedMarks", e.target.value)
                    }
                  />
                </td>
                <td className="p-2 print:hidden">
                  <button
                    className="text-xs text-red-500 hover:underline"
                    onClick={() => removeSubjectRow(idx)}
                  >
                    Remove
                  </button>
                </td>
              </tr>
            ))}
            <tr className="border-t print:hidden">
              <td colSpan={5} className="p-2 text-center">
                <button
                  className="text-xs text-blue-600 hover:underline"
                  onClick={addSubjectRow}
                >
                  + Add Subject
                </button>
              </td>
            </tr>
          </tbody>
        </table>
      </div>

      {/* Remarks + AI */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-4 text-sm">
        <div>
          <div className="flex items-center justify-between mb-1">
            <label className="font-semibold text-sm">
              Class Teacher Remark
            </label>
            <button
              className="text-xs text-purple-600 hover:underline disabled:opacity-50"
              onClick={handleAiRemarks}
              disabled={aiLoading}
            >
              {aiLoading ? "AI thinking..." : "Suggest via Gemini"}
            </button>
          </div>
          <textarea
            className="w-full border rounded-lg p-2 h-24"
            value={teacherRemark}
            onChange={(e) => setTeacherRemark(e.target.value)}
            placeholder="AI or manual remark about student's performance..."
          />
        </div>
        <div>
          <label className="font-semibold text-sm mb-1 block">
            Principal / Dean Remark
          </label>
          <textarea
            className="w-full border rounded-lg p-2 h-24"
            value={principalRemark}
            onChange={(e) => setPrincipalRemark(e.target.value)}
            placeholder="Principal/Dean final remark..."
          />
        </div>
      </div>

      {/* Actions */}
      <div className="flex flex-wrap gap-3 items-center mb-4 print:hidden">
        <button
          onClick={handleSaveReport}
          disabled={saving}
          className="bg-blue-600 text-white px-4 py-2 rounded-lg text-sm shadow hover:bg-blue-700 disabled:opacity-60"
        >
          {saving ? "Saving..." : "Save Report"}
        </button>
        <button
          onClick={handleGeneratePdf}
          className="bg-green-600 text-white px-4 py-2 rounded-lg text-sm shadow hover:bg-green-700 disabled:opacity-60"
        >
          Generate Progress Card PDF
        </button>
        <button
          onClick={handlePrintView}
          className="border border-gray-400 px-4 py-2 rounded-lg text-sm hover:bg-gray-50"
        >
          Print View
        </button>
      </div>

      {pdfUrl && (
        <div className="mt-3 text-sm">
          <span className="font-semibold mr-2">Progress Card PDF:</span>
          <a
            href={pdfUrl}
            target="_blank"
            rel="noreferrer"
            className="text-blue-700 underline"
          >
            Open / Download
          </a>
        </div>
      )}
    </div>
  );
}
