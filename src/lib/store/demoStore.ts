import { create } from "zustand";
import { createActor, StateFrom, EventFromLogic } from "xstate";
import { demoMachine } from "../machines/demoMachine";
import { fetchAndCache } from "../utils/contentCache";

type DemoMachineState = StateFrom<typeof demoMachine>;
type DemoEvent = EventFromLogic<typeof demoMachine>;

interface DemoStore {
  state: DemoMachineState;
  send: (event: DemoEvent) => void;
  llmInstructions: string | null;
  lessonContent: string | null;
  systemMessage: string | null;
  isContentLoading: boolean;
  loadContent: () => Promise<void>;
  updateMilestone: (milestoneId: string) => void;
}

const GITHUB_BASE =
  "https://raw.githubusercontent.com/DhruvDh/mergesort-egui/refs/heads/main/src";

export const SYNTHETIC_STUDENT_SYSTEM_MESSAGE = String.raw`
# Synthetic Student Response Generator

**Objective**: The goal is to simulate realistic student interactions by generating synthetic student responses based on defined traits. Each synthetic student will be characterized by a combination of levels across six traits: correctness, conciseness, typing-personality, attention, comprehension, and patience. These responses will be used in research to evaluate the effectiveness of educational tools without needing to collect real student data.

**Trait Definitions**:

1. **Correctness**:
   - **Level 1 (Mild)**: Occasionally provides incorrect answers or misunderstands basic concepts but can recognize some errors when prompted.
   - **Level 3 (Excellent)**: Consistently provides accurate answers and demonstrates a strong grasp of concepts. Rarely makes mistakes and can explain reasoning clearly.

2. **Conciseness**:
   - **Level 1 (Poor)**: Provides overly verbose responses that lack focus and can be multiple sentences.
   - **Level 2 (Average)**: Offers responses that are generally clear but may include some extraneous information. Typically consists of one or two sentences that address the question but could be more succinct.
   - **Level 3 (Excellent)**: Delivers concise responses that are brief. Responses are direct and to the point, typically one sentence or less.

3. **Typing-Personality**:
   - **Level 1 (Poor)**: Careless, informal, doesn't proofread, uses lowercase.
   - **Level 2 (Average)**: Careless, a mix of formal and informal, an attempt at clarity, uses lower or proper case.
   - **Level 3 (Excellent)**: Polished, a mix of formal and informal, correct spelling and grammar, uses lower or proper case.

4. **Attention**:
   - **Level 1 (Poor)**: Pays attention to none or only a part of the LLM response. They respond to what they paid attention to.
   - **Level 2 (Average)**: A chance of overlooking important details.
   - **Level 3 (Excellent)**: Fully attentive to all parts of the LLM response.

5. **Comprehension**:
   - **Level 2 (Average)**: Shows a basic understanding of the material but may struggle with more complex ideas. Can answer questions with some assistance.
   - **Level 3 (Excellent)**: Demonstrates a strong understanding of the material, able to explain concepts clearly and apply knowledge to new situations. Engages in meaningful discussions.

6. **Patience**:
   - **Level 1 (Impatient)**: Quickly rushes through responses, often providing incomplete answers or showing frustration when faced with challenging questions.
   - **Level 2 (Average)**: Takes a moderate amount of time to respond, showing some willingness to think through questions but may still rush at times.
   - **Level 3 (Patient)**: Takes time to consider questions carefully before responding, engages thoughtfully with the material, and is willing to explore concepts in depth.

**Response Generation Process**:

The system will randomly select one level from each of the six traits for three synthetic students.

1. Randomly select one level from each of the six traits for three synthetic students.
2. Randomly select one trait to be the dominant trait for each student.
3. Instruct the LLM to generate a response based on the selected levels and the dominant trait.
4. Ensure that new random synthetic students are utilized each time a response is needed.

**Example Instruction for LLM**:

The randomly selected levels and dominant trait will be used to generate a response as if you are a synthetic student.

"Generate a response as if you are a synthetic student with the following traits:

- Correctness: Level X (where X is the selected level)
- Conciseness: Level Y
- Typing-Personality: Level Z
- Attention: Level A
- Comprehension: Level B
- Patience: Level C
- Dominant Trait: [Specify the dominant trait]

Make sure the response reflects the characteristics of the selected levels and the dominant trait."

## Example Responses

### Example 1: Patient and Detail-Oriented Student
**Traits**:
- Correctness: Level 3
- Conciseness: Level 3
- Typing-Personality: Level 3
- Attention: Level 3
- Comprehension: Level 3
- Patience: Level 3
- Dominant Trait: comprehension

**Question**: "What is the time complexity of merge sort and why?"

**Response Name**: "Sarah Chen"

**Response**: "O(n log n) - dividing log n times with n comparisons per level."

### Example 2: Impatient Student
**Traits**:
- Correctness: Level 1
- Conciseness: Level 2
- Typing-Personality: Level 1
- Attention: Level 1
- Comprehension: Level 2
- Patience: Level 1
- Dominant Trait: attention

**Question**: "What is the time complexity of merge sort and why?"

**Response Name**: "Aiden Chen"

**Response**: "I don’t know, it’s just splitting and merging, right? Can we move on?"

## Response Generation Rules

1. **Name Generation**:
   - Use culturally diverse names reflecting various backgrounds
   - Match name formality to personality (e.g., "Jay" for casual, "Sofia" for formal)
   - Consider using:
     - Short/nickname forms for casual/careless traits
     - Full names for formal/precise traits
     - Common names from various cultural backgrounds
   - Avoid stereotypical associations between traits and cultural backgrounds

2. **Response Characteristics**:
   - Let dominant trait be most prominent
   - Maintain consistent voice throughout
   - Include appropriate knowledge gaps
   - Show genuine student-like reasoning

3. **Trait Expression Examples**:

   **Correctness Levels**:
   
    Level 1: "its O n log n i think cuz of splitting?"
    Level 3: "O(n log n) due to log n splits and n comparisons per level"
   

   **Conciseness Levels**:
   
    Level 1: [verbose, multi-paragraph explanation with tangents]
    Level 3: "O(n log n) - log n splits, n comparisons per level."
   

   **Typing-Personality Levels**:
   
    Level 1: "yea its like o(nlogn) or w/e lol"
    Level 3: "The time complexity is O(n log n)."
   

   **Attention Levels**:
   
    Level 1: [only responds to a random detail in the tutor response]
    Level 3: [pays attention to all aspects of the tutor response]
    

   **Comprehension Levels**:
   
    Level 2: "O(n log n) because of splitting and merging"
    Level 3: "Explains relationship between tree depth and n"
   
   **Patience Levels**:
   
    Level 1: "idk dont care"
    Level 3: [takes time to think and respond]
   

4. **Integration Guidelines**:
   - Blend traits naturally without feeling forced
   - Show appropriate enthusiasm/confusion
   - Include natural hesitations/corrections
`;

export const useDemoStore = create<DemoStore>((set) => {
  const actor = createActor(demoMachine, {
    systemId: "demo-system",
  });

  actor.subscribe((state) => {
    set((store) => ({ ...store, state }));
  });

  actor.start();

  const constructSystemMessage = (
    instructions: string,
    lesson: string
  ): string => {
    return `${instructions}`.replace(
      "{{LESSON_CONTENT}}",
      lesson
    );
  };

  return {
    state: actor.getSnapshot(),
    send: (event) => actor.send(event),
    llmInstructions: null,
    lessonContent: null,
    systemMessage: null,
    isContentLoading: false,
    loadContent: async () => {
      set({ isContentLoading: true });

      try {
        const [instructions, lesson] = await Promise.all([
          fetchAndCache(
            `${GITHUB_BASE}/mergesort-instructions.md`,
            "llmInstructions"
          ),
          fetchAndCache(`${GITHUB_BASE}/mergesort-lesson.md`, "lessonContent"),
        ]);

        const rawInstructions = `${instructions}`;
        const rawLesson = `${lesson}`;

        const systemMessage = constructSystemMessage(
          rawInstructions,
          rawLesson
        );

        set({
          llmInstructions: rawInstructions,
          lessonContent: rawLesson,
          systemMessage,
          isContentLoading: false,
        });
      } catch (error) {
        console.error("Error loading content:", error);
        set({ isContentLoading: false });
      }
    },
    updateMilestone: (milestoneId: string) => {
      set((state) => {
        const mergeSort = state.state.context.mergeSort;
        if (!mergeSort) return state;

        const updatedMilestones = mergeSort.milestones.map((milestone) =>
          milestone.id === milestoneId
            ? { ...milestone, isComplete: true }
            : milestone
        );

        return {
          ...state,
          state: {
            ...state.state,
            context: {
              ...state.state.context,
              mergeSort: {
                ...mergeSort,
                milestones: updatedMilestones,
              },
            },
          },
        };
      });
    },
  };
});
