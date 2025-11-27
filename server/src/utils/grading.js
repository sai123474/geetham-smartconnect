// Simple CBSE-style-ish mapping – adjust as needed
export const getGradeFromPercentage = (pct) => {
  if (pct >= 90) return "A1";
  if (pct >= 80) return "A2";
  if (pct >= 70) return "B1";
  if (pct >= 60) return "B2";
  if (pct >= 50) return "C1";
  if (pct >= 40) return "C2";
  if (pct >= 33) return "D";
  return "E";
};

export const getGpaFromPercentage = (pct) => {
  if (pct >= 90) return 10;
  if (pct >= 80) return 9;
  if (pct >= 70) return 8;
  if (pct >= 60) return 7;
  if (pct >= 50) return 6;
  if (pct >= 40) return 5;
  if (pct >= 33) return 4;
  return 0;
};

export const getGradeFromSubjectMarks = (obtained, max) => {
  const pct = max > 0 ? (obtained / max) * 100 : 0;
  return getGradeFromPercentage(pct);
};
