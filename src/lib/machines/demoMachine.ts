import { setup } from 'xstate';

type DemoContext = {
  name: string;
  responses: {
    teachLLMs: string;
    syntheticStudents: string;
  };
};

type DemoEvent =
  | { type: "BEGIN" }
  | { type: "SUBMIT_NAME"; name: string }
  | { type: "SKIP_NAME" }
  | { type: "SUBMIT_TEACHING_RESPONSE"; response: string }
  | { type: "SUBMIT_SYNTHETIC_RESPONSE"; response: string }
  | { type: "NEXT" };

export const demoMachine = setup({
  types: {
    context: {} as DemoContext,
    events: {} as DemoEvent,
  },
  actions: {
    setName: ({ context }, params: { name: string }) => {
      context.name = params.name;
    },
    setTeachingResponse: ({ context }, params: { response: string }) => {
      context.responses.teachLLMs = params.response;
    },
    setSyntheticResponse: ({ context }, params: { response: string }) => {
      context.responses.syntheticStudents = params.response;
    },
  },
}).createMachine({
  id: "demo",
  initial: "welcome",
  context: {
    name: "",
    responses: {
      teachLLMs: "",
      syntheticStudents: "",
    },
  },
  states: {
    welcome: {
      on: {
        BEGIN: "nameInput",
      },
    },
    nameInput: {
      on: {
        SUBMIT_NAME: {
          target: "teachingQuestion",
          actions: {
            type: 'setName',
            params: ({ event }) => ({
              name: event.name
            })
          },
        },
        SKIP_NAME: {
          target: "teachingQuestion",
          actions: {
            type: 'setName',
            params: () => ({
              name: "Anon"
            })
          },
        },
      },
    },
    teachingQuestion: {
      on: {
        SUBMIT_TEACHING_RESPONSE: {
          target: "thankYouTeaching",
          actions: {
            type: 'setTeachingResponse',
            params: ({ event }) => ({
              response: event.response
            })
          },
        },
      },
    },
    thankYouTeaching: {
      after: {
        1500: "syntheticQuestion"
      },
    },
    syntheticQuestion: {
      on: {
        SUBMIT_SYNTHETIC_RESPONSE: {
          target: "complete",
          actions: {
            type: 'setSyntheticResponse',
            params: ({ event }) => ({
              response: event.response
            })
          },
        },
      },
    },
    complete: {
      type: "final",
    },
  },
});

export type DemoMachineState = ReturnType<typeof demoMachine.transition>;
