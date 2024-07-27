import { UserLogin } from "../models/user.js";
import jwt from 'jsonwebtoken';

const handleRefreshToken = async (req, res) => {
    const refreshTokenHeader = req.headers['refresh'];

    console.log("refresh", refreshTokenHeader);

    if (!refreshTokenHeader) {
        return res.status(401).json({ message: 'Refresh token is required.' });
    }

    const refreshToken = refreshTokenHeader;

    if (!refreshToken) {
        return res.status(401).json({ message: 'Refresh token is required.' });
    }

    try {
        // Find the user associated with the refresh token
        const foundUser = await UserLogin.findOne({ refreshToken });

        if (!foundUser) {
            return res.status(403).json({ message: 'Invalid refresh token.' });
        }

        // Generate new access token
        const accessToken = jwt.sign(
            {
                "UserInfo": {
                    "username": foundUser.username,
                    "role": foundUser.role // Use the role field
                }
            },
            "secret-key",
            { expiresIn: '5h' }
        );

        // You may want to generate a new refresh token as well, depending on your application logic

        // Return both access and refresh tokens
        res.json({ accessToken, refreshToken });
    } catch (error) {
        console.error('Error:', error);
        return res.status(500).json({ message: 'Internal server error.' });
    }
};

export default handleRefreshToken;
