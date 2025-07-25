import mongoose from "mongoose";

const userSchema = new mongoose.Schema({
    name: {type: String, required: true},
    email: {type: String, required: true, unique: true},
    password: {type: String, required: true},
    emailVerificationOTP: {type: String, default: ''},
    emailVerificationOTPExpiresAt: {type: Number, default: 0},
    isAccountVerified: {type: Boolean, default: false},
    passwordResetOTP: {type: String, default: ''},
    passwordResetOTPExpiresAt: {type: Number, default: 0}
});

const User = mongoose.models.user || mongoose.model('user', userSchema);

export default User;