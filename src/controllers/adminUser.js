
import { Router } from 'express'
import prisma from '../config/prisma.js';
import { adminAuthentication } from '../middleware/index.js';
const adminUserRouter = Router();

adminUserRouter.use(adminAuthentication())
adminUserRouter.post('/create-employee', async (req, res) => {
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
      return res.status(200).json({ success: true, message: 'Employee create successfully', employee })
   } catch (error) {
      console.log(error)
      return res.status(500).json({ success: false, error })
   }
})
adminUserRouter.put("/update-employee/:id", async (req, res) => {
   try {
      const body = req.body
      const checkEmail = await prisma.users.findUnique({
         where: {
            email: body.email,
            NOT: { id: parseInt(req.params.id) }
         }
      })
      if (checkEmail) return res.status(409).json({ success: false, message: "Email already exists" })
      const employee = await prisma.users.update({
         where: { id: parseInt(req.params.id) },
         data: body
      })
      if (!employee) {
         return res.status(409).json({ success: false, message: 'Employee not found' })
      }
      return res.status(200).json({ success: true, message: 'Employee updated successfully', employee })
   } catch (error) {
      console.log(error)
      return res.status(500).json({ success: false, error })
   }
})
adminUserRouter.get("/read-employee/:id", async (req, res) => {
   try {
      const employee = await prisma.users.findUnique({
         where: { id: parseInt(req.params.id) }
      })
      if (!employee) {
         return res.status(404).json({ success: false, message: 'Employee not found' })
      }
      return res.status(200).json({ success: true, employee })
   } catch (error) {
      console.log(error)
      return res.status(500).json({ success: false, error })
   }
})
adminUserRouter.delete("/delete-employee/:id", async (req, res) => {
   try {
      const employee = await prisma.users.delete({
         where: { id: parseInt(req.params.id) }
      })
      if (!employee) {
         return res.status(404).json({ success: false, message: 'Employee not found' })
      }
      return res.status(200).json({ success: true, message: 'Employee deleted successfully' })
   } catch (error) {
      console.log(error)
      return res.status(500).json({ success: false, error })
   }
})
adminUserRouter.delete("/delete-employee", async (req, res) => {
   try {
      const { ids } = req.body

      const employees = await prisma.users.deleteMany({
         where: {
            id: {
               in: ids
            }
         }
      })
      return res.status(200).json({ success: true, message: 'All employees deleted successfully', count: employees.count })
   } catch (error) {
      console.log(error)
      return res.status(500).json({ success: false, error })
   }

})
adminUserRouter.get('/all-employees', async (req, res) => {
   try {
      const { search, column = 'createdAt', sortOrder = 'desc', page = 1, limit = 15 } = req.query
      const conditions = {}
      if (search) {
         conditions.OR = [
            { email: { contains: search, mode: "insensitive" } },
            { firstName: { contains: search, mode: "insensitive" } },
            { lastName: { contains: search, mode: "insensitive" } },
         ]
      }
      const query = {};
      if (column && sortOrder) {
         query.orderBy = { [column]: sortOrder }
      }
      const employees = await prisma.users.findMany({
         where: conditions,
         take: +limit,
         skip: (+page - 1) * +limit,
         ...query
      })
      const total = await prisma.users.count({ where: conditions })
      return res.status(200).json({ success: true, employees, total })
   } catch (error) {
      console.log(error)
      return res.status(500).json({ success: false, error })
   }
})

export default adminUserRouter
