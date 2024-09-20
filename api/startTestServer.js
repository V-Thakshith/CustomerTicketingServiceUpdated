const app = require('./server');
const connectDB = require('./config/testdb');

const startServer = async () => {
  try {
    await connectDB(); // Wait for the DB connection
    const PORT =  5001;
    const server = app.listen(PORT, () => {
      console.log(`Server running on port ${PORT}`);
    });
    return server;
  } catch (err) {
    console.error("Database connection failed. Server not started.", err);
    process.exit(1);
  }
};

module.exports = startServer;
