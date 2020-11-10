import userRoute from "../routers/user.route";
import authRoute from "../routers/auth.route";
import productRoute from "../routers/product.route";
import initPassportLocal from "./../controllers/passport.controller/local";

initPassportLocal();

let webRouter = (app) => {
    app.use("/user", userRoute);
    app.use("/products", productRoute);
    app.use("/", authRoute);
}

module.exports = webRouter;
