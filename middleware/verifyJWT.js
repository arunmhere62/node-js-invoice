import jwt from "jsonwebtoken";

const verifyJWT = (req, res, next) => {
    const authHeader = req.headers.authorization || req.headers.Authorization;
    if (!authHeader?.startsWith('Bearer ')) return res.status(401).json({ message: 'Unauthorized. Missing or invalid token.' });
    const token = authHeader.split(' ')[1];
    jwt.verify(
        token,
        "secret-key",
        (err, decoded) => {
            if (err) {
                if (err.name === 'TokenExpiredError') {
                    return res.status(403).json({ message: 'Token expired.' });
                } else {
                    return res.status(403).json({ message: 'Invalid token.' });
                }
            }
            req.user = decoded.UserInfo.username;
            req.roles = decoded.UserInfo.roles;
            next();
        }
    );
}

export default verifyJWT;
