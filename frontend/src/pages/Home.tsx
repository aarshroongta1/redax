import { useEffect, useRef } from "react";
import { useLocation, Link } from "react-router-dom";
import Upload from "./Upload";
import { useAuth } from "../context/AuthContext";

const Home = () => {
  const { isAuthenticated } = useAuth();

  const location = useLocation();
  const uploadRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (location.pathname === "/upload" && uploadRef.current) {
      uploadRef.current.scrollIntoView({ behavior: "smooth" });
    }
  }, [location]);

  return (
    <>
      <section className="pt-15 bg-gradient-to-b from-orange-200 to-white">
        <div className="grid grid-cols-[10%_30%_3%_auto_15%]">
          <div></div>
          <div className="text-right leading-none">
            <h1 className="text-7xl font-extrabold drop-shadow-md">Privacy</h1>
            <h1 className="text-7xl font-extrabold drop-shadow-md">
              Supremacy
            </h1>
          </div>

          <div></div>
          <div className="pt-1 text-xl">
            Redax is built for a world where privacy isn't optional — it's
            everything. From neatly typed documents to messy last-minute scans,
            Redax finds the information most personal to you and removes them
            with speed and precision. Take control of your safety anytime and
            anywhere confidently with Redax.
          </div>
        </div>
      </section>
      <div className="flex justify-center mt-20">
        <Link to="/upload">
          <button
            className="relative h-12 w-40 overflow-hidden rounded-xl border border-orange-400 bg-orange-400 text-white font-bold text-lg shadow-2xl transition-all
      before:absolute before:top-0 before:right-0 before:h-12 before:w-6 before:translate-x-12 before:rotate-6 before:bg-white before:opacity-10 before:duration-700
      hover:shadow-orange-400 hover:before:-translate-x-40"
          >
            <span className="relative z-10">IT'S FREE →</span>
          </button>
        </Link>
      </div>

      <section className="mt-25">
        <div className="text-center text-3xl text-gray-800 font-bold">
          Why Choose Redax?
        </div>
        <div className="grid grid-cols-3 gap-12 mx-43 mt-10 text-center">
          <div>
            <div className="text-3xl">🔍</div>
            <div className="font-bold mt-4 mb-2 text-lg">Smart Redaction</div>
            <div className=" text-gray-600">
              Cutting-edge AI at your fingertips for context-aware redaction of
              all sensitive information in just one click
            </div>
          </div>
          <div>
            <div className="text-3xl">📄</div>
            <div className="font-bold mt-4 mb-2 text-lg">Built for PDFs</div>
            <div className=" text-gray-600">
              Powered by OCR, Redax works perfectly with scanned pages,
              multi-column layouts and forms without any formatting loss
            </div>
          </div>
          <div>
            <div className="text-3xl">🔓</div>
            <div className="font-bold mt-4 mb-2 text-lg">Accessibility</div>
            <div className=" text-gray-600">
              Meant for both personal and enterprise use, Redax lets you redact
              your documents in seconds free of cost
            </div>
          </div>
        </div>
      </section>

      <div ref={uploadRef} className="mt-15 pt-25 pb-15 bg-orange-50">
        <Upload />
      </div>

      <section className="bg-gray-100 h-70 w-screen px-15 py-12">
        <div className="grid grid-cols-2 items-start">
          <div>
            {isAuthenticated ? (
              <>
                <div className="text-3xl font-bold pt-3 pr-4">
                  You can now view all your redacted documents in one place!
                </div>

                <Link to="/history">
                  <button
                    onClick={() => console.log("/login")}
                    className="bg-orange-500 hover:bg-orange-600 text-white text-lg font-semibold px-6 py-3 mt-4 rounded-md"
                  >
                    View History
                  </button>
                </Link>
              </>
            ) : (
              <>
                <div className="text-2xl font-bold pt-3">
                  Want to save your redacted documents?
                </div>
                <div className="mt-2 mb-6 text-gray-700">
                  Create a free account to access your history anytime from any
                  device.
                </div>
                <Link to="/signin">
                  <button
                    onClick={() => console.log("/login")}
                    className="bg-orange-500 hover:bg-orange-600 text-white text-lg font-semibold px-6 py-3 rounded-md"
                  >
                    Sign Up / Log In
                  </button>
                </Link>
              </>
            )}
          </div>

          <div className="text-right pt-14">
            <div className="text-6xl font-extrabold mt-3">redax</div>
            <p className="pt-2 text-xs text-gray-400">
              © {new Date().getFullYear()} Redax. All rights reserved.
            </p>
          </div>
        </div>
      </section>
    </>
  );
};

export default Home;
