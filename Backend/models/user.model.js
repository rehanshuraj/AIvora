import mongoose from "mongoose";
import bcrypt from "bcrypt";
import jwt from "jsonwebtoken";
import { use } from "react";
const userSchema =  new mongoose.Schema({
    email:{
        type: String,
        required : true,
        unique  : true,
        trim : true,
        lowercase : true,
        minLength  : [6, 'Email must be at least 6 characters long'],
        maxLength  : [50, 'Email must be at most 50 characters long'],
        match : [/^\w+([\.-]?\w+)*@\w+([\.-]?\w+)*(\.\w{2,3})+$/, 'Please fill a valid email address']
    },

    password:{
        type: String,  
        select : false,  
    }
})

// Static method to hash password before saving to database 
userSchema.statics.hashPassword = async function(password){
    return await bcrypt.hash(password, 10);
}

// Instance method to compare password for login, compared with hashed password in database
userSchema.methods.isValidPassword = async function(password){
    return await bcrypt.compare(password, this.password);
}

// Instance method to generate JWT token so that user can access protected routes 
userSchema.methods.generateJWT = function(){
    return jwt.sign({ email: this.email }, process.env.JWT_SECRET, { expiresIn: '1h' });
}  

const User = mongoose.model('user', userSchema);

export default User;