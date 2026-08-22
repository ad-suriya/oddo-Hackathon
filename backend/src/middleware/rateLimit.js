import rateLimit, { ipKeyGenerator } from "express-rate-limit";

// Keyed by IP + attempted email (not IP alone) so one bad actor can't lock
// out every other user sharing their IP (NAT, office network, campus wifi),
// while still capping brute-force attempts against a single account.
// ipKeyGenerator normalizes IPv6 addresses to a /64 block instead of the
// full address, since every device on a home IPv6 network otherwise gets
// its own address and would each get its own limit.
function loginKey(req) {
  const email = typeof req.body?.email === "string" ? req.body.email.trim().toLowerCase() : "";
  return `${ipKeyGenerator(req.ip)}:${email}`;
}

export const loginLimiter = rateLimit({
  windowMs: 15 * 60 * 1000,
  limit: 10,
  standardHeaders: true,
  legacyHeaders: false,
  keyGenerator: loginKey,
  handler: (req, res) => {
    res.status(429).json({
      error: {
        code: "TOO_MANY_REQUESTS",
        message: "Too many login attempts. Please try again later.",
        details: {},
      },
    });
  },
});

// Signup has no per-account key to scope by yet (the account doesn't exist
// until it succeeds), so this is IP-only — a coarser guard against
// mass account creation.
export const signupLimiter = rateLimit({
  windowMs: 60 * 60 * 1000,
  limit: 20,
  standardHeaders: true,
  legacyHeaders: false,
  handler: (req, res) => {
    res.status(429).json({
      error: {
        code: "TOO_MANY_REQUESTS",
        message: "Too many signup attempts from this network. Please try again later.",
        details: {},
      },
    });
  },
});
