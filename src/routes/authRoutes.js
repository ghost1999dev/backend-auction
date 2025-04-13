import { Router } from "express";

const loginRouter = Router();

loginRouter.get("/google", (req, res) => {
    res.redirect(`http://localhost:4200/#/main/dashboard`);
    //res.send(req.user)
}
);

export { loginRouter };