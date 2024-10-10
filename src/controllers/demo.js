import { Router } from 'express'
import prisma from '../config/prisma.js';
const demoRouter = Router();

demoRouter.post('/create-employee', async (req, res) => {
   try {
      const body = req.body
      // Validate email
      const checkEmail = await prisma.users.findUnique({
         where: { email: body.email },
      })
      if (checkEmail) {
         return res.status(409).json({ success: false, message: 'Email already exists' })
      }
      // Add logic to create a new employee
      const employee = await prisma.users.create({
         data: body
      })
      return res.status(200).json({ success: true, message: 'Employee create successfully' })
   } catch (error) {
      console.log(error)
      return res.status(500).json({ success: false, error })
   }
})

export default demoRouter