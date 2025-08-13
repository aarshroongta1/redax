import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import api from "../api";
import { useAuth } from "../context/AuthContext";

export let currentUploadController: AbortController | null = null;

const Upload = () => {
  const { isAuthenticated } = useAuth();
  const navigate = useNavigate();

  const [file, setFile] = useState<File | null>(null);

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    const dropFile = e.dataTransfer.files?.[0];
    if (dropFile && dropFile.type === "application/pdf") {
      setFile(dropFile);
    } else {
      alert("Please upload a valid PDF");
    }
  };

  const handleUpload = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!file) {
      alert("Please select a file first.");
      return;
    }

    localStorage.setItem("filename", file.name);

    navigate("/loading");

    const formData = new FormData();
    formData.append("file", file);
    console.log("file uploaded");

    currentUploadController = new AbortController();

    try {
      const response = await api.post("/upload", formData, {
        withCredentials: true,
        signal: currentUploadController.signal,
      });
      console.log("Redacted file created");
      console.log("Response data:", response.data); // Debug log

      if (isAuthenticated) {
        const document_id = response.data.document_id;
        console.log("Document ID from response:", document_id); // Debug log

        if (!document_id) {
          console.error("No document_id in response for authenticated user");
          alert(
            "Upload succeeded but no document ID received. Please try again."
          );
          navigate("/");
          return;
        }

        localStorage.setItem("downloadType", "auth");
        localStorage.setItem("downloadId", document_id.toString());
        console.log("Stored document ID:", localStorage.getItem("downloadId")); // Debug log
        navigate(`/download/${document_id}`);
      } else {
        const guestToken = response.data.guest_token;
        console.log("Guest token from response:", guestToken); // Debug log

        if (!guestToken) {
          console.error("No guest_token in response for guest user");
          alert(
            "Upload succeeded but no guest token received. Please try again."
          );
          navigate("/");
          return;
        }

        localStorage.setItem("downloadType", "guest");
        localStorage.setItem("downloadToken", guestToken);
        console.log(
          "Stored guest token:",
          localStorage.getItem("downloadToken")
        );
        navigate("/download");
      }
    } catch (error: unknown) {
      if (
        typeof error === "object" &&
        error !== null &&
        "name" in error &&
        (error as any).name === "CanceledError"
      ) {
        console.log("Upload canceled.");
      } else {
        console.error("Upload failed:", error);
        alert("Something went wrong. Check the console.");
      }
      navigate("/");
    }
  };

  return (
    <>
      <div className="flex justify-center text-3xl font-bold pb-8">
        Upload PDF for Redaction
      </div>

      <form onSubmit={handleUpload} className="text-center">
        <label
          htmlFor="upload"
          onDragOver={(e) => e.preventDefault()}
          onDrop={handleDrop}
          className="bg-gray-50 hover:bg-gray-100 border-2 border-dashed h-130 w-200 mx-auto rounded-xl flex items-center justify-center hover:border-gray-400 hover:text-gray-500"
        >
          <div>
            {file ? (
              <p>{file.name}</p>
            ) : (
              <div className="flex flex-col items-center gap-2">
                <svg
                  xmlns="http://www.w3.org/2000/svg"
                  fill="none"
                  viewBox="0 0 24 24"
                  strokeWidth="2.5"
                  stroke="currentColor"
                  className="size-6"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    d="M3 16.5v2.25A2.25 2.25 0 0 0 5.25 21h13.5A2.25 2.25 0 0 0 21 18.75V16.5m-13.5-9L12 3m0 0 4.5 4.5M12 3v13.5"
                  />
                </svg>
                <div>
                  <span className="font-semibold">Click to upload</span> or drag
                  and drop
                </div>
                <div className="leading-none">
                  Accepted Format: <span className="font-semibold">PDF</span>
                </div>
              </div>
            )}
            <input
              className="hidden"
              type="file"
              accept=".pdf"
              id="upload"
              name="upload"
              onChange={(e) => setFile(e.target.files?.[0] || null)}
            />
          </div>
        </label>
        <button className="bg-orange-500 hover:bg-orange-600 text-white text-md my-6 ring-2 ring-white px-4 py-2 rounded-md mx-auto block">
          Redact
        </button>
      </form>
    </>
  );
};

export default Upload;
