const jwt = require('jsonwebtoken');

module.exports = function(req, res, next) {
    // Get token from header
    const token = req.header('Authorization');

    // Check if not token
    if (!token) {
        return res.status(401).json({ msg: 'No token, authorization denied' });
    }
    
    // Ensure token is in "Bearer <token>" format and extract the token part
    const tokenParts = token.split(' ');
    if (tokenParts.length !== 2 || tokenParts[0] !== 'Bearer') {
         return res.status(401).json({ msg: 'Token format is incorrect' });
    }
    
    const actualToken = tokenParts[1];

    // Verify token
    try {
        const decoded = jwt.verify(actualToken, process.env.JWT_SECRET);
        
        // Add user from payload to request object
        req.user = decoded.user;
        next();
    } catch (err) {
        res.status(401).json({ msg: 'Token is not valid' });
    }
};