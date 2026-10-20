import { Redis } from '@upstash/redis'; 
const redis = Redis.fromEnv();
export default async function handler(req, res) {
  try {
    if (req.method === 'GET') {
      if (req.query.type === 'caps') {
        const c = await redis.get('caps');
        return res.status(200).json(c || null);
      }
      const list = await redis.lrange('bookings', 0, -1);
      return res.status(200).json(list || []);
    }
    if (req.method === 'POST') {
      const b = typeof req.body === 'string' ? JSON.parse(req.body) : req.body;
      if (b.type === 'caps') {
        await redis.set('caps', b.caps);
        return res.status(200).send('ok');
      }
      const all = (await redis.lrange('bookings', 0, -1)) || [];
      if (all.find((x) => x.code === b.code)) {
        return res.status(400).send('این کدملی قبلاً نوبت گرفته است.');
      }
      const dayCount = all.filter((x) => Number(x.day) === Number(b.day)).length + 1;
      b.nobat = (Number(b.day) === 1 ? 'A' : 'B') + String(dayCount).padStart(3, '0');
      b.created_at = new Date().toISOString();
      await redis.rpush('bookings', b);
      return res.status(200).json({ nobat: b.nobat });
    }
    return res.status(405).send('method not allowed');
  } catch (e) {
    return res.status(500).send('خطای سرور: ' + e.message);
  }
}
