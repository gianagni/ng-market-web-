import { Ratelimit } from '@upstash/ratelimit';
import { Redis } from '@upstash/redis';

export const otpRatelimit = new Ratelimit({
  redis: Redis.fromEnv(),
  limiter: Ratelimit.slidingWindow(3, '10 m'),
  prefix: 'otp',
});