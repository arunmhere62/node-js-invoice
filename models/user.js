import mongoose from "mongoose";

const User = mongoose.Schema({

  username: {
    type: String,
    required: false,
  },
  email: {
    type: String,
    required: false,
  },
  password: {
    type: String || Number,
    required: false,
  }
});

const UserLogin = mongoose.model("UserLogin", User);
export { UserLogin };