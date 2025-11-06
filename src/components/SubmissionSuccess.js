import React, { useEffect, useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import {
  CheckCircle,
  Building2,
  Mail,
  Clock,
  Star,
  ArrowRight,
  Home,
  FileText,
  Users,
  Phone,
  MapPin,
  Award,
  Package,
  Warehouse,
  Calendar,
  LogOut,
  Settings,
} from "lucide-react";
import { authUtils } from "./authutils";

const SubmissionSuccess = ({ onLogout }) => {
  const [showConfetti, setShowConfetti] = useState(true);
  const [currentStep, setCurrentStep] = useState(0);
  const navigate = useNavigate();

  useEffect(() => {
    // Hide confetti effect after 3 seconds
    const timer = setTimeout(() => {
      setShowConfetti(false);
    }, 3000);

    // Animate timeline steps
    const stepTimer = setInterval(() => {
      setCurrentStep((prev) => (prev < 2 ? prev + 1 : prev));
    }, 1000);

    return () => {
      clearTimeout(timer);
      clearInterval(stepTimer);
    };
  }, []);

  const handleLogout = async () => {
    try {
      await authUtils.logout(navigate);
      if (onLogout) {
        onLogout();
      }
    } catch (error) {
      console.error("Logout error:", error);
      // Even if logout fails, redirect
      navigate("/login");
    }
  };

  const goToDashboard = () => {
    navigate("/dashboard");
  };

  const applicationId = `SP-${Date.now().toString().slice(-6)}`;
  const submissionDate = new Date().toLocaleDateString("en-US", {
    year: "numeric",
    month: "long",
    day: "numeric",
    hour: "2-digit",
    minute: "2-digit",
  });

  return (
    <div className="min-h-screen bg-gradient-to-br from-green-50 via-blue-50 to-purple-50 p-6 relative overflow-hidden">
      {/* Header with logout */}
      <div className="absolute top-4 right-4 z-50">
        <div className="flex items-center gap-4">
          <button
            onClick={goToDashboard}
            className="flex items-center gap-2 px-4 py-2 bg-white text-gray-600 hover:text-gray-800 hover:bg-gray-100 rounded-lg transition-colors shadow-md"
          >
            <Settings size={20} />
            Dashboard
          </button>
          <button
            onClick={handleLogout}
            className="flex items-center gap-2 px-4 py-2 bg-white text-red-600 hover:text-red-800 hover:bg-red-50 rounded-lg transition-colors shadow-md"
          >
            <LogOut size={20} />
            Logout
          </button>
        </div>
      </div>

      {/* Animated Background Elements */}
      <div className="absolute inset-0 overflow-hidden pointer-events-none">
        <div className="absolute -top-4 -right-4 w-24 h-24 bg-gradient-to-br from-blue-400 to-purple-400 rounded-full opacity-20 animate-bounce"></div>
        <div className="absolute top-1/4 -left-8 w-16 h-16 bg-gradient-to-br from-green-400 to-blue-400 rounded-full opacity-20 animate-pulse"></div>
        <div
          className="absolute bottom-1/4 right-1/4 w-20 h-20 bg-gradient-to-br from-purple-400 to-pink-400 rounded-full opacity-20 animate-bounce"
          style={{ animationDelay: "1s" }}
        ></div>
      </div>

      {/* Confetti Effect */}
      {showConfetti && (
        <div className="absolute inset-0 pointer-events-none z-10">
          {[...Array(60)].map((_, i) => (
            <div
              key={i}
              className="absolute animate-bounce"
              style={{
                left: `${Math.random() * 100}%`,
                top: `${Math.random() * 100}%`,
                animationDelay: `${Math.random() * 3}s`,
                animationDuration: `${2 + Math.random() * 3}s`,
              }}
            >
              <div
                className={`w-3 h-3 rounded-full shadow-lg ${
                  [
                    "bg-green-400",
                    "bg-blue-400",
                    "bg-purple-400",
                    "bg-yellow-400",
                    "bg-pink-400",
                    "bg-indigo-400",
                  ][Math.floor(Math.random() * 6)]
                }`}
              />
            </div>
          ))}
        </div>
      )}

      <div className="max-w-6xl mx-auto relative z-20 pt-16">
        {/* Success Header */}
        <div className="text-center mb-12">
          <div className="relative inline-block mb-8">
            <div className="absolute inset-0 bg-green-200 rounded-full animate-ping opacity-30"></div>
            <div
              className="absolute inset-2 bg-green-300 rounded-full animate-ping opacity-40"
              style={{ animationDelay: "0.5s" }}
            ></div>
            <div className="relative bg-white rounded-full p-8 shadow-2xl border-4 border-green-100">
              <CheckCircle className="h-20 w-20 text-green-600 mx-auto animate-pulse" />
            </div>
          </div>

          <h1 className="text-4xl md:text-6xl font-bold bg-gradient-to-r from-green-600 via-blue-600 to-purple-600 bg-clip-text text-transparent mb-6 animate-fade-in">
            Application Submitted Successfully! 🎉
          </h1>

          <p className="text-xl md:text-2xl text-gray-600 max-w-3xl mx-auto leading-relaxed mb-8">
            Congratulations! You've successfully joined our supplier network.
            Your application has been received and is now under comprehensive
            review by our expert procurement team.
          </p>

          {/* Application Details Card */}
          <div className="bg-white rounded-2xl shadow-xl p-6 max-w-md mx-auto border border-gray-100">
            <h3 className="text-lg font-bold text-gray-800 mb-4">
              Application Details
            </h3>
            <div className="space-y-2 text-sm">
              <div className="flex justify-between">
                <span className="text-gray-600">Application ID:</span>
                <span className="font-mono font-bold text-blue-600">
                  {applicationId}
                </span>
              </div>
              <div className="flex justify-between">
                <span className="text-gray-600">Submitted:</span>
                <span className="font-medium text-gray-800">
                  {submissionDate}
                </span>
              </div>
              <div className="flex justify-between">
                <span className="text-gray-600">Status:</span>
                <span className="font-medium text-green-600 flex items-center gap-1">
                  <div className="w-2 h-2 bg-green-500 rounded-full animate-pulse"></div>
                  Under Review
                </span>
              </div>
            </div>
          </div>
        </div>

        {/* Process Status Cards */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-12">
          <div className="bg-white rounded-2xl shadow-xl p-8 text-center border-l-4 border-green-500 transform hover:scale-105 transition-all duration-300">
            <div className="bg-gradient-to-br from-green-100 to-green-200 rounded-full p-4 w-fit mx-auto mb-6">
              <FileText className="h-8 w-8 text-green-600" />
            </div>
            <h3 className="text-xl font-bold text-gray-800 mb-3">
              Application Received
            </h3>
            <p className="text-green-600 font-medium">✅ Complete</p>
          </div>

          <div className="bg-white rounded-2xl shadow-xl p-8 text-center border-l-4 border-yellow-500 transform hover:scale-105 transition-all duration-300">
            <div className="bg-gradient-to-br from-yellow-100 to-yellow-200 rounded-full p-4 w-fit mx-auto mb-6">
              <Clock className="h-8 w-8 text-yellow-600" />
            </div>
            <h3 className="text-xl font-bold text-gray-800 mb-3">
              Under Review
            </h3>
            <p className="text-gray-600 leading-relaxed mb-4">
              Your application is under review. Please allow 3 to 5 business
              days. If you need any help with adding more products or have
              questions about your application, feel free to call us.
            </p>
            <div className="flex items-center justify-center">
              <div className="w-5 h-5 border-2 border-yellow-500 border-t-transparent rounded-full animate-spin mr-2"></div>
              <span className="text-yellow-600 font-medium">In Progress</span>
            </div>
          </div>

          <div className="bg-white rounded-2xl shadow-xl p-8 text-center border-l-4 border-blue-500 transform hover:scale-105 transition-all duration-300">
            <div className="bg-gradient-to-br from-blue-100 to-blue-200 rounded-full p-4 w-fit mx-auto mb-6">
              <Users className="h-8 w-8 text-blue-600" />
            </div>
            <h3 className="text-xl font-bold text-gray-800 mb-3">
              Partnership Launch
            </h3>
            <p className="text-gray-600 leading-relaxed">
              Upon approval, you'll gain full access to our supplier portal and
              begin receiving purchase orders.
            </p>
          </div>
        </div>

        {/* Next Steps */}
        <div className="bg-white rounded-2xl shadow-xl p-10 mb-12">
          <h2 className="text-3xl font-bold text-gray-800 mb-8 flex items-center gap-3">
            <Star className="text-yellow-500" />
            What Happens Next?
          </h2>

          <div className="grid grid-cols-1 lg:grid-cols-2 gap-12">
            <div className="space-y-6">
              <div className="flex items-start gap-4">
                <div className="bg-gradient-to-br from-blue-500 to-blue-600 text-white rounded-full p-3 text-lg font-bold min-w-[3rem] h-12 flex items-center justify-center shadow-lg">
                  1
                </div>
                <div>
                  <h4 className="text-lg font-bold text-gray-800 mb-2">
                    Document Verification
                  </h4>
                  <p className="text-gray-600 leading-relaxed">
                    Our team will verify your company information and product
                    details to ensure compliance with our standards.
                  </p>
                </div>
              </div>

              <div className="flex items-start gap-4">
                <div className="bg-gradient-to-br from-blue-500 to-blue-600 text-white rounded-full p-3 text-lg font-bold min-w-[3rem] h-12 flex items-center justify-center shadow-lg">
                  2
                </div>
                <div>
                  <h4 className="text-lg font-bold text-gray-800 mb-2">
                    Quality Assessment
                  </h4>
                  <p className="text-gray-600 leading-relaxed">
                    We'll evaluate your product quality and capabilities to
                    ensure they meet our procurement requirements.
                  </p>
                </div>
              </div>

              <div className="flex items-start gap-4">
                <div className="bg-gradient-to-br from-blue-500 to-blue-600 text-white rounded-full p-3 text-lg font-bold min-w-[3rem] h-12 flex items-center justify-center shadow-lg">
                  3
                </div>
                <div>
                  <h4 className="text-lg font-bold text-gray-800 mb-2">
                    Compliance Check
                  </h4>
                  <p className="text-gray-600 leading-relaxed">
                    Final compliance verification to ensure all regulatory and
                    business requirements are met.
                  </p>
                </div>
              </div>
            </div>

            <div className="space-y-6">
              <div className="flex items-start gap-4">
                <div className="bg-gradient-to-br from-green-500 to-green-600 text-white rounded-full p-3 text-lg font-bold min-w-[3rem] h-12 flex items-center justify-center shadow-lg">
                  4
                </div>
                <div>
                  <h4 className="text-lg font-bold text-gray-800 mb-2">
                    Final Approval
                  </h4>
                  <p className="text-gray-600 leading-relaxed">
                    Upon successful review, you'll receive official approval
                    notification with detailed onboarding instructions and next
                    steps.
                  </p>
                </div>
              </div>

              <div className="flex items-start gap-4">
                <div className="bg-gradient-to-br from-green-500 to-green-600 text-white rounded-full p-3 text-lg font-bold min-w-[3rem] h-12 flex items-center justify-center shadow-lg">
                  5
                </div>
                <div>
                  <h4 className="text-lg font-bold text-gray-800 mb-2">
                    Onboarding Process
                  </h4>
                  <p className="text-gray-600 leading-relaxed">
                    We'll provide comprehensive access to our supplier portal,
                    training materials, and dedicated account management
                    support.
                  </p>
                </div>
              </div>

              <div className="flex items-start gap-4">
                <div className="bg-gradient-to-br from-green-500 to-green-600 text-white rounded-full p-3 text-lg font-bold min-w-[3rem] h-12 flex items-center justify-center shadow-lg">
                  6
                </div>
                <div>
                  <h4 className="text-lg font-bold text-gray-800 mb-2">
                    Partnership Launch
                  </h4>
                  <p className="text-gray-600 leading-relaxed">
                    Begin receiving purchase orders and conducting business with
                    us through our streamlined procurement process.
                  </p>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Contact Information */}
        <div className="bg-gradient-to-r from-blue-600 via-purple-600 to-indigo-600 rounded-2xl shadow-xl p-10 text-white mb-12">
          <div className="text-center mb-8">
            <Mail className="h-16 w-16 mx-auto mb-6 opacity-90" />
            <h3 className="text-2xl font-bold mb-4">Stay Connected</h3>
            <p className="text-lg mb-8 opacity-90 max-w-2xl mx-auto leading-relaxed">
              Our team is here to support you throughout the review process.
              Feel free to reach out with any questions.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
            <div className="flex flex-col items-center text-center p-4 bg-white bg-opacity-10 rounded-xl backdrop-blur-sm">
              <Mail className="h-8 w-8 mb-3" />
              <h4 className="font-bold mb-1">Email</h4>
              <span className="text-sm opacity-90">suppliers@company.com</span>
            </div>
            <div className="flex flex-col items-center text-center p-4 bg-white bg-opacity-10 rounded-xl backdrop-blur-sm">
              <Phone className="h-8 w-8 mb-3" />
              <h4 className="font-bold mb-1">Phone</h4>
              <span className="text-sm opacity-90">+620864322626</span>
            </div>
            <div className="flex flex-col items-center text-center p-4 bg-white bg-opacity-10 rounded-xl backdrop-blur-sm">
              <Building2 className="h-8 w-8 mb-3" />
              <h4 className="font-bold mb-1">Department</h4>
              <span className="text-sm opacity-90">Procurement Team</span>
            </div>
            <div className="flex flex-col items-center text-center p-4 bg-white bg-opacity-10 rounded-xl backdrop-blur-sm">
              <MapPin className="h-8 w-8 mb-3" />
              <h4 className="font-bold mb-1">Location</h4>
              <span className="text-sm opacity-90">Indonesia</span>
            </div>
          </div>
        </div>

        {/* Additional Resources */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-12">
          <div className="bg-white rounded-2xl shadow-lg p-6 text-center hover:shadow-xl transition-all duration-300">
            <Award className="h-12 w-12 text-yellow-500 mx-auto mb-4" />
            <h4 className="font-bold text-gray-800 mb-2">Quality Standards</h4>
            <p className="text-gray-600 text-sm">
              Learn about our quality requirements and certification processes
              by calling us.
            </p>
          </div>

          <div className="bg-white rounded-2xl shadow-lg p-6 text-center hover:shadow-xl transition-all duration-300">
            <Package className="h-12 w-12 text-blue-500 mx-auto mb-4" />
            <h4 className="font-bold text-gray-800 mb-2">Product Guidelines</h4>
            <p className="text-gray-600 text-sm">
              You can add new products at any time and upload additional
              documentation whenever needed.
            </p>
          </div>

          <div className="bg-white rounded-2xl shadow-lg p-6 text-center hover:shadow-xl transition-all duration-300">
            <Warehouse className="h-12 w-12 text-green-500 mx-auto mb-4" />
            <h4 className="font-bold text-gray-800 mb-2">Logistics Info</h4>
            <p className="text-gray-600 text-sm">
              All deliveries are conducted under EXW (Ex Works) or DDP
              (Delivered Duty Paid) Incoterms, subject to mutual agreement.
            </p>
          </div>

          <div className="bg-white rounded-2xl shadow-lg p-6 text-center hover:shadow-xl transition-all duration-300">
            <Users className="h-12 w-12 text-purple-500 mx-auto mb-4" />
            <h4 className="font-bold text-gray-800 mb-2">Support Center</h4>
            <p className="text-gray-600 text-sm">
              Access our comprehensive supplier support resources. Call us at
              +620864322626 for immediate assistance.
            </p>
          </div>
        </div>

        {/* Action Buttons */}
        <div className="flex flex-col sm:flex-row gap-6 justify-center items-center mb-12">
          <button
            onClick={goToDashboard}
            className="inline-flex items-center gap-3 px-10 py-4 bg-gradient-to-r from-blue-600 to-purple-600 text-white font-bold rounded-2xl hover:from-blue-700 hover:to-purple-700 hover:shadow-lg transition-all duration-300 shadow-md"
          >
            <Settings size={24} />
            Go to Dashboard
          </button>

          <button
            onClick={() => navigate("/add-products")}
            className="inline-flex items-center gap-3 px-10 py-4 bg-white text-gray-700 font-bold rounded-2xl border-2 border-gray-200 hover:bg-gray-50 hover:border-gray-300 hover:shadow-lg transition-all duration-300 shadow-md"
          >
            <Package size={24} />
            Add More Products
          </button>
        </div>

        {/* Footer Information */}
        <div className="bg-gradient-to-r from-gray-50 to-gray-100 rounded-2xl p-8 text-center shadow-inner">
          <div className="max-w-2xl mx-auto">
            <h4 className="text-lg font-bold text-gray-800 mb-4">
              Important Information
            </h4>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-sm">
              <div className="bg-white p-4 rounded-xl shadow-sm">
                <p className="text-gray-600">
                  <strong className="text-gray-800">Application ID:</strong>
                  <br />
                  <span className="font-mono text-blue-600 text-lg">
                    {applicationId}
                  </span>
                </p>
              </div>
              <div className="bg-white p-4 rounded-xl shadow-sm">
                <p className="text-gray-600">
                  <strong className="text-gray-800">Submitted:</strong>
                  <br />
                  <span className="text-gray-800">{submissionDate}</span>
                </p>
              </div>
            </div>
            <p className="text-gray-500 mt-6 leading-relaxed">
              Please save this page or take a screenshot for your records. You
              can reference your application ID in any future communications
              with our team. We appreciate your interest in partnering with us!
            </p>
          </div>
        </div>
      </div>
    </div>
  );
};

export default SubmissionSuccess;
