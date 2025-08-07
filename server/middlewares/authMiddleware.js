import jwt from 'jsonwebtoken';

const userAuth = (req, res, next) => {
    const authToken = req.cookies?.authToken;

    if (!authToken) {
        return res.status(401).json({ success: false, message: "Unauthorized. Authentication token missing. Please log in." });
    }

    try {
        const decodedToken = jwt.verify(authToken, process.env.JWT_SECRET);
        
        if(!decodedToken?.id) {
            res.status(401).json({success: false, message: "Invalid token. Try again later."});
        }

        // Attach userId to req.user
        req.user = {userId: decodedToken.id};

        next();
    } catch (error) {
        return res.status(401).json({ success: false, message: "From auth middleware: " + error.message });
    }
}

export default userAuth; 