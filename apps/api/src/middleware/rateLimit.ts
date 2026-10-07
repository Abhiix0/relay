import rateLimit from "express-rate-limit";

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
