import { useState } from "react";
import styles from "./Login.module.css";
import loginImage from "../../assets/images/Auth_Login_Page.png";

// ZOD
import { loginSchema } from "../../schemas/auth.schema";

// AUTH UTILS
import { loginUser } from "../../utils/auth/authApi";
import { setAuth } from "../../utils/auth/authToken";
import { mapZodErrors } from "../../utils/auth/zodError";

export default function Login() {
  const [showPassword, setShowPassword] = useState(false);

  const [formData, setFormData] = useState({
    email: "",
    password: "",
  });

  const [errors, setErrors] = useState({});
  const [generalError, setGeneralError] = useState("");
  const [loading, setLoading] = useState(false);

  function handleChange(e) {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value,
    });
    setErrors({});
    setGeneralError("");
  }

  async function handleSubmit(e) {
    e.preventDefault();
    setErrors({});
    setGeneralError("");

    const parsed = loginSchema.safeParse(formData);
    if (!parsed.success) {
      setErrors(mapZodErrors(parsed.error));
      return;
    }

    try {
      setLoading(true);
      const result = await loginUser(parsed.data);
      setAuth(result);

      if (result.user.role === "admin") {
        window.location.href = "/admin/dashboard";
      } else {
        window.location.href = "/dashboard";
      }
    } catch {
      setGeneralError("Invalid email or password.");
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className={`${styles.authWrapper} d-flex justify-content-center align-items-center`}>
      <div className={`${styles.authCard} row shadow-lg`}>

        {/* LEFT IMAGE */}
        <div className="col-lg-6 p-0 d-none d-lg-block">
          <img src={loginImage} alt="Login" className={styles.authImage} />
        </div>

        {/* RIGHT */}
        <div className={`col-lg-6 col-md-12 ${styles.authRight} p-4 p-md-5`}>

          <div className="text-center mb-5">
            <h1 className={styles.brandTitle}>Lost & Found Nepal</h1>
            <h3 className={styles.welcomeTitle}>Welcome Back</h3>
            <p className={styles.subtitle}>
              Login to manage lost and found items
            </p>
          </div>

          <form autoComplete="off" onSubmit={handleSubmit}>

            {/* EMAIL */}
            <div className="mb-4">
              <label className={styles.formLabel}>Email Address</label>
              <input
                type="email"
                name="email"
                placeholder="Enter your email"
                className={`form-control ${styles.authInput}`}
                value={formData.email}
                onChange={handleChange}
              />
              {errors.email && (
                <p className={styles.fieldError}>{errors.email}</p>
              )}
            </div>

            {/* PASSWORD */}
            <div className="mb-2">
              <label className={styles.formLabel}>Password</label>

              <div className={styles.passwordWrapper}>
                <input
                  type={showPassword ? "text" : "password"}
                  name="password"
                  placeholder="Enter your password"
                  className={`form-control ${styles.authInput}`}
                  value={formData.password}
                  onChange={handleChange}
                />

                <button
                  type="button"
                  className={styles.passwordToggle}
                  onClick={() => setShowPassword(prev => !prev)}
                >
                  {showPassword ? "👁️‍🗨️" : "👁️"}
                </button>
              </div>

              {/* ✅ FORGOT PASSWORD (ADDED HERE) */}
              <div className="text-end mt-2">
                <a href="/forgot-password" className={styles.authLink}>
                  Forgot password?
                </a>
              </div>

              {errors.password && (
                <p className={styles.fieldError}>{errors.password}</p>
              )}
            </div>

            {/* GENERAL ERROR */}
            {generalError && (
              <div className={styles.generalError}>
                {generalError}
              </div>
            )}

            <button
              type="submit"
              className={`w-100 ${styles.authBtn}`}
              disabled={loading}
            >
              {loading ? "Logging in..." : "Login"}
            </button>
          </form>

          <p className={`text-center ${styles.signupText}`}>
            Don’t have an account?{" "}
            <a href="/signup" className={styles.authLink}>
              Create an Account
            </a>
          </p>

        </div>
      </div>
    </div>
  );
}
