import { Link, useNavigate } from "react-router-dom";
import { FaClinicMedical, FaUserMd, FaBars, FaTimes } from "react-icons/fa";
import { useState } from "react";
import { useAuth } from "../context/AuthContext";

const Navbar = () => {
  const [isOpen, setIsOpen] = useState(false);
  const { currentUser, logout } = useAuth();
  const navigate = useNavigate();

  const handleLogout = () => {
    logout();
    navigate("/");
  };

  const getDashboardPath = () => {
    if (!currentUser) return "/";
    if (currentUser.role === "admin") return "/admin";
    if (currentUser.role === "clinic") return "/clinic";
    return "/patient";
  };

  return (
      <nav className="sticky top-0 z-50 bg-blue-600 shadow-md border-b border-gray-200 text-white">
        <div className="container mx-auto px-4 py-3">
          {/* Desktop Header */}
          <div className="flex items-center justify-between">
            <Link
                to="/"
                className="flex items-center space-x-3 hover:scale-105 transform transition-transform duration-300"
            >
              <FaClinicMedical className="text-2xl text-blue-200 drop-shadow-sm" />
              <span className="text-xl md:text-2xl font-bold tracking-wide">HealthHub</span>
            </Link>

            <span className="hidden md:block absolute left-1/2 transform -translate-x-1/2 text-lg font-semibold drop-shadow-md tracking-wide">
              Your healthcare connection 💙
            </span>

            <div className="hidden md:flex items-center space-x-6 font-medium">
              <Link to="/clinics" className="flex items-center gap-2 hover:text-blue-200 transition">
                <FaUserMd className="text-lg" />
                <span>Find Clinics</span>
              </Link>

              {currentUser && (
                  <Link to={getDashboardPath()} className="hover:text-blue-200 transition">
                    Dashboard
                  </Link>
              )}

              {currentUser ? (
                  <>
                    <span className="text-sm">Hi, {currentUser.username}</span>
                    <button
                        onClick={handleLogout}
                        className="bg-red-500 hover:bg-red-600 text-white px-3 py-1 rounded text-sm"
                    >
                      Logout
                    </button>
                  </>
              ) : (
                  <>
                    <Link to="/login" className="text-sm hover:text-blue-200">
                      Login
                    </Link>
                    <Link to="/register" className="text-sm hover:text-blue-200">
                      Register
                    </Link>
                  </>
              )}
            </div>

            {/* Mobile Menu Toggle */}
            <button
                onClick={() => setIsOpen(!isOpen)}
                className="md:hidden focus:outline-none"
                aria-label="Toggle menu"
            >
              {isOpen ? <FaTimes className="h-6 w-6" /> : <FaBars className="h-6 w-6" />}
            </button>
          </div>

          {/* Mobile Dropdown */}
          {isOpen && (
              <div className="md:hidden bg-blue-700 mt-2 rounded-lg shadow-lg text-center space-y-2 pb-4 pt-2">
                <Link
                    to="/clinics"
                    className="block py-2 hover:bg-blue-600"
                    onClick={() => setIsOpen(false)}
                >
                  <div className="flex items-center justify-center gap-3">
                    <FaUserMd />
                    <span>Find Clinics</span>
                  </div>
                </Link>

                {currentUser && (
                    <Link
                        to={getDashboardPath()}
                        className="block py-2 hover:bg-blue-600"
                        onClick={() => setIsOpen(false)}
                    >
                      Dashboard
                    </Link>
                )}

                {currentUser ? (
                    <>
                      <div className="text-sm">Hi, {currentUser.username}</div>
                      <button
                          onClick={() => {
                            handleLogout();
                            setIsOpen(false);
                          }}
                          className="bg-red-500 hover:bg-red-600 px-4 py-1 rounded text-sm mt-2"
                      >
                        Logout
                      </button>
                    </>
                ) : (
                    <>
                      <Link
                          to="/login"
                          className="block py-2 hover:bg-blue-600"
                          onClick={() => setIsOpen(false)}
                      >
                        Login
                      </Link>
                      <Link
                          to="/register"
                          className="block py-2 hover:bg-blue-600"
                          onClick={() => setIsOpen(false)}
                      >
                        Register
                      </Link>
                    </>
                )}
              </div>
          )}
        </div>
      </nav>
  );
};

export default Navbar;