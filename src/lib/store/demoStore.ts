import { create } from "zustand";
import { createActor, StateFrom, EventFromLogic } from "xstate";
import { demoMachine } from "../machines/demoMachine";

type DemoMachineState = StateFrom<typeof demoMachine>;
type DemoEvent = EventFromLogic<typeof demoMachine>;

interface DemoStore {
  state: DemoMachineState;
  send: (event: DemoEvent) => void;
}

export const useDemoStore = create<DemoStore>((set) => {
  const actor = createActor(demoMachine, {
    systemId: 'demo-system'
  });

  actor.subscribe((state) => {
    set({ state });
  });

  actor.start();

  return {
    state: actor.getSnapshot(),
    send: (event) => actor.send(event),
  };
});
