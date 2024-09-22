import mongoose from "mongoose";

const userSchema = new mongoose.Schema({
  name: {
    type: String,
    required: [true, 'Name is required.']
  },
  email: {
    type: String,
    required: [true, 'Email is required.'],
    unique: true
  },
  password: {
    type: String,
    required: [true, 'Password cannot be empty. Please enter a password.']
  },
  roadmaps: {
    type: [
      {
        type: mongoose.Schema.Types.ObjectId,
        ref: "Book"
      }
    ], required: true
  }
}, {timestamps: true});

userSchema.pre("save" , async function(next){ 
  if(!this.isModified("password")) return next();
  this.password = await bcrypt.hash(this.password , 10)
  next()
})
userSchema.methods.isPasswordCorrect = async function(password){
  return await bcrypt.compare(password , this.password)
} 

export const User = mongoose.model('User', userSchema);
