const express = require('express');
const requireJwtAuth = require('~/server/middleware/requireJwtAuth');
const { 
    publishArtifact, 
    getArtifacts, 
    getArtifactById, 
    updateArtifactStats,
    createArtifactSession,
    updateArtifactSession,
    getArtifactSessions,
    getArtifactAnalytics,
  } = require('~/models/Artifact');
  
const router = express.Router();

// Public routes (no auth required)
router.get('/public', async (req, res) => {
  try {
    const { category, limit = 50, skip = 0, sort = 'createdAt' } = req.query;
    const filter = { isPublished: true };
    
    if (category && category !== 'All') {
      filter.category = category;
    }

    const sortObj = {};
    if (sort === 'likes') sortObj.likes = -1;
    else if (sort === 'plays') sortObj.plays = -1;
    else sortObj.createdAt = -1;

    const artifacts = await getArtifacts(filter, { 
      limit: parseInt(limit), 
      skip: parseInt(skip), 
      sort: sortObj 
    });
    
    res.status(200).json(artifacts);
  } catch (error) {
    res.status(500).json({ error: 'Error fetching artifacts' });
  }
});

router.get('/public/:artifactId', async (req, res) => {
  try {
    const artifact = await getArtifactById(req.params.artifactId);
    if (artifact && artifact.isPublished) {
      res.status(200).json(artifact);
    } else {
      res.status(404).json({ error: 'Artifact not found' });
    }
  } catch (error) {
    res.status(500).json({ error: 'Error fetching artifact' });
  }
});

// Public engagement routes (no auth required)
router.post('/public/:artifactId/play', async (req, res) => {
  try {
    await updateArtifactStats(req.params.artifactId, { $inc: { plays: 1 } });
    res.status(200).json({ success: true });
  } catch (error) {
    res.status(500).json({ error: 'Error updating play count' });
  }
});

router.post('/public/:artifactId/like', async (req, res) => {
  try {
    await updateArtifactStats(req.params.artifactId, { $inc: { likes: 1 } });
    res.status(200).json({ success: true });
  } catch (error) {
    res.status(500).json({ error: 'Error updating like count' });
  }
});

// Protected routes
router.use(requireJwtAuth);

router.post('/publish', async (req, res) => {
  try {
    const artifactData = {
      ...req.body,
      author: req.user.id,
    };
    const artifact = await publishArtifact(artifactData);
    res.status(201).json(artifact);
  } catch (error) {
    res.status(500).json({ error: 'Error publishing artifact' });
  }
});

router.post('/:artifactId/play', async (req, res) => {
  try {
    await updateArtifactStats(req.params.artifactId, { $inc: { plays: 1 } });
    res.status(200).json({ success: true });
  } catch (error) {
    res.status(500).json({ error: 'Error updating play count' });
  }
});

router.post('/:artifactId/like', async (req, res) => {
  try {
    await updateArtifactStats(req.params.artifactId, { $inc: { likes: 1 } });
    res.status(200).json({ success: true });
  } catch (error) {
    res.status(500).json({ error: 'Error updating like count' });
  }
});

// Session management routes
router.post('/:artifactId/sessions', async (req, res) => {
  try {
    const sessionData = {
      ...req.body,
      artifactId: req.params.artifactId,
      userId: req.user.id,
    };
    const session = await createArtifactSession(sessionData);
    res.status(201).json(session);
  } catch (error) {
    res.status(500).json({ error: 'Error creating session' });
  }
});

router.patch('/sessions/:sessionId', async (req, res) => {
  try {
    const session = await updateArtifactSession(req.params.sessionId, req.body);
    res.status(200).json(session);
  } catch (error) {
    res.status(500).json({ error: 'Error updating session' });
  }
});

router.get('/:artifactId/sessions', async (req, res) => {
  try {
    const sessions = await getArtifactSessions({ artifactId: req.params.artifactId });
    res.status(200).json(sessions);
  } catch (error) {
    res.status(500).json({ error: 'Error fetching sessions' });
  }
});

router.get('/:artifactId/analytics', async (req, res) => {
  try {
    const analytics = await getArtifactAnalytics(req.params.artifactId);
    res.status(200).json(analytics);
  } catch (error) {
    res.status(500).json({ error: 'Error fetching analytics' });
  }
});

module.exports = router;