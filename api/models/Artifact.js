const { logger } = require('@librechat/data-schemas');
const { Artifact, ArtifactSession } = require('~/db/models');
const { v4: uuidv4 } = require('uuid');

/**
 * Publishes a new artifact to the platform
 * @param {Object} artifactData - The artifact data
 * @returns {Promise<IArtifact>} The created artifact
 */
const publishArtifact = async (artifactData) => {
  try {
    const artifact = new Artifact({
      artifactId: uuidv4(),
      ...artifactData,
    });

    const savedArtifact = await artifact.save();
    logger.info(`[publishArtifact] Artifact published: ${savedArtifact.artifactId}`);
    return savedArtifact.toObject();
  } catch (error) {
    logger.error('[publishArtifact] Error publishing artifact', error);
    throw new Error('Error publishing artifact');
  }
};

/**
 * Retrieves artifacts with optional filtering
 * @param {Object} filter - MongoDB filter object
 * @param {Object} options - Query options (limit, skip, sort)
 * @returns {Promise<IArtifact[]>} Array of artifacts
 */
const getArtifacts = async (filter = {}, options = {}) => {
  try {
    const { limit = 50, skip = 0, sort = { createdAt: -1 } } = options;
    
    const artifacts = await Artifact.find(filter)
      .sort(sort)
      .skip(skip)
      .limit(limit)
      .lean();

    return artifacts;
  } catch (error) {
    logger.error('[getArtifacts] Error fetching artifacts', error);
    throw new Error('Error fetching artifacts');
  }
};

/**
 * Retrieves a single artifact by ID
 * @param {string} artifactId - The artifact ID
 * @returns {Promise<IArtifact | null>} The artifact object or null
 */
const getArtifactById = async (artifactId) => {
  try {
    return await Artifact.findOne({ artifactId }).lean();
  } catch (error) {
    logger.error('[getArtifactById] Error fetching artifact', error);
    throw new Error('Error fetching artifact');
  }
};

/**
 * Updates artifact statistics
 * @param {string} artifactId - The artifact ID
 * @param {Object} updateData - The update data
 * @returns {Promise<IArtifact>} The updated artifact
 */
const updateArtifactStats = async (artifactId, updateData) => {
  try {
    return await Artifact.findOneAndUpdate(
      { artifactId },
      updateData,
      { new: true }
    ).lean();
  } catch (error) {
    logger.error('[updateArtifactStats] Error updating artifact stats', error);
    throw new Error('Error updating artifact stats');
  }
};

/**
 * Creates a new artifact session
 * @param {Object} sessionData - The session data
 * @returns {Promise<IArtifactSession>} The created session
 */
const createArtifactSession = async (sessionData) => {
  try {
    const session = new ArtifactSession({
      sessionId: uuidv4(),
      ...sessionData,
    });

    const savedSession = await session.save();
    logger.info(`[createArtifactSession] Session created: ${savedSession.sessionId}`);
    return savedSession.toObject();
  } catch (error) {
    logger.error('[createArtifactSession] Error creating session', error);
    throw new Error('Error creating session');
  }
};

/**
 * Updates an artifact session
 * @param {string} sessionId - The session ID
 * @param {Object} updateData - The update data
 * @returns {Promise<IArtifactSession>} The updated session
 */
const updateArtifactSession = async (sessionId, updateData) => {
  try {
    return await ArtifactSession.findOneAndUpdate(
      { sessionId },
      updateData,
      { new: true }
    ).lean();
  } catch (error) {
    logger.error('[updateArtifactSession] Error updating session', error);
    throw new Error('Error updating session');
  }
};

/**
 * Retrieves artifact sessions with optional filtering
 * @param {Object} filter - MongoDB filter object
 * @param {Object} options - Query options
 * @returns {Promise<IArtifactSession[]>} Array of sessions
 */
const getArtifactSessions = async (filter = {}, options = {}) => {
  try {
    const { limit = 100, skip = 0, sort = { createdAt: -1 } } = options;
    
    const sessions = await ArtifactSession.find(filter)
      .sort(sort)
      .skip(skip)
      .limit(limit)
      .lean();

    return sessions;
  } catch (error) {
    logger.error('[getArtifactSessions] Error fetching sessions', error);
    throw new Error('Error fetching sessions');
  }
};

/**
 * Gets analytics data for an artifact
 * @param {string} artifactId - The artifact ID
 * @returns {Promise<Object>} Analytics data
 */
const getArtifactAnalytics = async (artifactId) => {
  try {
    const sessions = await ArtifactSession.find({ artifactId }).lean();
    
    const analytics = {
      totalSessions: sessions.length,
      completedSessions: sessions.filter(s => s.completed).length,
      averageDuration: 0,
      completionRate: 0,
    };

    if (sessions.length > 0) {
      const completedSessions = sessions.filter(s => s.duration);
      analytics.averageDuration = completedSessions.length > 0 
        ? completedSessions.reduce((sum, s) => sum + s.duration, 0) / completedSessions.length
        : 0;
      analytics.completionRate = (analytics.completedSessions / analytics.totalSessions) * 100;
    }

    return analytics;
  } catch (error) {
    logger.error('[getArtifactAnalytics] Error fetching analytics', error);
    throw new Error('Error fetching analytics');
  }
};

module.exports = {
  publishArtifact,
  getArtifacts,
  getArtifactById,
  updateArtifactStats,
  createArtifactSession,
  updateArtifactSession,
  getArtifactSessions,
  getArtifactAnalytics,
};