import { Schema } from 'mongoose';
import { artifactSessionSchema } from '../schema';

/**
 * Creates the ArtifactSession model
 */
export function createArtifactSessionModel(mongoose: typeof import('mongoose')) {
  return mongoose.model('ArtifactSession', artifactSessionSchema);
}
