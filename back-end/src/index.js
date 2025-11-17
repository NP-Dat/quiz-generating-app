require('dotenv').config();

const app = require('./app');
const connectDb = require('./db');

const PORT = process.env.PORT || 4000;

const startServer = async () => {
  try {
    await connectDb();

    app.listen(PORT, () => {
      console.log(`API server listening on port ${PORT}`);
    });
  } catch (error) {
    console.error('Failed to start server:', error);
    process.exit(1);
  }
};

startServer();

