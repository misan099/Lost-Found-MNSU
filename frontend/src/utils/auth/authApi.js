import api from "../../services/api";

/* ===============================
   LOGIN
================================ */
export async function loginUser(payload) {
  try {
    const res = await api.post("/auth/login", payload);
    return res.data;
  } catch (err) {
    throw new Error(err.response?.data?.message || "Login failed");
  }
}

/* ===============================
   SIGNUP
================================ */
export async function registerUser(payload) {
  try {
    const res = await api.post("/auth/signup", payload);
    return res.data;
  } catch (err) {
    throw new Error(err.response?.data?.message || "Signup failed");
  }
}

/* ===============================
   FORGOT PASSWORD – STEP 1
   Check email & get security question
================================ */
export async function forgotPasswordCheckEmail(email) {
  try {
    const res = await api.post("/auth/forgot-password/email", { email });
    return res.data; // { securityQuestion }
  } catch (err) {
    throw new Error(err.response?.data?.message || "Email not found");
  }
}

/* ===============================
   FORGOT PASSWORD – STEP 2
   Verify security answer
================================ */
export async function verifySecurityAnswer(payload) {
  // payload = { email, securityAnswer }
  try {
    const res = await api.post("/auth/forgot-password/verify", payload);
    return res.data;
  } catch (err) {
    throw new Error(err.response?.data?.message || "Invalid security answer");
  }
}

/* ===============================
   FORGOT PASSWORD – STEP 3
   Reset password (FINAL)
================================ */
export async function resetPassword(payload) {
  // payload = { email, newPassword, confirmPassword }
  try {
    const res = await api.post("/auth/forgot-password/reset", payload);
    return res.data;
  } catch (err) {
    throw new Error(err.response?.data?.message || "Password reset failed");
  }
}

/* ===============================
   ACCOUNT STATUS
================================ */
export async function getAccountStatus() {
  try {
    const res = await api.get("/auth/status");
    return res.data;
  } catch (err) {
    const data = err.response?.data || {};
    if (data.status || data.message) {
      return {
        status: data.status || "restricted",
        notice: data.message || null,
        note: data.note || null,
        suspendedUntil: data.suspendedUntil || null,
      };
    }
    throw new Error(data.message || "Failed to fetch account status");
  }
}
