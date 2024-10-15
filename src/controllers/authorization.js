
import { Router } from 'express'
import prisma from '../config/prisma.js';
import { Google } from "arctic";
import jwt from 'jsonwebtoken';

const authorizationRouter = Router();
const google = new Google(process.env.GOOGLE_CLIENT_ID, process.env.GOOGLE_CLIENT_SECRET, process.env.GOOGLE_REDIRECT_URL);

export function cookieParams() {
   return {
      maxAge: 24 * 60 * 60 * 1000, // 24 hours
      httpOnly: false,
      secure: true,
      sameSite: 'strict',
      domain: process.env.ENVIRONMENT === 'production' ? '.girlpowertalk.com' : 'localhost',
   };
}

authorizationRouter.get("/google-login", async (req, res) => {
   try {
      const url = await google.createAuthorizationURL('', 'girlpowertalk', {
         scopes: ["profile", "email"]
      });
      // return res.status(200).json({ success: true, url })
      return res.redirect(url)
      // const GOOGLE_CLIENT_ID = process.env.GOOGLE_CLIENT_ID
      // const GOOGLE_CLIENT_SECRET = process.env.GOOGLE_CLIENT_SECRET
      // const GOOGLE_REDIRECT_URL = process.env.GOOGLE_REDIRECT_URL

      // return res.status(200).json({ success: true, GOOGLE_CLIENT_ID, GOOGLE_CLIENT_SECRET, GOOGLE_REDIRECT_URL })
   } catch (error) {
      console.log(error)
      return res.status(500).json({ success: false, message: 'Error creating authorization', error })
   }
})
authorizationRouter.get("/google/callback", async (req, res) => {
   try {
      const { code } = req.query
      const tokens = await google.validateAuthorizationCode(code, 'girlpowertalk');
      const response = await fetch("https://openidconnect.googleapis.com/v1/userinfo", {
         headers: {
            Authorization: `Bearer ${tokens.accessToken}`
         }
      });
      const user = await response.json();

      const findUser = await prisma.users.findUnique({
         where: { email: user.email }
      })
      if (!findUser) {
         return res.redirect(`${process.env.ALLOWED_ORIGIN}/dashboard/login?google=error`)
      }
      await prisma.users.update({
         where: { email: user.email },
         data: {
            picture: user.picture
         }
      })
      const payload = {
         id: findUser.id,
         fullName: findUser?.firstName ? findUser.firstName + ' ' + findUser.lastName : 'User',
         email: findUser.email,
         picture: findUser.picture,
         role: findUser.role,
         purpose: 'login'
      }
      const token = jwt.sign(payload, process.env.JWT_SECRET, { expiresIn: '7d' });
      res.cookie('token', token, cookieParams());
      return res.redirect(`${process.env.ALLOWED_ORIGIN}/dashboard/login?google=success`)

   } catch (error) {
      console.log(error)
      return res.status(500).json({ success: false, error })
   }
})
authorizationRouter.get('/check-token', async (req, res) => {
   try {
      const cookie_token = req.cookies.token
      function getToken() {
         const authorization = req.headers['authorization']
         if (!authorization || !authorization.startsWith('Bearer ')) {
            return res.status(409).send({ login: false, message: 'token not found' })
         } else {
            return authorization.split(' ')[1]
         }
      }

      const token = cookie_token || getToken()
      if (!token) {
         return res.status(409).send({ success: false, message: "No token provided" })
      }
      const decoded = jwt.verify(token, process.env.JWT_SECRET)
      if (decoded?.purpose !== 'login') return res.status(409).json({ success: false, login: false, message: 'this token not for login purpose' })

      return res.status(200).send({ success: true, login: true, decoded })
   } catch (error) {
      console.error(error)
      return res.status(500).send({ success: false, message: "Failed to authenticate token" })
   }
})

export default authorizationRouter