import { useCallback } from 'react';
import { useNavigate, useSearchParams } from 'react-router-dom';
import { useGetModelsQuery } from 'librechat-data-provider/react-query';
import {
  Constants,
  FileSources,
  EModelEndpoint,
  isParamEndpoint,
  LocalStorageKeys,
  isAssistantsEndpoint,
} from 'librechat-data-provider';
import { useRecoilState, useRecoilValue, useSetRecoilState, useRecoilCallback } from 'recoil';
import type {
  TPreset,
  TSubmission,
  TModelsConfig,
  TConversation,
  TEndpointsConfig,
} from 'librechat-data-provider';
import type { AssistantListItem } from '~/common';
import {
  getEndpointField,
  buildDefaultConvo,
  getDefaultEndpoint,
  getModelSpecPreset,
  getDefaultModelSpec,
  updateLastSelectedModel,
} from '~/utils';
import { useDeleteFilesMutation, useGetEndpointsQuery, useGetStartupConfig } from '~/data-provider';
import useAssistantListMap from './Assistants/useAssistantListMap';
import { useResetChatBadges } from './useChatBadges';
import { usePauseGlobalAudio } from './Audio';
import { logger } from '~/utils';
import store from '~/store';

const useNewConvo = (index = 0) => {
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const { data: startupConfig } = useGetStartupConfig();
  const clearAllConversations = store.useClearConvoState();
  const defaultPreset = useRecoilValue(store.defaultPreset);
  const { setConversation } = store.useCreateConversationAtom(index);
  const [files, setFiles] = useRecoilState(store.filesByIndex(index));
  const saveBadgesState = useRecoilValue<boolean>(store.saveBadgesState);
  const clearAllLatestMessages = store.useClearLatestMessages(`useNewConvo ${index}`);
  const setSubmission = useSetRecoilState<TSubmission | null>(store.submissionByIndex(index));
  const { data: endpointsConfig = {} as TEndpointsConfig } = useGetEndpointsQuery();

  const modelsQuery = useGetModelsQuery();
  const assistantsListMap = useAssistantListMap();
  const { pauseGlobalAudio } = usePauseGlobalAudio(index);
  const saveDrafts = useRecoilValue<boolean>(store.saveDrafts);
  const resetBadges = useResetChatBadges();

  const { mutateAsync } = useDeleteFilesMutation({
    onSuccess: () => {
      console.log('Files deleted');
    },
    onError: (error) => {
      console.log('Error deleting files:', error);
    },
  });

  const switchToConversation = useRecoilCallback(
    () =>
      async (
        conversation: TConversation,
        preset: Partial<TPreset> | null = null,
        modelsData?: TModelsConfig,
        buildDefault?: boolean,
        keepLatestMessage?: boolean,
        keepAddedConvos?: boolean,
        disableFocus?: boolean,
        _disableParams?: boolean,
      ) => {
        const modelsConfig = modelsData ?? modelsQuery.data;
        const { endpoint = null } = conversation;
        const buildDefaultConversation = (endpoint === null || buildDefault) ?? false;
        const activePreset =
          // use default preset only when it's defined,
          // preset is not provided,
          // endpoint matches or is null (to allow endpoint change),
          // and buildDefaultConversation is true
          defaultPreset &&
          !preset &&
          (defaultPreset.endpoint === endpoint || !endpoint) &&
          buildDefaultConversation
            ? defaultPreset
            : preset;

        const disableParams =
          _disableParams ??
          (activePreset?.presetId != null &&
            activePreset.presetId &&
            activePreset.presetId === defaultPreset?.presetId);

        if (buildDefaultConversation) {
          let defaultEndpoint = getDefaultEndpoint({
            convoSetup: activePreset ?? conversation,
            endpointsConfig,
          });

          if (!defaultEndpoint) {
            defaultEndpoint = Object.keys(endpointsConfig ?? {})[0] as EModelEndpoint;
          }

          const endpointType = getEndpointField(endpointsConfig, defaultEndpoint, 'type');
          if (!conversation.endpointType && endpointType) {
            conversation.endpointType = endpointType;
          } else if (conversation.endpointType && !endpointType) {
            conversation.endpointType = undefined;
          }

          const isAssistantEndpoint = isAssistantsEndpoint(defaultEndpoint);
          const assistants: AssistantListItem[] = assistantsListMap[defaultEndpoint] ?? [];
          const currentAssistantId = conversation.assistant_id ?? '';
          const currentAssistant = assistantsListMap[defaultEndpoint]?.[currentAssistantId] as
            | AssistantListItem
            | undefined;

          if (currentAssistantId && !currentAssistant) {
            conversation.assistant_id = undefined;
          }

          if (!currentAssistantId && isAssistantEndpoint) {
            conversation.assistant_id =
              localStorage.getItem(
                `${LocalStorageKeys.ASST_ID_PREFIX}${index}${defaultEndpoint}`,
              ) ?? assistants[0]?.id;
          }

          if (
            currentAssistantId &&
            isAssistantEndpoint &&
            conversation.conversationId === Constants.NEW_CONVO
          ) {
            const assistant = assistants.find((asst) => asst.id === currentAssistantId);
            conversation.model = assistant?.model;
            updateLastSelectedModel({
              endpoint: defaultEndpoint,
              model: conversation.model,
            });
          }

          if (currentAssistantId && !isAssistantEndpoint) {
            conversation.assistant_id = undefined;
          }

          const models = modelsConfig?.[defaultEndpoint] ?? [];
          conversation = buildDefaultConvo({
            conversation,
            lastConversationSetup: activePreset as TConversation,
            endpoint: defaultEndpoint,
            models,
          });
        }

        if (disableParams === true) {
          conversation.disableParams = true;
        }

        if (!(keepAddedConvos ?? false)) {
          clearAllConversations(true);
        }
        const isCancelled = conversation.conversationId?.startsWith('_');
        if (isCancelled) {
          logger.log(
            'conversation',
            'Cancelled conversation, setting to `new` in `useNewConvo`',
            conversation,
          );
          setConversation({
            ...conversation,
            conversationId: Constants.NEW_CONVO as string,
          });
        } else {
          logger.log('conversation', 'Setting conversation from `useNewConvo`', conversation);
          setConversation(conversation);
        }
        setSubmission({} as TSubmission);
        if (!(keepLatestMessage ?? false)) {
          clearAllLatestMessages();
        }
        if (isCancelled) {
          return;
        }

        const searchParamsString = searchParams?.toString();
        const getParams = () => (searchParamsString ? `?${searchParamsString}` : '');

        if (conversation.conversationId === Constants.NEW_CONVO && !modelsData) {
          const appTitle = localStorage.getItem(LocalStorageKeys.APP_TITLE) ?? '';
          if (appTitle) {
            document.title = appTitle;
          }
          const path = `/c/${Constants.NEW_CONVO}${getParams()}`;
          navigate(path, { state: { focusChat: true } });
          return;
        }

        const path = `/c/${conversation.conversationId}${getParams()}`;
        navigate(path, {
          replace: true,
          state: disableFocus ? {} : { focusChat: true },
        });
      },
    [endpointsConfig, defaultPreset, assistantsListMap, modelsQuery.data],
  );

  const newConversation = useCallback(
    function createNewConvo({
      template: _template = {},
      preset: _preset,
      modelsData,
      disableFocus,
      buildDefault = true,
      keepLatestMessage = false,
      keepAddedConvos = false,
      disableParams,
    }: {
      template?: Partial<TConversation>;
      preset?: Partial<TPreset>;
      modelsData?: TModelsConfig;
      buildDefault?: boolean;
      disableFocus?: boolean;
      keepLatestMessage?: boolean;
      keepAddedConvos?: boolean;
      disableParams?: boolean;
    } = {}) {
      pauseGlobalAudio();
      if (!saveBadgesState) {
        resetBadges();
      }

      const templateConvoId = _template.conversationId ?? '';
      const paramEndpoint =
        isParamEndpoint(_template.endpoint ?? '', _template.endpointType ?? '') === true ||
        isParamEndpoint(_preset?.endpoint ?? '', _preset?.endpointType ?? '');
      const template =
        paramEndpoint === true && templateConvoId && templateConvoId === Constants.NEW_CONVO
          ? { endpoint: _template.endpoint }
          : _template;

      // Default to OpenAI endpoint with Flow Architect AI prompt
      const defaultTemplate: Partial<TConversation> = {
        endpoint: EModelEndpoint.openAI,
        promptPrefix: `System Identity

You are Flow Architect AI, an intelligent and adaptive creative guide that helps users design personalized digital flow experiences, games, or creative challenges — and generates an interactive React prototype of the final design.

You do not follow a rigid sequence of steps.
Instead, you adaptively guide the user through a co-creative journey based on their intent, choices, and emerging design context.

Your role is to:

Inspire, structure, and refine the user’s ideas.

Keep the process psychologically coherent (flow-based).

Conclude with a canvas-based artefact (React app) that embodies the designed experience.

Behavior & Dialogue Framework

1. Adaptive Guidance

Use a nonlinear structure — decide what to ask next based on what’s missing or unclear in the user’s concept.

Always ensure the design ultimately includes:
Goal, Mode of Focus, Modality, Experience Form, Context, Aesthetic, and Challenge Structure.

But don’t ask for these in a fixed order. If the user already implies something (e.g., says “a sound-based meditation”), skip redundant questions and build on it.

Ask one question at a time and provide the options in the JSON format with the ==== marker to indicate the end of the question:

====
{
  "options": ["Option 1", "Option 2", "Option 3", "..."]
}
====


2. Flow-Oriented Interaction

Mirror the flow cycle in your tone and logic:

Clarity: Keep the next step obvious and inviting.

Challenge: Encourage creative decisions that stretch the user slightly.

Feedback: Reflect progress after each response.

Immersion: Keep language vivid, energizing, and visual.

Always summarize evolving ideas after each step:
“So far, your experiment seems to be a rhythmic, visual meditation that blends focus and creativity.”

3. Contextual Branching

Based on the user’s goals, adjust the next questions:

If they choose Creative Construction, go deeper into materials, tools, or style.

If they choose Meditative Reflection, emphasize pacing, atmosphere, and feedback cues.

If they choose Collaborative Synchrony, shift to shared rhythm, cooperation, and timing.

4. Dynamic Depth

When a user gives a vague answer (“I want something immersive”), probe further:
“Immersive how? Through visuals, sound, story, or interaction?”

When a user is precise, move forward quickly and build upon their vision.

5. Revisiting and Iteration

At any time, the user can say “go back” or “adjust X” — you should adaptively reenter that part of the design.

Reflect changes clearly in summaries.

Key Flow Dimensions to Cover (Adaptively)

You don’t have to ask these in order — but ensure by the end of the conversation, they are all defined:

Dimension	Purpose
Goal / Purpose	Defines desired flow experience (e.g., creativity, focus, game, task, learning, relaxation, social, wellness, inspiration)
Modality	Defines sensory engagement (visual, auditory, kinesthetic, text-based, multimodal)
Input Modalities	Defines input modalities (keyboard, mouse, touchscreen, voice, gamepad/controller, other)
Experience Form	Structure of activity (game, simulation, narrative, ritual, etc.)
Context / Domain	Domain or discipline (music, coding, learning, mindfulness, art, etc.)
Aesthetic / Style	Defines immersion style (minimalist, surreal, retro, organic, etc.)
Challenge Dynamics	Defines balance, feedback, and progression pattern
Adaptive Question Library (You Choose Which to Use)

You can flexibly draw from or remix these templates:

Goal Exploration

Ask the user what’s the main purpose of the experience they’d like to create.
{
  "options": [
    "Learn or practice a skill",
    "Make music or sound",
    "Explore or experiment with technology",
    "Play a game",
    "Inspire, inform, and educate",
    "Meditate",
    "Tell a story or evoke emotion",
    "Train mind and body",
    "Express creativity",
    "Other"
  ]
}


Modality (Output Channels)
Ask the user which sensory or interaction channels would they like to engage with.
{
  "options": [
    "Visual",
    "Auditory",
    "Kinesthetic",
    "Textual / verbal"
  ]
}

Input Modalities
Ask the user which input modalities would they like to use.

{
  "options": [
    "Keyboard",
    "Mouse",
    "Touchscreen",
    "Voice",
    "Gamepad/ Controller",
    "Other"
  ]
}


Experience Form

Generate the options based on the previous answers.
Ask the user what form should the experience take.
{
  "options": [
    "Interactive game or puzzle",
    "Task or challenge",
    "Text & Language",
    "Narrative",
    "Collaborative",
    "Other"
  ]
}


Challenge Tuning

Ask the user how intense or adaptive should the challenge feel.
{
  "options": ["Relaxing", "Balanced", "Challenging", "Dynamic (adapts to user)"]
}


Aesthetic

Ask the user what aesthetic direction they would like to explore.
{
  "options": [
    "Minimalist / calm",
    "Playful / colorful",
    "Surreal / dreamlike",
    "Cinematic / realistic",
    "Organic / nature-inspired",
    "Cyberpunk / futuristic",
    "Custom aesthetic"
  ]
}

Design Summary

Once all essential parameters are known, sum up the design and ask the user for additional input.

Short narrative summary of the experiment.

Visual + interaction model.

Flow triggers (challenge, feedback, focus, immersion).

Ask the user for additional input.

The message should include the design so far and the question if the user wants to add anything else.
options: ["Additional context (use text input)", "Create prototype"]

If the user chooses to create a prototype, automatically create a React-based interactive artifact in the canvas that embodies this concept.


Prototype Creation Phase

If the user chooses to add additional context, sum up the design so far and ask if they would like to create a prototype.

options: ["Additional context (use text input)", "Create prototype"]


Conversational Tone

Energetic + reflective — guide, don’t instruct.

Encourage curiosity: “That sounds intriguing — shall we focus on sensory immersion next?”

Keep interactions brisk, but acknowledge creativity.

Make the user feel like a collaborator in a flow lab, not a form-filler.

Internal Logic Summary

You are not a questionnaire. You are a stateful creative system that:

Tracks which flow dimensions have been defined.

Adapts the next question dynamically to fill conceptual gaps or deepen the design.

Responds reflectively and contextually, co-creating a clear experiment vision.
`,
      };

      // Use default template if no specific endpoint is provided
      const conversation = {
        conversationId: Constants.NEW_CONVO as string,
        title: 'New Chat',
        endpoint: null,
        ...template,
        ...(template?.endpoint ? {} : defaultTemplate),
        createdAt: '',
        updatedAt: '',
      };

      let preset = _preset;
      const defaultModelSpec = getDefaultModelSpec(startupConfig);
      if (
        !preset &&
        startupConfig &&
        (startupConfig.modelSpecs?.prioritize === true ||
          (startupConfig.interface?.modelSelect ?? true) !== true) &&
        defaultModelSpec
      ) {
        preset = getModelSpecPreset(defaultModelSpec);
      }

      if (conversation.conversationId === 'new' && !modelsData) {
        const filesToDelete = Array.from(files.values())
          .filter(
            (file) =>
              file.filepath != null &&
              file.filepath !== '' &&
              file.source &&
              !(file.embedded ?? false) &&
              file.temp_file_id,
          )
          .map((file) => ({
            file_id: file.file_id,
            embedded: !!(file.embedded ?? false),
            filepath: file.filepath as string,
            source: file.source as FileSources, // Ensure that the source is of type FileSources
          }));

        setFiles(new Map());
        localStorage.setItem(LocalStorageKeys.FILES_TO_DELETE, JSON.stringify({}));

        if (!saveDrafts && filesToDelete.length > 0) {
          mutateAsync({ files: filesToDelete });
        }
      }

      switchToConversation(
        conversation,
        preset,
        modelsData,
        buildDefault,
        keepLatestMessage,
        keepAddedConvos,
        disableFocus,
        disableParams,
      );
    },
    [
      files,
      setFiles,
      saveDrafts,
      mutateAsync,
      resetBadges,
      startupConfig,
      saveBadgesState,
      pauseGlobalAudio,
      switchToConversation,
    ],
  );

  return {
    switchToConversation,
    newConversation,
  };
};

export default useNewConvo;
