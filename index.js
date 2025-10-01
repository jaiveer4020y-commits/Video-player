import express from 'express';
import cors from 'cors';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const app = express();
const PORT = process.env.PORT || 3000;

// Middleware
app.use(cors());
app.use(express.static('public'));
app.use(express.json());

// Serve the main page
app.get('/', (req, res) => {
  res.sendFile(path.join(__dirname, 'public', 'index.html'));
});

// Proxy API endpoint to avoid CORS issues
app.get('/api/proxy-get-stream', async (req, res) => {
  try {
    const { title } = req.query;
    
    if (!title) {
      return res.json({ success: false, error: 'Title parameter required' });
    }

    const response = await fetch(`https://u-1-1azw.onrender.com/api/get-stream?title=${encodeURIComponent(title)}`);
    const data = await response.json();
    
    res.json(data);
  } catch (error) {
    res.json({ success: false, error: error.message });
  }
});

// Health check
app.get('/health', (req, res) => {
  res.json({ status: 'OK', service: 'Video Player Web' });
});

app.listen(PORT, () => {
  console.log(`🚀 Server running on port ${PORT}`);
  console.log(`📱 Video Player Web: http://localhost:${PORT}`);
});
