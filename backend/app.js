const express = require("express");
const errorMiddleware = require("./middleware/errorMiddleware");
const { registerUser, loginUser, authMiddleware } = require("./auth");

const app = express();

// Middleware
app.use(express.json());

// Sample Route
app.get("/", (req, res) => {
    res.status(200).json({
        success: true,
        message: "Express Server is Running"
    });
});

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

// Route to test error handling
app.get("/error", (req, res, next) => {
    const error = new Error("Something went wrong!");
    error.statusCode = 500;
    next(error);
});

// Error Middleware (Always Last)
app.use(errorMiddleware);

module.exports = app;