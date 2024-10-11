import { Router } from 'express'
import prisma from '../config/prisma.js';
import { UsersData } from '../data/user.js';
const demoRouter = Router();

demoRouter.post('/create-employee', async (req, res) => {
   try {

      UsersData.forEach(async (user) => {
         const checkEmail = await prisma.users.findUnique({
            where: { email: user.email },
         })
         if (!checkEmail) {
            await prisma.users.create({
               data: user
            })
         }
      });

      return res.status(200).json({ success: true, message: 'Employee create successfully' })
   } catch (error) {
      console.log(error)
      return res.status(500).json({ success: false, error })
   }
})

export default demoRouter