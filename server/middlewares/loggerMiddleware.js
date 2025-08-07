const logger = (req, res, next) => {
  const start = Date.now();

  // Capture finish to get response status and time
  res.on('finish', () => {
    const duration = Date.now() - start;
    const log = `[${new Date().toISOString()}] [${req.method}] ${req.originalUrl} ${res.statusCode} - ${duration}ms`;
    console.log(log);
  });

  next();
};

export default logger;
