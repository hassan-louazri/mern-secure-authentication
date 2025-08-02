# mern-secure-authentication

Simple and robust authentication workflow with a beautiful UI, built using the MERN stack.

## Setup
1. **Prerequisites**: Node.js (v18+), MongoDB (v7+).
2. Clone the repo:
   ```bash
   git clone https://github.com/hassan-louazri/mern-secure-authentication.git
   cd mern-secure-authentication
   ```
3. Install dependencies:
   ```bash
   npm install
   ```
4. Create a `.env` file based on `.env.example`:
   ```
   MONGODB_URI="mongodb://user:password@localhost:27017"
   DATABASE="myAwesomeDatabase"
   JWT_SECRET="SECRET#KEY"
   NODE_ENV="dev"
   PORT=3301
   ```
5. Start MongoDB:
   ```bash
   sudo systemctl start mongod
   ```
   If MongoDB is not installed on your computer, make sure to grab it from the internet. (Or you can deploy a cluster using mongoDB Atlas)
6. Run the server:
   ```bash
   npm start
   ```
   Or for development with auto-reload:
   ```bash
   npm run dev
   ```

## API Endpoints
### Authentication
- `GET /`: Health check ("Server running correctly").
- `POST /api/auth/register`: Register a user (`{ "name": "string", "email": "string", "password": "string" }`).
- `POST /api/auth/login`: Authenticate a user (`{ "name": "string", "password": "string" }`).
- `POST /api/auth/logout`: Log out a user.
- `POST /api/auth/send-verification-code`: Send a one-time passkey to verify your email account.
- `POST /api/auth/verify-account`: Verify your account using the one-time passkey in your email (`{"otp": "string"}`).
- `POST /api/auth/is-authenticated`: Verify whether account is authenticated or not.
- `POST /api/auth/send-password-reset-otp`: Request a one-time passkey to reset your password (`{"email": "string"}`).
- `POST /api/auth/set-new-password`: Reset your password if case you forget it (`{"email": "string", "otp": "string", "newPassword": "string"}`).

### User
- `GET /api/user/user-data`: Get user data.

## Features
- Secure authentication with JWT and bcrypt.
- MongoDB with Mongoose for user data management.
- Email support via Nodemailer.
- CORS and cookie-based sessions.

## Testing
Run tests with:
```bash
npm test
```

## Notes
- Ensure MongoDB is running on `localhost:27017` (or online on your deployed cluster using mongoDB Atlas) and the `MONGODB_URI` includes the correct credentials and database.