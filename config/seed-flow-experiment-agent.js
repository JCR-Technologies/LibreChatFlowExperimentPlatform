// eslint-disable-next-line @typescript-eslint/ban-ts-comment
// @ts-nocheck
const path = require('path');
const { logger } = require('@librechat/data-schemas');
const {
  AccessRoleIds,
  ResourceType,
  PrincipalType,
  Constants,
} = require('librechat-data-provider');

require('module-alias')({ base: path.resolve(__dirname, '..', 'api') });

const connect = require('./connect');
const { Agent } = require('~/db/models');
const { getProjectByName, addAgentIdsToProject } = require('~/models/Project');
const { grantPermission } = require('~/server/services/PermissionService');
const { FLOW_EXPERIMENT_AGENT_PROMPT } = require('~/app/clients/agents/CustomAgent/flowExperimentAgent');

async function upsertFlowExperimentAgent() {
  await connect();

  const agentId = 'flow_experiment_ai';
  const name = 'Flow Architect AI';
  const description = 'Guides users through creating structured flow experiments with multiple-choice steps and optional customization.';

  // Upsert agent with instructions; keep provider/model minimal so users can choose per run
  const now = new Date();
  const update = {
    $set: {
      id: agentId,
      name,
      description,
      instructions: FLOW_EXPERIMENT_AGENT_PROMPT,
      provider: 'openai',
      endpoint: 'openai',
      model: '',
      model_parameters: {},
      updatedAt: now,
      category: 'experiments',
      is_promoted: true,
    },
    $setOnInsert: {
      createdAt: now,
    },
  };

  const agent = await Agent.findOneAndUpdate({ id: agentId }, update, {
    new: true,
    upsert: true,
    lean: false,
  });

  logger.info(`Agent upserted: ${agent.name} (${agent.id})`);

  // Ensure agent is part of the Global project so it lists for all users
  const globalProject = await getProjectByName(Constants.GLOBAL_PROJECT_NAME, '_id agentIds');
  if (!globalProject) {
    throw new Error('Global project not found or could not be created.');
  }

  if (!globalProject.agentIds || !globalProject.agentIds.includes(agent.id)) {
    await addAgentIdsToProject(globalProject._id, [agent.id]);
    logger.info(`Added agent to Global project: ${agent.id}`);
  } else {
    logger.info('Agent already present in Global project');
  }

  // Grant PUBLIC VIEW access so every user can use the agent
  try {
    await grantPermission({
      principalType: PrincipalType.PUBLIC,
      principalId: null,
      resourceType: ResourceType.AGENT,
      resourceId: agent._id,
      accessRoleId: AccessRoleIds.AGENT_VIEWER,
      grantedBy: agent.author || null,
    });
    logger.info('Granted PUBLIC VIEW permission to agent');
  } catch (e) {
    logger.warn('PUBLIC VIEW permission grant may already exist or failed:', e?.message);
  }

  logger.green?.('Flow Experiment AI agent is ready.');
}

if (require.main === module) {
  upsertFlowExperimentAgent()
    .then(() => process.exit(0))
    .catch((err) => {
      console.error('Failed to upsert Flow Experiment AI agent:', err);
      process.exit(1);
    });
}

module.exports = { upsertFlowExperimentAgent };


