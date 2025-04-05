const express = require("express");
const { connectDB } = require("./config/db");
const cookieParser = require("cookie-parser");
require('dotenv').config();
const app = express();
const { authRouter } = require('./routes/auth.route')

const cors = require('cors');
const { userRouter } = require("./routes/user.route");
const { uploadRouter } = require("./routes/upload.route");
const { productRouter } = require("./routes/product.route");
const { categoryRouter } = require("./routes/category.route");
const { orderRouter } = require("./routes/order.route");
const { enquiryRouter } = require("./routes/enquiry.route");
const { discountRouter } = require("./routes/discount.route");
const { dashboardRouter } = require("./routes/dashboard.route");
const { bannerRouter } = require("./routes/banner.route");
const { testimonialRouter } = require("./routes/testimonial.route");
const { webHookRouter } = require("./routes/webhook.route");
const { chargeRouter } = require("./routes/charge.route");
const { zoneRouter } = require("./routes/zone.route");

const PORT = process.env.PORT || 8080
const ClientURL = process.env.ClientURL;
const ClientURL2 = process.env.ClientURL2;
const ClientURL3 = process.env.ClientProductionURL;

connectDB();

app.use(cookieParser())

const corsOptions = {
  credentials: true,
  origin: function (origin, callback) {
    if (!origin || process.env.NODE_ENV === 'development') {
      callback(null, true);

    } else {
      const allowedOrigins = [ClientURL, ClientURL2, ClientURL3];

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

app.use('/api/webhook', webHookRouter)
app.use('/api/auth', authRouter)
app.use('/api/categories', categoryRouter)
app.use('/api/enquiries', enquiryRouter)
app.use('/api/orders', orderRouter)
app.use('/api/products', productRouter)
app.use('/api/uploads', uploadRouter)
app.use('/api/users', userRouter)
app.use('/api/discounts', discountRouter)
app.use('/api/dashboard', dashboardRouter)
app.use('/api/banners', bannerRouter)
app.use('/api/testimonials', testimonialRouter)
app.use('/api/charges', chargeRouter)
app.use('/api/zones', zoneRouter)

app.use("*", (req, res) => res.status(404).json({
  success: false,
  message: 'Route not found',
  data: null,
  error: 'NOT_FOUND'
}))

app.listen(PORT, () => {
  console.log("Server Running on port :", PORT)
})