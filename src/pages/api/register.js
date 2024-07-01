import bcrypt from 'bcryptjs'
import { PrismaClient } from '@prisma/client'

const prisma = new PrismaClient()

export default async function register(req, res) {
   
    if(req.method === 'POST') {
      
        const { email, password } = req.body

        const salt = bcrypt.genSaltSync(10)
        const hashedPassword = bcrypt.hashSync(password, salt)

        try {
            const newUser = await prisma.user.create({
                data: {
                    email,
                    password: hashedPassword
                },
            });
            res.status(201).json(newUser);
        } catch (error) {
            res.status(500).json({ message : "User creation failed", error: error.message})
        }


    } 
    else{
        res.status(405).json({ message : 'Method not allowed'})
    }
}
