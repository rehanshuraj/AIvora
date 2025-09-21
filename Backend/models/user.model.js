import mongoose from "mongoose";
import bcrypt from "bcrypt";
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
    }
})

userSchema.statics.hashPassword = async function(password){
    return await bcrypt.hash(password, 10);
}

userSchema.