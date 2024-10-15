import { Router } from 'express'
import prisma from '../config/prisma.js';
import { userAuthentication } from '../middleware/index.js';
const userRouter = Router();

userRouter.use(userAuthentication())

userRouter.put("/update-profile", async (req, res) => {
   try {
      const body = req.body
      const userId = req.user.id
      await prisma.users.update({
         where: { id: userId },
         data: body
      })
      res.status(200).json({ success: true, message: "Profile updated successfully" })
   } catch (error) {
      console.log(error)
      res.status(500).json({ message: "Internal Server Error" })
   }
})
userRouter.get("/profile", async (req, res) => {
   try {
      const userId = req.user.id
      const user = await prisma.users.findUnique({
         where: { id: userId },
      })
      res.status(200).json({ success: true, user })
   } catch (error) {
      console.log(error)
      res.status(500).json({ message: "Internal Server Error" })
   }
})



export default userRouter
