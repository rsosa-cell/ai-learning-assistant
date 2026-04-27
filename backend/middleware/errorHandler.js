const errorHandler = (err, req, res, next) => {
    let statusCode = err.statusCode || 500;
    let message = err.message || 'Internal Server Error';

    // ... (Keep all your existing if statements for CastError, ValidationError, etc.)

    console.error('Error:', {
        message: err.message,
        stack: process.env.NODE_ENV === 'development' ? err.stack : undefined,
    });

    res.status(statusCode).json({
        success: false,
        error: message,
        statusCode,
        // ✅ FIXED: Only include stack if in development, without trying to call 'err'
        stack: process.env.NODE_ENV === 'development' ? err.stack : undefined
    });
}

export default errorHandler;