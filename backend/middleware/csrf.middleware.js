import crypto from "crypto";

// Generate a CSRF token
export function generateCSRFToken() {
  return crypto.randomBytes(32).toString("hex");
}

// Set CSRF token in cookies
export function setCSRFToken(req, res, next) {
  if (!req.cookies["XSRF-TOKEN"]) {
    const csrfToken = generateCSRFToken();
    res.cookie("XSRF-TOKEN", csrfToken, {
      httpOnly: false,
      secure: process.env.NODE_ENV === "production",
      sameSite: "strict",
    });
  }
  next();
}

// CSRF Verification Middleware for Non-Get requests
export function verifyCSRFToken(req, res, next) {
  if (req.method !== "GET") {
    const tokenFromHeader = req.headers["x-xsrf-token"];
    const tokenFromCookie = req.cookies["XSRF-TOKEN"];

    if (!tokenFromHeader || tokenFromHeader !== tokenFromCookie) {
      return res
        .status(403)
        .json({ success: false, message: "Missing or invalid CSRF token" });
    }
  }
  next();
}
