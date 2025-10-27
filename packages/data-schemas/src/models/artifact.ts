import { Schema } from 'mongoose';
import { artifactSchema } from '../schema';

/**
 * Creates the Artifact model
 */
export function createArtifactModel(mongoose: typeof import('mongoose')) {
  return mongoose.model('Artifact', artifactSchema);
}
