const mongoose = require('mongoose');

const userSchema = new mongoose.Schema({
  name: {
    type: String,
    required: true
  },
  email: {
    type: String,
    required: true,
    unique: true
  },
  password: {
    type: String,
    required: [true, 'Password cannot be empty. Please enter a password.'],
  },
  educationLevel: {
    type: String,
    enum: ['Undergraduate', 'Postgraduate'],
    required: true
  },
  interests: {
    type: [String],
    enum: ["Frontend","Backend","Full-Stack","Data scientist","AI Developer"],
    required: true
  },
  duration: {
    type: Number,
    required: true
  },
  priorKnowledge: {
    type: [String], 
    enum: ['Java', 'Python', 'JavaScript','Rust'], 
    required: true
  },
  futureCareerInterest: {
    type: String, 
    enum: ['Software Engineer', 'Data Scientist', 'AI Developer','Consultant'], 
    required: true
  }},
  {
    timestamps: true
});

userSchema.pre("save" , async function(next){ 
  if(!this.isModified("password")) return next();
  this.password = await bcrypt.hash(this.password , 10)
  next()
})
userSchema.methods.isPasswordCorrect = async function(password){
  return await bcrypt.compare(password , this.password)
} 

export const User = mongoose.model('User', userSchema);
