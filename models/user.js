import mongoose from "mongoose";

const userSchema = new mongoose.Schema({
  username: {
    type: String,
    required: true,
    unique: true
  },
  password: {
    type: String,
    required: true
  },
  role: {
    type: String,
    enum: ['admin', 'superadmin', 'user'],
    default: 'user'
  },
  refreshToken: [String]
});

const UserLogin = mongoose.model("UserLogin", userSchema);

export { UserLogin };
