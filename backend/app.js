const express = require("express");
const errorMiddleware = require("./middleware/errorMiddleware");
const { registerUser, loginUser, authMiddleware } = require("./auth");

const app = express();

// CORS Middleware
app.use((req, res, next) => {
    res.header("Access-Control-Allow-Origin", "*");
    res.header("Access-Control-Allow-Headers", "Origin, X-Requested-With, Content-Type, Accept, Authorization");
    res.header("Access-Control-Allow-Methods", "GET, POST, PUT, DELETE, OPTIONS");
    if (req.method === "OPTIONS") {
        return res.sendStatus(200);
    }
    next();
});

// JSON Body Parser
app.use(express.json());

// Legacy root auth endpoints
app.post("/register", async (req, res, next) => {
    try {
        const user = await registerUser(req.body);
        res.status(201).json({ success: true, user });
    } catch (error) {
        next(error);
    }
});

app.post("/login", async (req, res, next) => {
    try {
        const result = await loginUser(req.body);
        res.status(200).json({ success: true, ...result });
    } catch (error) {
        next(error);
    }
});

app.get("/me", authMiddleware, (req, res) => {
    res.status(200).json({ success: true, user: req.user });
});

// API Router
const apiRouter = express.Router();

// Support both /api/login and /api/auth/login
const handleRegister = async (req, res, next) => {
    try {
        const user = await registerUser(req.body);
        res.status(201).json({ success: true, user });
    } catch (error) {
        next(error);
    }
};

const handleLogin = async (req, res, next) => {
    try {
        const result = await loginUser(req.body);
        res.status(200).json({ success: true, ...result });
    } catch (error) {
        next(error);
    }
};

const handleMe = (req, res) => {
    res.status(200).json({ success: true, user: req.user });
};

apiRouter.post("/register", handleRegister);
apiRouter.post("/login", handleLogin);
apiRouter.get("/me", authMiddleware, handleMe);

apiRouter.post("/auth/register", handleRegister);
apiRouter.post("/auth/login", handleLogin);
apiRouter.get("/auth/me", authMiddleware, handleMe);

// Mount resource routes
apiRouter.use("/departments", require("./routes/departmentRoutes"));
apiRouter.use("/categories", require("./routes/categoryRoutes"));
apiRouter.use("/employees", require("./routes/employeeRoutes"));
apiRouter.use("/assets", require("./routes/assetRoutes"));
apiRouter.use("/reports", require("./routes/reportRoutes"));
apiRouter.use("/notifications", require("./routes/notificationRoutes"));
apiRouter.use("/allocations", require("./routes/allocationRoutes"));

// Mount API Router on /api
app.use("/api", apiRouter);

// Sample Route
app.get("/", (req, res) => {
    res.status(200).json({
        success: true,
        message: "Express Server is Running"
    });
});

// Route to test error handling
app.get("/error", (req, res, next) => {
    const error = new Error("Something went wrong!");
    error.statusCode = 500;
    next(error);
});

// Error Middleware (Always Last)
app.use(errorMiddleware);

module.exports = app;
