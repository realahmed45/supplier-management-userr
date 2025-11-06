import axios from "axios";

const API_BASE_URL = "https://supplier-mangement-backend.onrender.com/api";

// Simple logout function that can be used anywhere in your app
export const logout = async (navigate) => {
  try {
    const token = localStorage.getItem("authToken");

    if (token) {
      // Call logout API
      await axios.post(
        `${API_BASE_URL}/auth/logout`,
        {},
        {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        }
      );
    }
  } catch (error) {
    console.error("Logout API error:", error);
    // Continue with logout even if API call fails
  } finally {
    // Clear local storage
    localStorage.removeItem("authToken");

    // Navigate to login page
    if (navigate) {
      navigate("/login");
    } else {
      // Fallback: redirect using window.location
      window.location.href = "/login";
    }
  }
};

// React hook version for easier use in components
export const useLogout = () => {
  const handleLogout = async (navigate) => {
    await logout(navigate);
  };

  return handleLogout;
};

export default logout;
