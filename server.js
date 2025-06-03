const express = require('express');
const cors = require('cors');
const axios = require('axios');
const rateLimit = require('express-rate-limit');
const helmet = require('helmet');
require('dotenv').config();

const app = express();
const PORT = process.env.PORT || 3001;

// Middleware
app.use(helmet());
app.use(cors({
  origin: process.env.FRONTEND_URL || 'http://localhost:3000',
  credentials: true
}));
app.use(express.json({ limit: '10mb' }));

// Rate limiting
const limiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutes
  max: 100, // limit each IP to 100 requests per windowMs
  message: { error: 'Too many requests, please try again later.' }
});
app.use(limiter);

// Apify API base URL
const APIFY_API_BASE = 'https://api.apify.com/v2';

// Utility function to create Apify headers
const createApifyHeaders = (apiKey) => ({
  'Authorization': `Bearer ${apiKey}`,
  'Content-Type': 'application/json'
});

// Validation middleware for API key
const validateApiKey = (req, res, next) => {
  const apiKey = req.headers['x-api-key'] || req.body.apiKey;
  if (!apiKey) {
    return res.status(401).json({ error: 'API key is required' });
  }
  req.apiKey = apiKey;
  next();
};

// Error handler middleware
const errorHandler = (err, req, res, next) => {
  console.error('Error:', err);
  
  if (err.response?.status === 401) {
    return res.status(401).json({ error: 'Invalid API key' });
  }
  
  if (err.response?.status === 404) {
    return res.status(404).json({ error: 'Resource not found' });
  }
  
  if (err.code === 'ECONNREFUSED') {
    return res.status(503).json({ error: 'Apify service unavailable' });
  }
  
  res.status(500).json({ 
    error: 'Internal server error',
    message: err.message
  });
};

// Routes

// Health check
app.get('/health', (req, res) => {
  res.json({ status: 'OK', timestamp: new Date().toISOString() });
});

// Validate API key
app.post('/api/validate-key', async (req, res) => {
  try {
    const { apiKey } = req.body;
    
    if (!apiKey) {
      return res.status(400).json({ error: 'API key is required' });
    }
    
    // Test API key by fetching user info
    const response = await axios.get(`${APIFY_API_BASE}/users/me`, {
      headers: createApifyHeaders(apiKey)
    });
    
    res.json({ 
      valid: true, 
      user: {
        id: response.data.id,
        username: response.data.username,
        email: response.data.email
      }
    });
  } catch (error) {
    if (error.response?.status === 401) {
      return res.status(401).json({ valid: false, error: 'Invalid API key' });
    }
    throw error;
  }
});

// Get all available actors
app.get('/api/actors', validateApiKey, async (req, res) => {
  try {
    const { limit = 50, offset = 0, category, search } = req.query;
    
    let url = `${APIFY_API_BASE}/store`;
    const params = new URLSearchParams({
      limit: limit.toString(),
      offset: offset.toString()
    });
    
    if (category) params.append('category', category);
    if (search) params.append('search', search);
    
    const response = await axios.get(`${url}?${params}`, {
      headers: createApifyHeaders(req.apiKey)
    });
    
    const actors = response.data.items.map(actor => ({
      id: actor.id,
      username: actor.username,
      name: actor.name,
      title: actor.title,
      description: actor.description,
      pictureUrl: actor.pictureUrl,
      userPictureUrl: actor.userPictureUrl,
      stats: actor.stats,
      category: actor.category,
      isPublic: actor.isPublic,
      pricingModel: actor.pricingModel
    }));
    
    res.json({
      items: actors,
      total: response.data.total,
      count: response.data.count,
      offset: response.data.offset,
      limit: response.data.limit
    });
  } catch (error) {
    throw error;
  }
});

// Get specific actor details and input schema
app.get('/api/actors/:actorId', validateApiKey, async (req, res) => {
  try {
    const { actorId } = req.params;
    
    // Get actor details
    const actorResponse = await axios.get(`${APIFY_API_BASE}/acts/${actorId}`, {
      headers: createApifyHeaders(req.apiKey)
    });
    
    const actor = actorResponse.data;
    
    // Get input schema
    let inputSchema = null;
    try {
      const schemaResponse = await axios.get(`${APIFY_API_BASE}/acts/${actorId}/input-schema`, {
        headers: createApifyHeaders(req.apiKey)
      });
      inputSchema = schemaResponse.data;
    } catch (schemaError) {
      console.warn(`Could not fetch input schema for actor ${actorId}:`, schemaError.message);
    }
    
    res.json({
      id: actor.id,
      name: actor.name,
      username: actor.username,
      title: actor.title,
      description: actor.description,
      readme: actor.readme,
      inputSchema: inputSchema,
      stats: actor.stats,
      versions: actor.versions,
      defaultRunOptions: actor.defaultRunOptions
    });
  } catch (error) {
    throw error;
  }
});

// Execute an actor
app.post('/api/actors/:actorId/run', validateApiKey, async (req, res) => {
  try {
    const { actorId } = req.params;
    const { input = {}, options = {} } = req.body;
    
    const runData = {
      ...input
    };
    
    // Add optional run configuration
    const runOptions = {};
    if (options.timeout) runOptions.timeout = options.timeout;
    if (options.memory) runOptions.memory = options.memory;
    if (options.build) runOptions.build = options.build;
    
    const response = await axios.post(
      `${APIFY_API_BASE}/acts/${actorId}/runs`,
      runData,
      {
        headers: createApifyHeaders(req.apiKey),
        params: runOptions
      }
    );
    
    const run = response.data;
    
    res.json({
      id: run.id,
      actId: run.actId,
      status: run.status,
      startedAt: run.startedAt,
      finishedAt: run.finishedAt,
      stats: run.stats,
      options: run.options,
      defaultDatasetId: run.defaultDatasetId,
      defaultKeyValueStoreId: run.defaultKeyValueStoreId,
      buildId: run.buildId
    });
  } catch (error) {
    throw error;
  }
});

// Get run status and details
app.get('/api/runs/:runId', validateApiKey, async (req, res) => {
  try {
    const { runId } = req.params;
    
    const response = await axios.get(`${APIFY_API_BASE}/actor-runs/${runId}`, {
      headers: createApifyHeaders(req.apiKey)
    });
    
    const run = response.data;
    
    res.json({
      id: run.id,
      actId: run.actId,
      status: run.status,
      startedAt: run.startedAt,
      finishedAt: run.finishedAt,
      stats: run.stats,
      options: run.options,
      exitCode: run.exitCode,
      defaultDatasetId: run.defaultDatasetId,
      defaultKeyValueStoreId: run.defaultKeyValueStoreId,
      containerUrl: run.containerUrl,
      buildId: run.buildId
    });
  } catch (error) {
    throw error;
  }
});

// Get run results from dataset
app.get('/api/runs/:runId/results', validateApiKey, async (req, res) => {
  try {
    const { runId } = req.params;
    const { format = 'json', limit = 1000, offset = 0 } = req.query;
    
    // First get the run to find the dataset ID
    const runResponse = await axios.get(`${APIFY_API_BASE}/actor-runs/${runId}`, {
      headers: createApifyHeaders(req.apiKey)
    });
    
    const datasetId = runResponse.data.defaultDatasetId;
    if (!datasetId) {
      return res.json({ items: [], total: 0 });
    }
    
    // Get dataset items
    const datasetResponse = await axios.get(`${APIFY_API_BASE}/datasets/${datasetId}/items`, {
      headers: createApifyHeaders(req.apiKey),
      params: {
        format,
        limit,
        offset
      }
    });
    
    // For JSON format, return structured response
    if (format === 'json') {
      const items = Array.isArray(datasetResponse.data) ? datasetResponse.data : [datasetResponse.data];
      res.json({
        items,
        total: items.length,
        format
      });
    } else {
      // For other formats (CSV, etc.), return raw data
      res.set('Content-Type', datasetResponse.headers['content-type']);
      res.send(datasetResponse.data);
    }
  } catch (error) {
    throw error;
  }
});

// Get run logs
app.get('/api/runs/:runId/log', validateApiKey, async (req, res) => {
  try {
    const { runId } = req.params;
    
    const response = await axios.get(`${APIFY_API_BASE}/actor-runs/${runId}/log`, {
      headers: createApifyHeaders(req.apiKey)
    });
    
    res.set('Content-Type', 'text/plain');
    res.send(response.data);
  } catch (error) {
    throw error;
  }
});

// Stop/abort a running actor
app.post('/api/runs/:runId/abort', validateApiKey, async (req, res) => {
  try {
    const { runId } = req.params;
    
    const response = await axios.post(`${APIFY_API_BASE}/actor-runs/${runId}/abort`, {}, {
      headers: createApifyHeaders(req.apiKey)
    });
    
    res.json({
      id: response.data.id,
      status: response.data.status,
      finishedAt: response.data.finishedAt
    });
  } catch (error) {
    throw error;
  }
});

// Get user's runs history
app.get('/api/runs', validateApiKey, async (req, res) => {
  try {
    const { limit = 50, offset = 0, status } = req.query;
    
    const params = { limit, offset };
    if (status) params.status = status;
    
    const response = await axios.get(`${APIFY_API_BASE}/actor-runs`, {
      headers: createApifyHeaders(req.apiKey),
      params
    });
    
    const runs = response.data.items.map(run => ({
      id: run.id,
      actId: run.actId,
      status: run.status,
      startedAt: run.startedAt,
      finishedAt: run.finishedAt,
      stats: run.stats,
      buildNumber: run.buildNumber,
      exitCode: run.exitCode
    }));
    
    res.json({
      items: runs,
      total: response.data.total,
      count: response.data.count,
      offset: response.data.offset,
      limit: response.data.limit
    });
  } catch (error) {
    throw error;
  }
});

// WebSocket endpoint for real-time run updates (if needed)
const http = require('http');
const { Server } = require('socket.io');

const server = http.createServer(app);
const io = new Server(server, {
  cors: {
    origin: process.env.FRONTEND_URL || 'http://localhost:3000',
    methods: ['GET', 'POST']
  }
});

// WebSocket connection handling
io.on('connection', (socket) => {
  console.log('Client connected:', socket.id);
  
  socket.on('subscribe-run', (runId) => {
    console.log(`Client ${socket.id} subscribed to run ${runId}`);
    socket.join(`run-${runId}`);
  });
  
  socket.on('unsubscribe-run', (runId) => {
    console.log(`Client ${socket.id} unsubscribed from run ${runId}`);
    socket.leave(`run-${runId}`);
  });
  
  socket.on('disconnect', () => {
    console.log('Client disconnected:', socket.id);
  });
});

// Polling function to check run status and emit updates
const pollRunStatus = async (runId, apiKey) => {
  try {
    const response = await axios.get(`${APIFY_API_BASE}/actor-runs/${runId}`, {
      headers: createApifyHeaders(apiKey)
    });
    
    const run = response.data;
    io.to(`run-${runId}`).emit('run-update', {
      id: run.id,
      status: run.status,
      stats: run.stats,
      finishedAt: run.finishedAt,
      exitCode: run.exitCode
    });
    
    // Continue polling if run is still running
    if (run.status === 'RUNNING') {
      setTimeout(() => pollRunStatus(runId, apiKey), 5000);
    }
  } catch (error) {
    console.error('Error polling run status:', error.message);
    io.to(`run-${runId}`).emit('run-error', { error: error.message });
  }
};

// Enhanced run endpoint with real-time updates
app.post('/api/actors/:actorId/run-with-updates', validateApiKey, async (req, res) => {
  try {
    const { actorId } = req.params;
    const { input = {}, options = {} } = req.body;
    
    const runData = { ...input };
    const runOptions = {};
    if (options.timeout) runOptions.timeout = options.timeout;
    if (options.memory) runOptions.memory = options.memory;
    if (options.build) runOptions.build = options.build;
    
    const response = await axios.post(
      `${APIFY_API_BASE}/acts/${actorId}/runs`,
      runData,
      {
        headers: createApifyHeaders(req.apiKey),
        params: runOptions
      }
    );
    
    const run = response.data;
    
    // Start polling for updates
    if (run.status === 'RUNNING') {
      setTimeout(() => pollRunStatus(run.id, req.apiKey), 2000);
    }
    
    res.json({
      id: run.id,
      actId: run.actId,
      status: run.status,
      startedAt: run.startedAt,
      finishedAt: run.finishedAt,
      stats: run.stats,
      options: run.options,
      defaultDatasetId: run.defaultDatasetId,
      defaultKeyValueStoreId: run.defaultKeyValueStoreId,
      buildId: run.buildId
    });
  } catch (error) {
    throw error;
  }
});

// Apply error handling middleware
app.use(errorHandler);

// Start server
server.listen(PORT, () => {
  console.log(`🚀Apify Backend API running on port ${PORT}`);
  console.log(` Health check: http://localhost:${PORT}/health`);
});

module.exports = app;