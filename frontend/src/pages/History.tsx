import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import api from "../api";

interface DocEntry {
  id: number;
  filename: string;
  created_at: string;
}

const History = () => {
  const [docs, setDocs] = useState<DocEntry[]>([]);
  const [error, setError] = useState<string | null>(null);
  const navigate = useNavigate();

  useEffect(() => {
    const fetchHistory = async () => {
      try {
        const res = await api.get("/history", { withCredentials: true });
        setDocs(res.data);
      } catch (err) {
        console.error("History fetch error:", err);
        setError("Failed to load history. Please log in again.");
      }
    };

    fetchHistory();
  }, []);

  if (error) {
    return (
      <div className="h-screen flex flex-col items-center justify-center gap-4">
        <p className="text-xl text-gray-600">Unable to load history</p>
        <p className="text-sm text-gray-500">{error}</p>
        <button
          onClick={() => navigate("/signin")}
          className="bg-red-300 text-lg ring-2 ring-red-700 px-6 py-2 rounded-sm text-red-700 mt-6"
        >
          Sign In
        </button>
      </div>
    );
  }

  return (
    <div className="p-10">
      <h2 className="text-3xl font-bold mb-6">Your Redacted Documents</h2>
      {docs.length === 0 ? (
        <p className="text-gray-500">You haven't uploaded any documents yet.</p>
      ) : (
        <ul className="space-y-4">
          {docs.map((doc) => (
            <li
              key={doc.id}
              className="border rounded-lg p-4 flex justify-between items-center"
            >
              <div>
                <p className="font-semibold">{doc.filename}</p>
                <p className="text-sm text-gray-500">
                  Redacted on {new Date(doc.created_at).toLocaleString()}
                </p>
              </div>
              <button
                onClick={() => navigate(`/download/${doc.id}`)}
                className="bg-blue-600 text-white px-4 py-2 rounded hover:bg-blue-700"
              >
                View
              </button>
            </li>
          ))}
        </ul>
      )}
    </div>
  );
};

export default History;