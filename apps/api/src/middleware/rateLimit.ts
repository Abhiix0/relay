import rateLimit, { ipKeyGenerator } from "express-rate-limit";

export function perUserLimit(limit: number) {
  return rateLimit({
    windowMs: 60_000,
    limit,
    standardHeaders: true,
    legacyHeaders: false,
    keyGenerator: (req) => req.user?._id.toHexString() ?? "anon",
    validate: { keyGeneratorIpFallback: false },
    handler: (_req, res) => {
      res.status(429).json({ message: "Too many requests", code: "rate_limited" });
    },
  });
}

/** Per-IP limit for the OAuth endpoints; over the limit, bounce to the sign-in error page. */
export function perIpLimit(limit: number, redirectTo: () => string) {
  return rateLimit({
    windowMs: 60_000,
    limit,
    standardHeaders: true,
    legacyHeaders: false,
    keyGenerator: (req) => ipKeyGenerator(req.ip ?? ""),
    handler: (_req, res) => {
      res.redirect(302, redirectTo());
    },
  });
}
