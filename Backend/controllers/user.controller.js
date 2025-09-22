import userModel from '../models/user.model.js';
import userService from '../services/user.service.js';
import { validationResult } from 'express-validation';



export const createUserController  = async (req , res) => {
    const errors = validationResult(req);

    if(!errors.isEmpty()){
        return res.status(400).json({ errors: errors.array() });
    }

    try{
        const user = await userService.createUser(req.body);

        //token nikallo
        const token = await user.generateJWT();

        res.status(201).json({ message: 'User created successfully', user,token });

        
    }catch(error){
        res.status(500).json({ message: error.message });
    }
}