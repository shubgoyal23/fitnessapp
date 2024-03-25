import express from "express";

const app = express();
app.use(express.json({ limit: "16kb" }));
app.use(express.urlencoded({ extended: true, limit: "16kb" }));



import userRouter from './route/user.route.js'
import infoRouter from './route/information.route.js'

app.use("/api/v1/user", userRouter)
app.use("/api/v1/info", infoRouter)

app.use((err, req, res, next) => {
   if (err instanceof ApiError) {
      res.status(err.statusCode).json({
         success: false,
         message: err.message,
         errors: err.errors,
      });
   } else {
      console.error(err);
      res.status(500).json({
         success: false,
         message: err.message,
      });
   }
});

export { app };
