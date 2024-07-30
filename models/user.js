import mongoose from 'mongoose';
import '../mongoose-plugin.js';

const userSchema = new mongoose.Schema({
  userEmail: {
    type: String,
    required: true,
    unique: true,
  },
  userName: {
    type: String,
    required: true
  },
  password: {
    type: String,
    required: true
  },
  userRole: {
    type: String,
    enum: ['ADMIN', 'SUPERADMIN', 'APPROVER', 'STANDARDUSER'],
    required: true,
  },
  userMobile: {
    type: String
  },
  description: {
    type: String
  },
  companyId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'CompanyDetails'
  },
  refreshToken: [String]
});

const UserLogin = mongoose.model("UserLogin", userSchema);

export { UserLogin };
