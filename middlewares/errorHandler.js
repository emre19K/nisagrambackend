const errorHandler = (err, req, res, next) => {
    // Protokollierung des Fehlers
    console.error(err.stack);
    
    // Standard-Statuscode und Fehlermeldung
    const statusCode = err.statusCode || 500;
    const message = err.message || 'Internal Server Error';
    // Spezifische Behandlung für bekannte Fehlertypen
    if (err.name === 'ValidationError') {
      return res.status(400).json({
        success: false,
        errorCode: 'VALIDATION_ERROR',
        message: 'Validation Error',
        details: err.errors,
      });
    }
    
    if (err.name === 'UnauthorizedError') {
      return res.status(401).json({
        success: false,
        errorCode: 'UNAUTHORIZED_ERROR',
        message: 'Unauthorized',
      });
    }
    
    // Generische Fehlerbehandlung
    res.status(statusCode).json({
      success: false,
      errorCode: err.errorCode || 'INTERNAL_SERVER_ERROR',
      message: message,
    });
    
    // damit der linter nicht rumzickt
    next();
  };
  
  module.exports = errorHandler;
  