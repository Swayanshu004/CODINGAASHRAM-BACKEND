const mongoose = require('mongoose');

const creatorSchema = new mongoose.Schema({
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
  requestStatus: {
    type: String,
    enum: ['pending', 'accepted', 'rejected'],
    default: 'pending'
  },
  contents: {
    type: [
      {
        type: mongoose.Schema.Types.ObjectId,
        ref: "Content"
      }
    ], required: true
  }
}, {timestamps: true});

creatorSchema.pre("save" , async function(next){ 
  if(!this.isModified("password")) return next();
  this.password = await bcrypt.hash(this.password , 10)
  next()
})
creatorSchema.methods.isPasswordCorrect = async function(password){
  return await bcrypt.compare(password , this.password)
} 

export const Creator = mongoose.model('Creator', creatorSchema);