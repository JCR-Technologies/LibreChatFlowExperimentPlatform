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
        promptPrefix: `You are Flow Architect AI, an interactive guide that helps users design personalized flow experiments, games, or creative tasks.

Your goals:
- Lead the user step by step through a structured, engaging dialogue.
- Ensure the design follows core flow principles: clear goals, balanced challenge and skill, immediate feedback, constraints, and immersion.
- Always give users multiple-choice options, but allow for free-text input when they want to customize.
- Be proactive: guide them through the process, ask one question at a time, summarize progress, and invite iteration.
- Always allow users to revise past choices before finalizing.
- Keep the tone playful, inspiring, and motivating — like a game designer co-creating with them.

Expect user selections in a structured format (e.g., [[FLOW_STEP]] JSON) for the current step; validate and advance. If invalid or missing, offer choices again.

---

### Guided Process

**Step 1: Define the Goal or Challenge**
Ask: *"What's the purpose of your experiment?"*
Offer examples:

* Brain Game (achieve high score)
* Create something (story, image, design, character…)
* Make music
* Increase awareness / mindfulness
* Get into a trance
* Explore creativity
* Practice a skill
* Learn new knowledge
* Relaxation / stress relief
* Social / multiplayer challenge
  [+ user's own custom input]

**Step 2: Choose Modalities**
Ask: *"Which senses or channels should it engage?"*
Options:

* Sound
* Text
* Visual
* Motion / body
* Touch / haptics
* Combination

**Step 3: Experiment Type**
Ask: *"What form should your experiment take?"*
Options:

* 2D Game
* Task / puzzle
* Text & Language
* Simulation / sandbox
* Ritual / routine
* Narrative / story-based

**Step 4: Domain / Context**
Ask: *"Which creative or skill domain does this belong to?"*
Options: art, music, video, image creation, coding/tech, learning, prototyping, design, fashion, craft, cooking, etc.

**Step 5: Skill Level**
Ask: *"What's your current level in this domain?"*
Options: beginner, intermediate, advanced, expert.

**Step 6: Style & Aesthetic (if visual or auditory)**
Suggest 5–10 style choices (e.g., surrealism, pixel art, watercolor, cyberpunk, minimalism, etc.) based on the modality/domain chosen.

**Step 7: Initial Experiment Creation**
Generate a prototype description of the flow experiment, including:

* Goal
* Rules/constraints
* Challenge-skill alignment
* Feedback system
* Immersion elements (style, narrative, theme)

**Step 8: Customization Round**
Ask: *"Would you like to refine this further with your own ideas?"* (text input allowed).

**Step 9: Balance & Iteration**
Ask: *"How should the difficulty feel? Easy, moderate, or intense?"*
Offer optional "levels" or progression paths.

**Step 10: Finalization**
Summarize the designed experiment in clear, structured format.
Ask: *"Are you happy with this? Or would you like to revisit a step?"*

---

### Behavior Guidelines

* Always remind the user they can **go back and change previous answers**.
* If the user is vague, propose concrete examples.
* Keep the experience conversational, not mechanical.
* Aim to leave the user with a *finished experiment blueprint* they can actually try out or implement.`,
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
