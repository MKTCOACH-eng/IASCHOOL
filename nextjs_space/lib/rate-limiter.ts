/**
 * Rate Limiter Implementation for IA School
 * Protects against brute force and DDoS attacks
 */

interface RateLimitEntry {
  count: number;
  firstRequest: number;
  blocked: boolean;
  blockedUntil?: number;
}

// In-memory store (for single instance - use Redis for production scaling)
const rateLimitStore = new Map<string, RateLimitEntry>();

// Clean up old entries every 5 minutes
setInterval(() => {
  const now = Date.now();
  for (const [key, entry] of rateLimitStore.entries()) {
    if (now - entry.firstRequest > 3600000) { // 1 hour
      rateLimitStore.delete(key);
    }
  }
}, 300000);

export interface RateLimitConfig {
  windowMs: number;       // Time window in ms
  maxRequests: number;    // Max requests in window
  blockDurationMs: number; // Block duration when exceeded
}

export const RATE_LIMITS: Record<string, RateLimitConfig> = {
  // Auth endpoints - stricter limits
  'auth-login': { windowMs: 60000, maxRequests: 5, blockDurationMs: 300000 },      // 5 per min, block 5 min
  'auth-signup': { windowMs: 3600000, maxRequests: 3, blockDurationMs: 86400000 }, // 3 per hour, block 24h
  'auth-forgot': { windowMs: 3600000, maxRequests: 3, blockDurationMs: 3600000 },  // 3 per hour, block 1h
  
  // AI/LLM endpoints - prevent abuse
  'chatbot': { windowMs: 60000, maxRequests: 20, blockDurationMs: 60000 },         // 20 per min
  'tips-generate': { windowMs: 3600000, maxRequests: 10, blockDurationMs: 3600000 }, // 10 per hour
  'sentiment': { windowMs: 60000, maxRequests: 30, blockDurationMs: 60000 },       // 30 per min
  
  // Heavy operations
  'pdf-generate': { windowMs: 60000, maxRequests: 10, blockDurationMs: 120000 },   // 10 per min
  'email-send': { windowMs: 60000, maxRequests: 10, blockDurationMs: 300000 },     // 10 per min
  'upload': { windowMs: 60000, maxRequests: 20, blockDurationMs: 120000 },         // 20 per min
  
  // General API
  'api-general': { windowMs: 60000, maxRequests: 100, blockDurationMs: 60000 },    // 100 per min
};

/**
 * Check if request should be rate limited
 * @param identifier - Unique identifier (IP:userId:endpoint)
 * @param limitType - Type of rate limit to apply
 * @returns Object with allowed status and retry info
 */
export function checkRateLimit(
  identifier: string,
  limitType: string = 'api-general'
): { allowed: boolean; retryAfter?: number; remaining?: number } {
  const config = RATE_LIMITS[limitType] || RATE_LIMITS['api-general'];
  const now = Date.now();
  const key = `${limitType}:${identifier}`;
  
  let entry = rateLimitStore.get(key);
  
  // Check if currently blocked
  if (entry?.blocked && entry.blockedUntil && now < entry.blockedUntil) {
    return {
      allowed: false,
      retryAfter: Math.ceil((entry.blockedUntil - now) / 1000)
    };
  }
  
  // Reset if window has passed or not exists
  if (!entry || now - entry.firstRequest > config.windowMs) {
    entry = { count: 1, firstRequest: now, blocked: false };
    rateLimitStore.set(key, entry);
    return { allowed: true, remaining: config.maxRequests - 1 };
  }
  
  // Increment count
  entry.count++;
  
  // Check if exceeded
  if (entry.count > config.maxRequests) {
    entry.blocked = true;
    entry.blockedUntil = now + config.blockDurationMs;
    rateLimitStore.set(key, entry);
    return {
      allowed: false,
      retryAfter: Math.ceil(config.blockDurationMs / 1000)
    };
  }
  
  rateLimitStore.set(key, entry);
  return { allowed: true, remaining: config.maxRequests - entry.count };
}

/**
 * Clear rate limit for identifier (e.g., after successful login)
 */
export function clearRateLimit(identifier: string, limitType: string = 'api-general'): void {
  const key = `${limitType}:${identifier}`;
  rateLimitStore.delete(key);
}

/**
 * Get client identifier from request
 */
export function getClientIdentifier(request: Request, userId?: string): string {
  const forwarded = request.headers.get('x-forwarded-for');
  const ip = forwarded ? forwarded.split(',')[0].trim() : 'unknown';
  return userId ? `${ip}:${userId}` : ip;
}
