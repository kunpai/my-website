export default function handler(req, res) {
    const userAgent = req.headers['user-agent'] || 'Unknown Agent';
    const ip = req.headers['x-forwarded-for'] || req.socket.remoteAddress || 'Unknown IP';
    const referrer = req.headers['referer'] || 'None';

    console.warn(`[BOT HONEYPOT TRAPPED] IP: ${ip} | User-Agent: ${userAgent} | Referrer: ${referrer} | Path: ${req.url} | Time: ${new Date().toISOString()}`);

    res.setHeader('X-Robots-Tag', 'noindex, nofollow');
    res.status(403).json({
        error: 'Access Denied',
        message: 'Rogue crawler trapped by honeypot.',
        timestamp: new Date().toISOString()
    });
}
