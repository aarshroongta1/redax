import { useNavigate, useParams } from "react-router-dom";
import { useState, useEffect } from "react";

const Download = () => {
  const navigate = useNavigate();
  const { docId } = useParams<{ docId: string }>();

  const [blobUrl, setBlobUrl] = useState<string | null>(null);
  const [rename, setRename] = useState("document-redacted.pdf");
  const [isEditing, setIsEditing] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchPDF = async () => {
      const type = localStorage.getItem("downloadType");
      const storedDocId = localStorage.getItem("downloadId");
      const token = localStorage.getItem("downloadToken");
      const filename = localStorage.getItem("filename") || "document";

      let url = "";
      if (docId) {
        url = `http://localhost:8000/download/${docId}`;
      } else if (type === "auth" && storedDocId) {
        url = `http://localhost:8000/download/${storedDocId}`;
      } else if (type === "guest" && token) {
        url = `http://localhost:8000/download/guest/${token}`;
      } else {
        setError("other");
      }

      try {
        const res = await fetch(url, { credentials: "include" });
        if (!res.ok) {
          if (res.status === 401) {
            setError("unauthorized");
          } else if (res.status === 403) {
            setError("forbidden");
          } else if (res.status === 404) {
            setError("not-found");
          } else {
            setError("other");
          }
          return;
        }
        if (docId) {
          const headerName = res.headers.get("Filename");
          console.log("Filename:", headerName);
          console.log("filename:", res.headers.get("filename"));
          if (headerName) {
            setRename(`${headerName.replace(/\.pdf$/, "")}-redacted.pdf`);
          }
        } else {
          setRename(`${filename.replace(/\.pdf$/, "")}-redacted.pdf`);
        }

        const blob = await res.blob();
        setBlobUrl(URL.createObjectURL(blob));
      } catch {
        setError("network");
      }
    };

    fetchPDF();

    return () => {
      if (blobUrl) URL.revokeObjectURL(blobUrl);
      if (!docId) {
        ["filename", "downloadId", "downloadToken", "downloadType"].forEach(
          (key) => localStorage.removeItem(key)
        );
      }
    };
  }, [docId, navigate]);

  if (error) {
    let title = "Document inaccessible.";
    let message = "Please try uploading again.";

    if (error === "unauthorized") {
      title = "Not logged in.";
      message = "Please log in to view this document.";
    } else if (error === "forbidden") {
      title = "Access denied.";
      message = "You do not have permission to view this document.";
    } else if (error === "not-found") {
      title = "Document not found.";
      message = "The document does not exist or was deleted.";
    } else if (error === "network") {
      title = "Network error.";
      message = "Please check your connection and try again.";
    }

    return (
      <div className="h-screen flex flex-col items-center justify-center gap-4">
        <p className="text-xl text-gray-600">{title}</p>
        <p className="text-sm text-gray-500">{message}</p>
        <button
          onClick={() => navigate("/")}
          className="bg-red-300 text-lg ring-2 ring-red-700 px-6 py-2 rounded-sm text-red-700 mt-6"
        >
          Return To Home
        </button>
        <button
          onClick={() => navigate("/signin")}
          className="bg-red-300 text-lg ring-2 ring-red-700 px-6 py-2 rounded-sm text-red-700 mt-6"
        >
          Sign Up / Log In
        </button>
      </div>
    );
  }

  return (
    <div className="h-screen flex flex-col items-center justify-center gap-6">
      <p className="text-4xl font-bold text-green-700">Your file is ready!</p>
      <div className="h-150 w-250 grid grid-cols-[40%_60%] border-2 border-gray-200 rounded-md shadow-lg">
        <div className="flex flex-col gap-3 justify-center items-center">
          {isEditing ? (
            <input
              value={rename}
              onChange={(e) => setRename(e.target.value)}
              onBlur={() => setIsEditing(false)}
              onKeyDown={(e) => e.key === "Enter" && setIsEditing(false)}
              className="text-lg text-gray-500 border-b-2 border-blue-400 bg-transparent focus:outline-none"
              autoFocus
            />
          ) : (
            <span
              onClick={() => setIsEditing(true)}
              className="text-lg text-gray-500 underline cursor-pointer"
              title={rename}
            >
              {rename.length > 50 ? "..." + rename.slice(-47) : rename}
            </span>
          )}
          <a
            href={blobUrl!}
            download={
              rename.toLowerCase().endsWith(".pdf") ? rename : `${rename}.pdf`
            }
            className="bg-blue-600 text-white px-6 p-2 rounded-md text-lg font-medium hover:bg-blue-700 transition"
          >
            Download Redacted PDF
          </a>
          <button
            onClick={() => navigate("/")}
            className="bg-gray-100 text-sm ring-2 ring-black px-4 py-2 rounded-sm mt-6"
          >
            New Document
          </button>
        </div>
        <div>
          <iframe
            src={blobUrl!}
            title="PDF Preview"
            className="w-full h-full border-l border-gray-300 rounded shadow"
          />
        </div>
      </div>
    </div>
  );
};

export default Download;
