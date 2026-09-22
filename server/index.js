import 'dotenv/config';
import express from 'express';
import cors from 'cors';
import { clerkMiddleware } from '@clerk/express';
import connectDB from './config/db.js';
import mediaRoutes from './routes/media.js';
import categoryRoutes from './routes/categories.js';
import commentRoutes from './routes/comments.js';
import userRoutes from './routes/users.js';
import { notFound, errorHandler } from './middleware/error.js';

const app = express();
const allowedOrigins = (process.env.CLIENT_URL || 'http://localhost:5173,http://localhost:5174,http://localhost:5175').split(',').map((url) => url.trim());

app.use(
  cors({
    origin: (origin, callback) => {
      if (!origin || allowedOrigins.includes(origin) || /^http:\/\/localhost:\d+$/.test(origin) || /^http:\/\/127\.0\.0\.1:\d+$/.test(origin)) {
        callback(null, true);
        return;
      }
      callback(new Error('Not allowed by CORS'));
    },
    credentials: true,
  })
);
app.use(express.json({ limit: '2mb' }));
app.use(clerkMiddleware()); // attaches req.auth

app.get('/api/health', (req, res) => res.json({ ok: true, service: 'accj-hub' }));

app.use('/api/media', mediaRoutes);
app.use('/api/categories', categoryRoutes);
app.use('/api', commentRoutes); // /api/media/:id/comments + /api/comments/:id
app.use('/api/users', userRoutes);

app.use(notFound);
app.use(errorHandler);

const PORT = process.env.PORT || 5000;
connectDB().then(() => {
  app.listen(PORT, () => console.log(`ACCJ HUB API running on port ${PORT}`));
});
