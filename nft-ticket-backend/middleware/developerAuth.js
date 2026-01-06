const jwt = require('jsonwebtoken');

const developerAuth = (req, res, next) => {
    try {
        const authHeader = req.headers.authorization;

        if (!authHeader || !authHeader.startsWith('Bearer ')) {
            return res.status(401).json({
                success: false,
                error: {
                    code: 'UNAUTHORIZED',
                    message: 'No token provided'
                }
            });
        }

        const token = authHeader.split(' ')[1];
        const decoded = jwt.verify(token, process.env.JWT_SECRET);

        // Check if the token is for a developer
        if (decoded.role !== 'developer') {
            return res.status(403).json({
                success: false,
                error: {
                    code: 'FORBIDDEN',
                    message: 'Developer access required'
                }
            });
        }

        req.developer = decoded;
        next();
    } catch (error) {
        return res.status(401).json({
            success: false,
            error: {
                code: 'INVALID_TOKEN',
                message: 'Invalid or expired token'
            }
        });
    }
};

module.exports = developerAuth;
