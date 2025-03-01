const jwt = require('jsonwebtoken');

module.exports = function(req, res, next) {
    const authHeader = req.headers['authorization']
    const restrictedAgents = ['postman', 'insomnia', 'httpie', 'curl']; 
    const userAgent = req.headers['user-agent'] ? req.headers['user-agent'].toLowerCase() : '';
    const token = authHeader && authHeader.split(' ')[1]
    
    // Check if not token
    if(!token) {
        return res.status(401).json({ message: 'No token, authorization denied' });
    }
    
    // Api tool Check
    if (restrictedAgents.some(agent => userAgent.includes(agent))) {
        return res.status(401).json({ message: 'Unauthorized device' });
    }
    // Verify token
    try {
        const decoded = jwt.verify(token, "randomString");
        req.user = decoded.user;
    } catch (err) {
        return res.status(401).json({ message: 'Token is not valid' });
    }
    next();
}