const express = require("express");
const errorMiddleware = require("./middleware/errorMiddleware");

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

// Route to test error handling
app.get("/error", (req, res, next) => {
    const error = new Error("Something went wrong!");
    error.statusCode = 500;
    next(error);
});

// Error Middleware (Always Last)
app.use(errorMiddleware);

module.exports = app;