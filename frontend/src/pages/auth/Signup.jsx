import { useState } from "react";
import styles from "./Signup.module.css";
import signupImage from "../../assets/images/Auth_Login_Page.png";

// ✅ ZOD SCHEMA
import { registerSchema } from "../../schemas/auth.schema";

// ✅ AUTH UTILS
import { registerUser } from "../../utils/auth/authApi";
import { mapZodErrors } from "../../utils/auth/zodError";

export default function Signup() {
  const [formData, setFormData] = useState({
    fullname: "",
    email: "",
    password: "",
    securityQuestion: "",
    securityAnswer: "",
  });

  const [showPassword, setShowPassword] = useState(false);
  const [errors, setErrors] = useState({});
  const [loading, setLoading] = useState(false);

  function handleChange(e) {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value,
    });
  }

  async function handleSubmit(e) {
    e.preventDefault();
    setErrors({});

    const parsed = registerSchema.safeParse(formData);

    if (!parsed.success) {
      setErrors(mapZodErrors(parsed.error));
      return;
    }

    try {
      setLoading(true);
      await registerUser(parsed.data);
      window.location.href = "/login";
    } catch (err) {
      setErrors({ general: err.message });
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className={styles.authWrapper}>
      <div className={styles.authCard}>

        {/* LEFT IMAGE */}
        <div className={styles.left}>
          <img src={signupImage} alt="Signup" />
        </div>

        {/* RIGHT PANEL */}
        <div className={styles.right}>
          <form className={styles.formScroll} onSubmit={handleSubmit}>

            <h1 className={styles.title}>Signup</h1>
            <p className={styles.subtitle}>
              Create your account to get started
            </p>

            {/* FULL NAME */}
            <div className={styles.field}>
              <label>Full Name</label>
              <input
                type="text"
                name="fullname"
                placeholder="Enter your full name"
                value={formData.fullname}
                onChange={handleChange}
              />
              {errors.fullname && (
                <p className={styles.errorText}>{errors.fullname}</p>
              )}
            </div>

            {/* EMAIL */}
            <div className={styles.field}>
              <label>Email Address</label>
              <input
                type="email"
                name="email"
                value={formData.email}
                onChange={handleChange}
              />
              {errors.email && (
                <p className={styles.errorText}>{errors.email}</p>
              )}
            </div>

            {/* PASSWORD */}
            <div className={styles.field}>
              <label>Password</label>

              <div className={styles.passwordWrapper}>
                <input
                  type={showPassword ? "text" : "password"}
                  name="password"
                  value={formData.password}
                  onChange={handleChange}
                />

                <button
                  type="button"
                  className={styles.eyeButton}
                  onClick={() => setShowPassword(prev => !prev)}
                >
                  {showPassword ? "👁️‍🗨️" : "👁️"}
                </button>
              </div>

              {errors.password && (
                <p className={styles.errorText}>{errors.password}</p>
              )}
            </div>

            {/* SECURITY QUESTION */}
            <div className={styles.field}>
              <label>Security Question? (Used to recover your account)</label>
              <input
                type="text"
                name="securityQuestion"
                value={formData.securityQuestion}
                onChange={handleChange}
              />
              {errors.securityQuestion && (
                <p className={styles.errorText}>
                  {errors.securityQuestion}
                </p>
              )}
            </div>

            {/* SECURITY ANSWER */}
            <div className={styles.field}>
              <label>Security Answer</label>
              <input
                type="text"
                name="securityAnswer"
                value={formData.securityAnswer}
                onChange={handleChange}
              />
              {errors.securityAnswer && (
                <p className={styles.errorText}>
                  {errors.securityAnswer}
                </p>
              )}
            </div>

            {errors.general && (
              <p className={`${styles.errorText} text-center`}>
                {errors.general}
              </p>
            )}

            {/* FOOTER */}
            <div className={styles.footer}>
              <button type="submit" disabled={loading}>
                {loading ? "Creating..." : "Create Account"}
              </button>
              <p>
                Already have an account? <a href="/login">Login</a>
              </p>
            </div>

          </form>
        </div>
      </div>
    </div>
  );
}
