import { useState, useEffect } from "react";
import { FiHome } from "react-icons/fi"; // ✅ HOME ICON
import styles from "./ForgotPassword.module.css";
import loginImage from "../../assets/images/Auth_Login_Page.png";

import {
  forgotPasswordCheckEmail,
  verifySecurityAnswer,
  resetPassword,
} from "../../utils/auth/authApi";

export default function ForgotPassword() {
  const [step, setStep] = useState(1);

  const [email, setEmail] = useState("");
  const [securityQuestion, setSecurityQuestion] = useState("");
  const [securityAnswer, setSecurityAnswer] = useState("");

  const [newPassword, setNewPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");

  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);

  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState(false);

  async function handleEmailSubmit(e) {
    e.preventDefault();
    setError("");

    if (!email.trim()) {
      setError("Email is required");
      return;
    }

    try {
      setLoading(true);
      const res = await forgotPasswordCheckEmail(email.trim());
      setSecurityQuestion(res.securityQuestion);
      setStep(2);
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  }

  async function handleVerifyAnswer(e) {
    e.preventDefault();
    setError("");

    if (!securityAnswer.trim()) {
      setError("Security answer is required");
      return;
    }

    try {
      setLoading(true);
      await verifySecurityAnswer({
        email: email.trim(),
        securityAnswer: securityAnswer.trim(),
      });
      setStep(3);
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  }

  async function handleResetPassword(e) {
    e.preventDefault();
    setError("");

    if (!newPassword || !confirmPassword) {
      setError("All fields are required");
      return;
    }

    if (newPassword !== confirmPassword) {
      setError("Passwords do not match");
      return;
    }

    try {
      setLoading(true);
      await resetPassword({
        email: email.trim(),
        newPassword,
        confirmPassword,
      });
      setSuccess(true);
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => {
    if (success) {
      const t = setTimeout(() => {
        window.location.href = "/login";
      }, 2500);
      return () => clearTimeout(t);
    }
  }, [success]);

  return (
    <div className={`${styles.authWrapper} d-flex justify-content-center align-items-center`}>
      <div className={`${styles.authCard} row shadow-lg`}>

        {/* LEFT IMAGE */}
        <div className="col-lg-6 p-0 d-none d-lg-block">
          <img src={loginImage} alt="Forgot Password" className={styles.authImage} />
        </div>

        {/* RIGHT */}
        <div className={`col-lg-6 col-md-12 ${styles.authRight} p-4 p-md-5`}>

          {/* 🔹 HOME ICON */}
          <button
            className={styles.homeBtn}
            onClick={() => (window.location.href = "/login")}
            aria-label="Go to login"
          >
            <FiHome />
          </button>

          {/* TOP TEXT */}
          <div className="text-center mb-5">
            <h1 className={styles.brandTitle}>Lost & Found Nepal</h1>
            <h3 className={styles.welcomeTitle}>Forgot Password</h3>
            <p className={styles.subtitle}>
              Step {step} of 3 · Reset your password securely
            </p>
          </div>

          {/* STEP 1 */}
          {!success && step === 1 && (
            <form onSubmit={handleEmailSubmit}>
              <div className="mb-4">
                <label className={styles.formLabel}>Email Address</label>
                <input
                  type="email"
                  className={`form-control ${styles.authInput}`}
                  placeholder="Enter your email"
                  value={email}
                  onChange={(e) => {
                    setEmail(e.target.value);
                    setError("");
                  }}
                />
              </div>

              {error && <div className={styles.generalError}>{error}</div>}

              <button className={`w-100 ${styles.authBtn}`} disabled={loading}>
                Continue
              </button>
            </form>
          )}

          {/* STEP 2 */}
          {!success && step === 2 && (
            <form onSubmit={handleVerifyAnswer}>
              <div className="mb-4">
                <label className={styles.formLabel}>{securityQuestion}</label>
                <input
                  className={`form-control ${styles.authInput}`}
                  placeholder="Your answer"
                  value={securityAnswer}
                  onChange={(e) => {
                    setSecurityAnswer(e.target.value);
                    setError("");
                  }}
                />
              </div>

              {error && <div className={styles.generalError}>{error}</div>}

              <button className={`w-100 ${styles.authBtn}`} disabled={loading}>
                Verify Answer
              </button>
            </form>
          )}

          {/* STEP 3 */}
          {!success && step === 3 && (
            <form onSubmit={handleResetPassword}>
              <div className="mb-4">
                <label className={styles.formLabel}>New Password</label>
                <div className={styles.passwordWrapper}>
                  <input
                    type={showPassword ? "text" : "password"}
                    className={`form-control ${styles.authInput}`}
                    placeholder="Enter new password"
                    value={newPassword}
                    onChange={(e) => {
                      setNewPassword(e.target.value);
                      setError("");
                    }}
                  />
                  <button
                    type="button"
                    className={styles.passwordToggle}
                    onClick={() => setShowPassword(p => !p)}
                  >
                    {showPassword ? "👁️‍🗨️" : "👁️"}
                  </button>
                </div>
              </div>

              <div className="mb-4">
                <label className={styles.formLabel}>Confirm Password</label>
                <div className={styles.passwordWrapper}>
                  <input
                    type={showConfirmPassword ? "text" : "password"}
                    className={`form-control ${styles.authInput}`}
                    placeholder="Confirm new password"
                    value={confirmPassword}
                    onChange={(e) => {
                      setConfirmPassword(e.target.value);
                      setError("");
                    }}
                  />
                  <button
                    type="button"
                    className={styles.passwordToggle}
                    onClick={() => setShowConfirmPassword(p => !p)}
                  >
                    {showConfirmPassword ? "👁️‍🗨️" : "👁️"}
                  </button>
                </div>
              </div>

              {error && <div className={styles.generalError}>{error}</div>}

              <button className={`w-100 ${styles.authBtn}`} disabled={loading}>
                Reset Password
              </button>
            </form>
          )}

          {success && (
            <div
              className={styles.generalError}
              style={{ background: "#ecfdf5", color: "#065f46" }}
            >
              Password reset successful 🎉 <br /> Redirecting to login…
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
