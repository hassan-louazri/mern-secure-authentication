import jwt from 'jsonwebtoken';

const userAuth = (req, res, next) => {
    const { authToken } = req.cookies;

    if (!authToken) {
        return res.json({ success: false, message: "Unauthorized. Please log in." });
    }

    try {
        const decodedToken = jwt.verify(authToken, process.env.JWT_SECRET);
        if (decodedToken.id) {
            req.body.userId = decodedToken.id;
        } else {
            return res.json({ success: false, message: "Unauthorized. Please log in again." });
        }

        next();
    } catch (error) {
        return res.json({ success: false, message: error.message });
    }
}

export default userAuth; 