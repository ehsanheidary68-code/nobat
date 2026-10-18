import { kv } from '@vercel/kv';
export default async function handler(req, res) {
  if (req.method === 'GET') {
    const list = await kv.lrange('bookings', 0, -1);
    return res.status(200).json(list || []);
  }
  if (req.method === 'POST') {
    const b = typeof req.body === 'string' ? JSON.parse(req.body) : req.body;
    const all = await kv.lrange('bookings', 0, -1) || [];
    const dayCount = all.filter(x => x.day === b.day).length + 1;
    b.nobat = (b.day == 1 ? 'A' : 'B') + String(dayCount).padStart(3, '0');
    await kv.rpush('bookings', b);
    return res.status(200).send('نوبت شما ثبت شد: ' + b.nobat);
  }
}