import { Router, type IRouter } from "express";
import healthRouter from "./health.js";
import authRouter from "./auth.js";
import dashboardRouter from "./dashboard.js";
import scannerRouter from "./scanner.js";
import watchlistRouter from "./watchlist.js";
import portfolioRouter from "./portfolio.js";
import tradesRouter from "./trades.js";
import newsRouter from "./news.js";
import chatRouter from "./chat.js";
import notificationsRouter from "./notifications.js";

const router: IRouter = Router();

router.use(healthRouter);
router.use(authRouter);
router.use(dashboardRouter);
router.use(scannerRouter);
router.use(watchlistRouter);
router.use(portfolioRouter);
router.use(tradesRouter);
router.use(newsRouter);
router.use(chatRouter);
router.use(notificationsRouter);

export default router;
