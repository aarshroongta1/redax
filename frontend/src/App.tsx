import { BrowserRouter as Router, Routes, Route, Link } from "react-router-dom";
import Home from "./pages/Home";
import Loading from "./pages/Loading";
import Download from "./pages/Download";
import Login from "./pages/Login";
import History from "./pages/History";
import { useAuth } from "./context/AuthContext";
import UserDropdown from "./components/UserDropdown";

const App = () => {
  const { isAuthenticated } = useAuth();
  return (
    <Router>
      <nav className="py-10 sticky top-0 z-50 bg-orange-200 flex justify-between items-center h-16 font-medium px-4">
        <Link to="/">
          <div className="pl-2 text-4xl ml-2 font-bold">redax</div>
        </Link>
        <div className="flex items-center gap-6 pr-5">
          <Link to="/upload">
            <span className=" hover:bg-orange-600 hover:text-white hover:ring-orange-600  bg-orange-500 text-white rounded-lg px-5 py-3 text-md">
              New Upload
            </span>
          </Link>

          {isAuthenticated ? (
            <UserDropdown />
          ) : (
            <Link to="/signin">
              <span className="bg-orange-200 hover:bg-orange-600 hover:text-white hover:ring-orange-600 ring-2 ring-orange-600 text-orange-600 rounded-lg px-5 py-3 text-md transition-colors">
                Sign Up/Log In
              </span>
            </Link>
          )}
        </div>
      </nav>
      <Routes>
        <Route path="/loading" element={<Loading />} />
        <Route path="/download/:docId" element={<Download />} />
        <Route path="/download" element={<Download />} />
        <Route path="/signin" element={<Login />} />
        <Route path="/history" element={<History />} />
        <Route path="/*" element={<Home />} />
      </Routes>
    </Router>
  );
};

export default App;
