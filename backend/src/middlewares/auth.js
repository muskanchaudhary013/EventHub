// Authentication Middleware for EventHub
// Reads Firebase Authorization header or provides dev fallback
export const requireAuth = (req, res, next) => {
  const authHeader = req.headers.authorization;

  if (process.env.NODE_ENV === "development" && !authHeader) {
    // In local dev without token, proceed with dev context
    req.user = { uid: "dev-user-001", role: req.headers["x-user-role"] || "student" };
    return next();
  }

  if (!authHeader || !authHeader.startsWith("Bearer ")) {
    return res.status(401).json({
      success: false,
      message: "Authorization token missing or malformed.",
    });
  }

  // Token attached
  const token = authHeader.split(" ")[1];
  req.token = token;
  // Can be verified via firebase-admin if configured
  next();
};

export const requireRole = (...allowedRoles) => {
  return (req, res, next) => {
    const userRole = req.headers["x-user-role"] || req.user?.role || "student";
    if (!allowedRoles.includes(userRole)) {
      return res.status(403).json({
        success: false,
        message: `Forbidden: requires one of [${allowedRoles.join(", ")}] roles.`,
      });
    }
    next();
  };
};
