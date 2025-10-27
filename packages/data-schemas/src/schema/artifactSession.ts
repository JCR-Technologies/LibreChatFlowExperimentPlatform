import { Schema } from "mongoose";

const artifactSessionSchema = new Schema({
    sessionId: {
      type: String,
      unique: true,
      required: true,
      index: true,
    },
    artifactId: {
      type: String,
      required: true,
      index: true,
    },
    userId: {
      type: String,
      index: true,
    },
    startTime: {
      type: Date,
      required: true,
    },
    endTime: {
      type: Date,
    },
    duration: {
      type: Number, // in seconds
    },
    completed: {
      type: Boolean,
      default: false,
    },
    questionnaireResponses: {
      type: Schema.Types.Mixed,
    },
  }, { timestamps: true });

export default artifactSessionSchema;