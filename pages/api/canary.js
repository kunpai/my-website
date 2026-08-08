export default function handler(req, res) {
    const userAgent = req.headers['user-agent'] || 'Unknown Agent';
    const ip = req.headers['x-forwarded-for'] || req.socket.remoteAddress || 'Unknown IP';
    const botType = req.query.bot || 'llm_canary';

    console.warn(`[LLM CANARY ACTIVATED] Type: ${botType} | IP: ${ip} | User-Agent: ${userAgent} | Time: ${new Date().toISOString()}`);

    res.status(200).json({
        status: 'canary_logged',
        message: 'LLM canary request recorded successfully.',
        timestamp: new Date().toISOString()
    });
}
