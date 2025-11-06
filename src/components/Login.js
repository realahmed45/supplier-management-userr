import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import {
  Phone,
  ArrowRight,
  MessageCircle,
  Shield,
  CheckCircle,
  AlertCircle,
  Eye,
  EyeOff,
  Smartphone,
  LogOut,
} from "lucide-react";
import axios from "axios";
import { authUtils } from "./authutils";

const API_BASE_URL = "https://supplier-mangement-backend.onrender.com/api";

const Login = ({ onLogin, onLogout, isLoggedIn }) => {
  const [step, setStep] = useState("phone"); // 'phone' or 'otp'
  const [phoneNumber, setPhoneNumber] = useState("");
  const [otp, setOtp] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState("");
  const [showOtp, setShowOtp] = useState(false);
  const [resendTimer, setResendTimer] = useState(0);
  const navigate = useNavigate();

  // Start countdown timer
  const startResendTimer = () => {
    setResendTimer(60);
    const timer = setInterval(() => {
      setResendTimer((prev) => {
        if (prev <= 1) {
          clearInterval(timer);
          return 0;
        }
        return prev - 1;
      });
    }, 1000);
  };

  // Logout function
  const handleLogout = async () => {
    setIsLoading(true);
    try {
      await authUtils.logout(navigate);

      // Call parent logout handler
      if (onLogout) {
        onLogout();
      }

      // Reset component state
      setStep("phone");
      setPhoneNumber("");
      setOtp("");
      setError("");
      setShowOtp(false);
      setResendTimer(0);
    } catch (error) {
      console.error("Logout error:", error);
    } finally {
      setIsLoading(false);
    }
  };

  const handlePhoneSubmit = async (e) => {
    e.preventDefault();
    setError("");

    // Basic phone validation
    const cleanPhone = phoneNumber.replace(/[^0-9]/g, "");
    if (cleanPhone.length < 10) {
      setError("Please enter a valid phone number");
      return;
    }

    setIsLoading(true);

    try {
      console.log("Sending OTP request for phone:", phoneNumber);

      const response = await axios.post(`${API_BASE_URL}/auth/generate-otp`, {
        phone: phoneNumber,
      });

      console.log("OTP response:", response.data);

      if (response.data.success) {
        setStep("otp");
        startResendTimer();

        // Show OTP in development mode
        if (response.data.otp) {
          console.log("Development OTP:", response.data.otp);
        }
      } else {
        setError(response.data.message || "Failed to send OTP");
      }
    } catch (error) {
      console.error("OTP generation error:", error);
      setError(
        error.response?.data?.message || "Failed to send OTP. Please try again."
      );
    } finally {
      setIsLoading(false);
    }
  };

  const handleOtpSubmit = async (e) => {
    e.preventDefault();
    setError("");

    if (otp.length !== 6) {
      setError("Please enter a valid 6-digit OTP");
      return;
    }

    setIsLoading(true);

    try {
      console.log("Verifying OTP:", otp, "for phone:", phoneNumber);

      const response = await axios.post(`${API_BASE_URL}/auth/verify-otp`, {
        phone: phoneNumber,
        otp: otp,
      });

      console.log("OTP verification response:", response.data);

      if (response.data.success) {
        // Store token using auth utility
        console.log(
          "Login successful, storing token:",
          response.data.token.substring(0, 20) + "..."
        );
        authUtils.setToken(response.data.token);

        // Verify the token was stored
        const storedToken = authUtils.getToken();
        console.log("Token stored successfully:", !!storedToken);

        // Call parent login handler
        if (onLogin) {
          onLogin(response.data.user);
        }

        // Navigate based on user state
        if (response.data.user.hasSupplierData) {
          console.log("User has supplier data, navigating to dashboard");
          navigate("/dashboard");
        } else {
          console.log("User is new, navigating to product selection");
          navigate("/");
        }
      } else {
        setError(response.data.message || "Invalid OTP");
      }
    } catch (error) {
      console.error("OTP verification error:", error);
      setError(
        error.response?.data?.message || "Invalid OTP. Please try again."
      );
    } finally {
      setIsLoading(false);
    }
  };

  const handleResendOtp = async () => {
    if (resendTimer > 0) return;

    setError("");
    setIsLoading(true);

    try {
      const response = await axios.post(`${API_BASE_URL}/auth/generate-otp`, {
        phone: phoneNumber,
      });

      if (response.data.success) {
        startResendTimer();
        setError(""); // Clear any previous errors

        // Show success message briefly
        setError("OTP sent successfully!");
        setTimeout(() => setError(""), 3000);

        // Show OTP in development mode
        if (response.data.otp) {
          console.log("Development OTP:", response.data.otp);
        }
      } else {
        setError(response.data.message || "Failed to resend OTP");
      }
    } catch (error) {
      setError("Failed to resend OTP. Please try again.");
    } finally {
      setIsLoading(false);
    }
  };

  const formatPhoneDisplay = (phone) => {
    const cleaned = phone.replace(/[^0-9]/g, "");
    if (cleaned.length >= 4) {
      return `+${cleaned.slice(0, -4).replace(/./g, "*")}${cleaned.slice(-4)}`;
    }
    return phone;
  };

  // If user is logged in, show logout option instead of login form
  if (isLoggedIn) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-purple-50 to-pink-100 flex items-center justify-center p-4">
        <div className="w-full max-w-md">
          <div className="text-center mb-8">
            <div className="bg-white rounded-full p-4 w-20 h-20 mx-auto mb-4 shadow-lg">
              <Shield className="w-12 h-12 text-purple-600 mx-auto" />
            </div>
            <h1 className="text-3xl font-bold text-gray-800 mb-2">
              Supplier Portal
            </h1>
            <p className="text-gray-600">You are already logged in</p>
          </div>

          <div className="bg-white rounded-2xl shadow-xl p-8 border border-gray-100">
            <div className="text-center space-y-6">
              <p className="text-gray-700">
                You are currently logged into the Supplier Portal.
              </p>

              <div className="space-y-3">
                <button
                  onClick={() => navigate("/dashboard")}
                  className="w-full bg-gradient-to-r from-purple-600 to-pink-600 text-white font-semibold py-3 px-6 rounded-xl hover:from-purple-700 hover:to-pink-700 focus:outline-none focus:ring-4 focus:ring-purple-300 transition-all duration-200 flex items-center justify-center gap-2"
                >
                  Go to Dashboard
                  <ArrowRight size={20} />
                </button>

                <button
                  onClick={handleLogout}
                  disabled={isLoading}
                  className="w-full bg-gray-600 text-white font-semibold py-3 px-6 rounded-xl hover:bg-gray-700 focus:outline-none focus:ring-4 focus:ring-gray-300 disabled:opacity-50 disabled:cursor-not-allowed transition-all duration-200 flex items-center justify-center gap-2"
                >
                  {isLoading ? (
                    <>
                      <div className="animate-spin rounded-full h-5 w-5 border-t-2 border-b-2 border-white"></div>
                      Logging out...
                    </>
                  ) : (
                    <>
                      <LogOut size={20} />
                      Logout
                    </>
                  )}
                </button>
              </div>
            </div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-purple-50 to-pink-100 flex items-center justify-center p-4">
      <div className="w-full max-w-md">
        {/* Header */}
        <div className="text-center mb-8">
          <div className="bg-white rounded-full p-4 w-20 h-20 mx-auto mb-4 shadow-lg">
            <Shield className="w-12 h-12 text-purple-600 mx-auto" />
          </div>
          <h1 className="text-3xl font-bold text-gray-800 mb-2">
            Supplier Portal
          </h1>
          <p className="text-gray-600">
            {step === "phone"
              ? "Enter your phone number to get started"
              : "Enter the verification code sent to your WhatsApp"}
          </p>
        </div>

        {/* Main Card */}
        <div className="bg-white rounded-2xl shadow-xl p-8 border border-gray-100">
          {step === "phone" ? (
            /* Phone Number Step */
            <form onSubmit={handlePhoneSubmit} className="space-y-6">
              <div>
                <label className="block text-sm font-semibold text-gray-700 mb-2">
                  Phone Number
                </label>
                <div className="relative">
                  <Phone
                    className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400"
                    size={20}
                  />
                  <input
                    type="tel"
                    value={phoneNumber}
                    onChange={(e) => setPhoneNumber(e.target.value)}
                    className="w-full pl-10 pr-4 py-3 border-2 border-gray-200 rounded-xl focus:ring-2 focus:ring-purple-500 focus:border-transparent transition-all duration-200"
                    placeholder="+62 812 3456 7890"
                    required
                  />
                </div>
                <p className="text-xs text-gray-500 mt-2">
                  We'll send a verification code to your WhatsApp
                </p>
              </div>

              {error && (
                <div className="bg-red-50 border border-red-200 rounded-xl p-4">
                  <p className="text-red-600 flex items-center gap-2 text-sm">
                    <AlertCircle size={16} />
                    {error}
                  </p>
                </div>
              )}

              <button
                type="submit"
                disabled={isLoading || !phoneNumber.trim()}
                className="w-full bg-gradient-to-r from-purple-600 to-pink-600 text-white font-semibold py-3 px-6 rounded-xl hover:from-purple-700 hover:to-pink-700 focus:outline-none focus:ring-4 focus:ring-purple-300 disabled:opacity-50 disabled:cursor-not-allowed transition-all duration-200 flex items-center justify-center gap-2"
              >
                {isLoading ? (
                  <>
                    <div className="animate-spin rounded-full h-5 w-5 border-t-2 border-b-2 border-white"></div>
                    Sending OTP...
                  </>
                ) : (
                  <>
                    Send Verification Code
                    <ArrowRight size={20} />
                  </>
                )}
              </button>
            </form>
          ) : (
            /* OTP Verification Step */
            <form onSubmit={handleOtpSubmit} className="space-y-6">
              <div className="text-center mb-6">
                <Smartphone className="w-16 h-16 text-green-500 mx-auto mb-4" />
                <h3 className="text-lg font-bold text-gray-800 mb-2">
                  Check Your WhatsApp
                </h3>
                <p className="text-gray-600 text-sm">
                  We sent a 6-digit code to
                </p>
                <p className="font-semibold text-gray-800">
                  {formatPhoneDisplay(phoneNumber)}
                </p>
              </div>

              <div>
                <label className="block text-sm font-semibold text-gray-700 mb-2">
                  Verification Code
                </label>
                <div className="relative">
                  <input
                    type={showOtp ? "text" : "password"}
                    value={otp}
                    onChange={(e) =>
                      setOtp(e.target.value.replace(/[^0-9]/g, "").slice(0, 6))
                    }
                    className="w-full px-4 py-3 border-2 border-gray-200 rounded-xl focus:ring-2 focus:ring-purple-500 focus:border-transparent transition-all duration-200 text-center text-2xl font-mono tracking-widest"
                    placeholder="000000"
                    maxLength={6}
                    required
                  />
                  <button
                    type="button"
                    onClick={() => setShowOtp(!showOtp)}
                    className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-400 hover:text-gray-600"
                  >
                    {showOtp ? <EyeOff size={20} /> : <Eye size={20} />}
                  </button>
                </div>
              </div>

              {error && (
                <div
                  className={`border rounded-xl p-4 ${
                    error.includes("sent successfully")
                      ? "bg-green-50 border-green-200"
                      : "bg-red-50 border-red-200"
                  }`}
                >
                  <p
                    className={`flex items-center gap-2 text-sm ${
                      error.includes("sent successfully")
                        ? "text-green-600"
                        : "text-red-600"
                    }`}
                  >
                    {error.includes("sent successfully") ? (
                      <CheckCircle size={16} />
                    ) : (
                      <AlertCircle size={16} />
                    )}
                    {error}
                  </p>
                </div>
              )}

              <button
                type="submit"
                disabled={isLoading || otp.length !== 6}
                className="w-full bg-gradient-to-r from-purple-600 to-pink-600 text-white font-semibold py-3 px-6 rounded-xl hover:from-purple-700 hover:to-pink-700 focus:outline-none focus:ring-4 focus:ring-purple-300 disabled:opacity-50 disabled:cursor-not-allowed transition-all duration-200 flex items-center justify-center gap-2"
              >
                {isLoading ? (
                  <>
                    <div className="animate-spin rounded-full h-5 w-5 border-t-2 border-b-2 border-white"></div>
                    Verifying...
                  </>
                ) : (
                  <>
                    <CheckCircle size={20} />
                    Verify Code
                  </>
                )}
              </button>

              <div className="text-center space-y-3">
                <button
                  type="button"
                  onClick={handleResendOtp}
                  disabled={resendTimer > 0 || isLoading}
                  className="text-purple-600 hover:text-purple-700 font-medium disabled:text-gray-400 disabled:cursor-not-allowed transition-colors"
                >
                  {resendTimer > 0
                    ? `Resend code in ${resendTimer}s`
                    : "Resend verification code"}
                </button>

                <button
                  type="button"
                  onClick={() => {
                    setStep("phone");
                    setOtp("");
                    setError("");
                  }}
                  className="block w-full text-gray-600 hover:text-gray-800 font-medium transition-colors"
                >
                  Change phone number
                </button>
              </div>
            </form>
          )}
        </div>

        {/* Help Section */}
        <div className="bg-white rounded-xl shadow-lg p-4 mt-6 border border-gray-100">
          <div className="flex items-center gap-3">
            <div className="bg-purple-100 p-2 rounded-full">
              <MessageCircle className="text-purple-600" size={16} />
            </div>
            <div className="flex-1">
              <h3 className="font-bold text-gray-800 text-sm">Need Help?</h3>
              <p className="text-xs text-gray-600">Contact support</p>
            </div>
            <button className="bg-purple-600 text-white px-3 py-1 rounded-lg text-xs hover:bg-purple-700 transition-colors">
              Call +620864322626
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Login;
