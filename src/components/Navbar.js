import React from "react";
import { Link, useNavigate, useLocation } from "react-router-dom";
import { Building2, LogOut, Settings, Package, Plus } from "lucide-react";
import { authUtils } from "./authutils";

const Navbar = ({ user, onLogout, showFullNav = false }) => {
  const navigate = useNavigate();
  const location = useLocation();

  const handleLogout = async () => {
    try {
      if (onLogout) {
        await onLogout();
      } else {
        await authUtils.logout(navigate);
      }
    } catch (error) {
      console.error("Logout error:", error);
      navigate("/login");
    }
  };

  const isActive = (path) => location.pathname === path;

  if (!showFullNav) {
    // Simple navbar for login/success pages
    return (
      <nav className="bg-white shadow-sm border-b">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between h-16">
            <div className="flex items-center">
              <Building2 className="h-8 w-8 text-purple-600 mr-3" />
              <span className="text-xl font-bold text-gray-800">
                Supplier Portal
              </span>
            </div>
            {user && (
              <div className="flex items-center">
                <button
                  onClick={handleLogout}
                  className="flex items-center gap-2 px-4 py-2 text-red-600 hover:text-red-800 hover:bg-red-50 rounded-lg transition-colors"
                >
                  <LogOut size={18} />
                  Logout
                </button>
              </div>
            )}
          </div>
        </div>
      </nav>
    );
  }

  // Full navbar for authenticated pages
  return (
    <nav className="bg-white shadow-sm border-b">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between h-16">
          <div className="flex items-center">
            <Building2 className="h-8 w-8 text-purple-600 mr-3" />
            <span className="text-xl font-bold text-gray-800">
              Supplier Portal
            </span>
          </div>

          <div className="flex items-center space-x-1">
            {user?.hasSupplierData && (
              <>
                <Link
                  to="/dashboard"
                  className={`flex items-center gap-2 px-4 py-2 rounded-lg transition-colors ${
                    isActive("/dashboard")
                      ? "bg-purple-100 text-purple-700 font-medium"
                      : "text-gray-600 hover:text-gray-800 hover:bg-gray-100"
                  }`}
                >
                  <Settings size={18} />
                  Dashboard
                </Link>

                <Link
                  to="/add-products"
                  className={`flex items-center gap-2 px-4 py-2 rounded-lg transition-colors ${
                    isActive("/add-products") || isActive("/")
                      ? "bg-green-100 text-green-700 font-medium"
                      : "text-gray-600 hover:text-gray-800 hover:bg-gray-100"
                  }`}
                >
                  <Plus size={18} />
                  Add Products
                </Link>
              </>
            )}

            <div className="flex items-center gap-2 ml-4 pl-4 border-l border-gray-200">
              <span className="text-sm text-gray-600">
                {user?.companyName || user?.phone}
              </span>
              <button
                onClick={handleLogout}
                className="flex items-center gap-2 px-3 py-2 text-red-600 hover:text-red-800 hover:bg-red-50 rounded-lg transition-colors"
              >
                <LogOut size={16} />
                Logout
              </button>
            </div>
          </div>
        </div>
      </div>
    </nav>
  );
};

export default Navbar;
