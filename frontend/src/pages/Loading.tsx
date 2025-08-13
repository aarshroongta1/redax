import { useNavigate } from "react-router-dom";
import { useAuth } from "../context/AuthContext";
import { currentUploadController } from "./Upload";

const Loading = () => {
  const navigate = useNavigate();
  const { isAuthenticated } = useAuth();

  return (
    <div className="h-screen flex flex-col items-center justify-center gap-4">
      <div className="animate-spin h-10 w-10 border-4 border-blue-500 border-t-transparent rounded-full" />
      <p className="text-2xl text-gray-600">Redacting your file...</p>
      {isAuthenticated && (
        <p className="text-md text-gray-500 max-w-md">
          You can stay on this page, or we'll notify you via email when your
          document is ready to download.
        </p>
      )}
      <button
        onClick={() => {
          navigate("/");
          currentUploadController?.abort();
        }}
        className="bg-gray-100 text-sm mt-4 ring-2 ring-black px-4 py-2 rounded-sm"
      >
        Cancel
      </button>
    </div>
  );
};

export default Loading;
