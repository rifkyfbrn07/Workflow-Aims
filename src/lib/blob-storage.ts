const MAX_FILE_SIZE = 15 * 1024 * 1024;
const ALLOWED_TYPES = new Set([
  "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet",
  "application/vnd.ms-excel",
  "text/csv",
  "application/pdf",
]);
const ALLOWED_EXTENSIONS = /\.(xlsx|xls|csv|pdf)$/i;

export function validateSubmissionFile(file: File) {
  if (!ALLOWED_EXTENSIONS.test(file.name) || (file.type && !ALLOWED_TYPES.has(file.type))) {
    throw new Error("File type not supported. Upload an .xlsx, .xls, .csv, or .pdf file.");
  }
  if (!file.size) throw new Error("The selected file is empty.");
  if (file.size > MAX_FILE_SIZE) throw new Error("File size exceeds the 15 MB maximum limit.");
}

function safeSegment(value: string) {
  return value.replace(/[^a-zA-Z0-9._-]/g, "-").replace(/-+/g, "-");
}

export async function uploadToBlob(file: File, context: { year: number; month: string; report: string; employee: string }) {
  validateSubmissionFile(file);
  const token = process.env.BLOB_READ_WRITE_TOKEN;
  if (!token) throw new Error("File storage is not configured. Set BLOB_READ_WRITE_TOKEN to enable uploads.");
  const path = `worktrack/${context.year}/${safeSegment(context.month)}/${safeSegment(context.report)}/${safeSegment(context.employee)}/${Date.now()}_${safeSegment(file.name)}`;
  const response = await fetch(`https://blob.vercel-storage.com/${path}`, {
    method: "PUT",
    headers: {
      authorization: `Bearer ${token}`,
      "x-api-version": "7",
      "x-add-random-suffix": "0",
      "content-type": file.type || "application/octet-stream",
    },
    body: file,
  });
  if (!response.ok) throw new Error("We couldn't save the file to secure storage.");
  const blob = await response.json() as { url: string; pathname: string };
  return { url: blob.url, path: blob.pathname || path };
}
