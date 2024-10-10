import { Router } from 'express'
import prisma from '../config/prisma.js';
import { adminAuthentication } from '../middleware/index.js';
const leaveFormatRouter = Router();

leaveFormatRouter.use(adminAuthentication())

leaveFormatRouter.post('/create-format', async (req, res) => {
   try {
      const body = req.body
      const checkName = await prisma.leaveFormat.findUnique({
         where: { name: body.name }
      })
      if (checkName) {
         return res.status(409).json({ success: false, message: 'Format name already exists' })
      }
      const format = await prisma.leaveFormat.create({
         data: body
      })
      if (!format) {
         return res.status(400).json({ success: false, message: 'Error creating format' })
      }
      return res.status(201).json({ success: true, message: 'Format created successfully', format })
   } catch (error) {
      console.log(error)
      return res.status(500).json({ success: false, message: 'Error creating format', error })
   }
})
leaveFormatRouter.put('/update-format/:id', async (req, res) => {
   try {
      const body = req.body
      const checkName = await prisma.leaveFormat.findUnique({
         where: {
            name: body.name,
            NOT: { id: parseInt(req.params.id) }
         }
      })
      if (checkName) {
         return res.status(409).json({ success: false, message: 'Format name already exists' })
      }
      const updatedFormat = await prisma.leaveFormat.update({
         where: { id: parseInt(req.params.id) },
         data: body
      })
      return res.status(200).json({ success: true, message: 'Format updated successfully', updatedFormat })
   } catch (error) {
      console.log(error)
      return res.status(500).json({ success: false, message: 'Error updating format', error })
   }
})
leaveFormatRouter.get('/read-format/:id', async (req, res) => {
   try {
      const format = await prisma.leaveFormat.findUnique({
         where: { id: parseInt(req.params.id) }
      })
      if (!format) {
         return res.status(409).json({ success: false, message: 'Format not found' })
      }
      return res.status(200).json({ success: true, message: 'Format retrieved successfully', format })
   } catch (error) {
      console.log(error)
      return res.status(500).json({ success: false, message: 'Error retrieving format', error })
   }
})
leaveFormatRouter.get('/all-formats', async (req, res) => {
   try {
      const formats = await prisma.leaveFormat.findMany()
      return res.status(200).json({ success: true, message: 'All formats retrieved successfully', formats })
   } catch (error) {
      console.log(error)
      return res.status(500).json({ success: false, message: 'Error retrieving formats', error })
   }
})
export default leaveFormatRouter

