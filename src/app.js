const express = require("express");
const { connectDB } = require("./config/db");
const cookieParser = require("cookie-parser");
require('dotenv').config();
const app = express();
const {authRouter }= require('./routes/auth.route')

const cors = require('cors');
const { userRouter } = require("./routes/user.route");
const PORT = process.env.PORT || 8080
const ClientURL = process.env.ClientURL;
const ClientURL2 = process.env.ClientURL2;

connectDB();

app.use(cookieParser())

const corsOptions = {
  credentials: true,
  origin: function (origin, callback) {
    if (!origin || process.env.NODE_ENV === 'development') {
      callback(null, true);

    } else {
      const allowedOrigins = [ClientURL, ClientURL2];

      if (allowedOrigins.indexOf(origin) !== -1) {
        callback(null, true);
      } else {
        callback(new Error('Origin not allowed by CORS'));
      }
    }
  }
};

app.use(cors(corsOptions));

app.use(express.json())
app.use(express.urlencoded({ extended: true }))

app.use('/api/auth', authRouter)
app.use('/api/user', userRouter)

app.use("*", (req, res) => res.status(404).json({
  success: false,
  message: 'Route not found',
  data: null,
  error: 'NOT_FOUND'
}))

app.listen(PORT, () => {
  console.log("Server Running on port :", PORT)
})