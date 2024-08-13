import { UserLogin } from "../models/user.js";
import jwt from 'jsonwebtoken';

const handleRefreshToken = async (req, res) => {

    // Extract the token from the Authorization header
    const authHeader = req.headers['refresh'];

    // Check if refresh token is provided
    if (!authHeader) {
        return res.status(401).json({ message: 'Refresh token is required.' });
    }

    try {
        // Find the user associated with the refresh token
        const foundUser = await UserLogin.findOne({ refreshToken: { $in: [authHeader] } });

        console.log("Found User:", foundUser);

        if (!foundUser) {
            return res.status(403).json({ message: 'Invalid refresh token.' });
        }

        // Hardcoded secret keys
        const accessTokenSecret = 'secret-key';
        const refreshTokenSecret = 'secret-key';

        // Generate a new access token
        const accessToken = jwt.sign(
            {
                "UserInfo": {
                    "userName": foundUser.userName,
                    "userRole": foundUser.userRole,
                    "userEmail": foundUser.userEmail,
                    "companyName": foundUser.companyName,
                    "companyId": foundUser.companyId
                }
            },
            accessTokenSecret, // Hardcoded secret key
            { expiresIn: '10d' }
        );

        // Optionally generate a new refresh token (if necessary)
        const newRefreshToken = jwt.sign(
            { "userName": foundUser.userName },
            refreshTokenSecret, // Hardcoded secret key
            { expiresIn: '30d' } // Example expiration time
        );

        // Update the refresh token in the database
        foundUser.refreshToken = [newRefreshToken]; // Ensure refreshToken is an array
        await foundUser.save();

        // Return the new access and refresh tokens
        res.json({ accessToken, refresh: newRefreshToken });
    } catch (error) {
        console.error('Error in handleRefreshToken:', error);
        return res.status(500).json({ message: 'Internal server error.' });
    }
};

export default handleRefreshToken;
