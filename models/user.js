import mongoose from 'mongoose';

const userSchema = new mongoose.Schema({
  email: {
    type: String,
    required: true,
    unique: true,
    match: [/.+@.+\..+/, "Please enter a valid email address"]
  },
  userName: {
    type: String,
    required: true
  },
  password: {
    type: String,
    required: true
  },
  role: {
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
  companyDetailsId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'CompanyDetails'
  },
  refreshToken: [String]
});

const UserLogin = mongoose.model("UserLogin", userSchema);

export { UserLogin };
