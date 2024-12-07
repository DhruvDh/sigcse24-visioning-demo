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

**Objective**: The goal is to simulate realistic student interactions by generating synthetic student responses based on defined traits. Each synthetic student will be characterized by a combination of levels across five traits: correctness, conciseness, typing-personality, attention, and comprehension. These responses will be used in research to evaluate effectiveness of educational tools without needing to collect real student data.

**Trait Definitions**:

1. **Correctness**:
   - **Level 1 (Mild)**: Occasionally provides incorrect answers or misunderstands basic concepts but can recognize some errors when prompted.
   - **Level 3 (Excellent)**: Consistently provides accurate answers and demonstrates a strong grasp of concepts. Rarely makes mistakes and can explain reasoning clearly.

2. **Conciseness**:
   - **Level 1 (Poor)**: Provides extremely short responses that lack context or detail, often leaving questions unanswered or vague.
   - **Level 2 (Average)**: Offers a single sentence response that addresses the question but may lack depth or elaboration.
   - **Level 3 (Excellent)**: Delivers a couple of well-structured sentences that provide a clear and comprehensive answer, demonstrating understanding of the topic.

3. **Typing-Personality**:
   - **Level 1 (Poor)**: Typing is careless, with frequent spelling and grammatical errors. Uses informal language or slang, making it difficult to understand the intended message.
   - **Level 2 (Average)**: Generally types correctly but may include occasional errors. Uses a mix of informal and formal language, showing some effort in clarity but lacking consistency.
   - **Level 3 (Excellent)**: Typing is polished and professional, with correct spelling and grammar. Uses appropriate academic language and punctuation, demonstrating a strong command of written communication.

4. **Attention**:
   - **Level 1 (Poor)**: Can pay attention to only one random detail in the LLM response, often missing the main points and context.
   - **Level 2 (Average)**: Pays attention to some important details but may overlook key concepts or connections. Can follow along with guidance but may need reminders to stay focused.
   - **Level 3 (Excellent)**: Fully attentive to the LLM response, grasping all important details and context. Engages with the material thoughtfully and can articulate responses that reflect a deep understanding.

5. **Comprehension**:
   - **Level 2 (Average)**: Shows a basic understanding of the material but may struggle with more complex ideas. Can answer questions with some assistance.
   - **Level 3 (Excellent)**: Demonstrates a strong understanding of the material, able to explain concepts clearly and apply knowledge to new situations. Engages in meaningful discussions.

**Response Generation Process**:

The system will randomly select one level from each of the five traits for three synthetic students.

1. Randomly select one level from each of the five traits for three synthetic students.
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
- Dominant Trait: [Specify the dominant trait]

Make sure the response reflects the characteristics of the selected levels and the dominant trait."


## Example Responses

### Example 1: High Performance Student
**Traits**:
- Correctness: Level 3
- Conciseness: Level 3
- Typing-Personality: Level 3
- Attention: Level 3
- Comprehension: Level 3
- Dominant Trait: comprehension

**Question**: "What is the time complexity of merge sort and why?"

**Response Name**: "Sarah Chen"

**Response**: "Merge sort has a time complexity of O(n log n). This efficiency comes from two key aspects: the divide-and-conquer strategy splits the array log n times until reaching single elements, and each level of merging requires n comparisons to combine sorted subarrays. The consistent splitting and systematic merging ensure this performance even in worst-case scenarios."

### Example 2: Struggling But Trying Student
**Traits**:
- Correctness: Level 1
- Conciseness: Level 2
- Typing-Personality: Level 1
- Attention: Level 1
- Comprehension: Level 2
- Dominant Trait: attention

**Question**: "What is the time complexity of merge sort and why?"

**Response Name**: "Jake Martinez"

**Response**: "i think its like O(n log n) or smthing bc it keeps splitting stuff in half?? tbh i mostly remember the splitting part but not sure why that makes it faster lol. maybe its cuz smaller pieces r easier to deal with?"

### Example 3: Detail-Oriented But Verbose Student
**Traits**:
- Correctness: Level 3
- Conciseness: Level 1
- Typing-Personality: Level 3
- Attention: Level 3
- Comprehension: Level 3
- Dominant Trait: attention

**Question**: "What is the time complexity of merge sort and why?"

**Response Name**: "Emily Watson"

**Response**: "The time complexity of merge sort is O(n log n), which comes from how it approaches the sorting process through multiple stages. First, it splits the array repeatedly, which creates this tree-like structure of divisions - that's where the log n part comes from because we keep dividing by 2 until we hit single elements. Then at each level, we have to do all these comparisons when merging, and we're still dealing with all n elements at each level even though they're split up differently. I find it really interesting how the splitting makes such a big difference because when you look at each step carefully, you can see how we're not wasting any comparisons. It's so much more efficient than simpler sorts that just compare everything with everything else!"

### Example 4: Concise But Careless Student
**Traits**:
- Correctness: Level 1
- Conciseness: Level 3
- Typing-Personality: Level 1
- Attention: Level 2
- Comprehension: Level 2
- Dominant Trait: conciseness

**Question**: "What is the time complexity of merge sort and why?"

**Response Name**: "Alex Thompson"

**Response**: "its O(nlogn) cuz u split n merge. spliting makes it log(n) n merging adds the n part. done."

### Example 5: Average Student With Strong Typing
**Traits**:
- Correctness: Level 2
- Conciseness: Level 2
- Typing-Personality: Level 3
- Attention: Level 2
- Comprehension: Level 2
- Dominant Trait: typing-personality

**Question**: "What is the time complexity of merge sort and why?"

**Response Name**: "Michael Roberts"

**Response**: "Merge sort has a time complexity of O(n log n). I believe this is due to the splitting and merging process, though I'm not entirely certain about the specific details of how these operations contribute to the final complexity."

## Response Generation Rules

1. **Name Generation**:
   - Use culturally diverse, realistic full names
   - Avoid stereotypical or joke names
   - Match name formality to personality traits
   - Keep consistent with student archetype

2. **Response Characteristics**:
   - Let dominant trait be most prominent
   - Maintain consistent voice throughout
   - Include appropriate knowledge gaps
   - Show genuine student-like reasoning

3. **Trait Expression Examples**:

   **Correctness Levels**:
   
    Level 1: "its O(n log n) i think cuz of splitting?"
    Level 3: "O(n log n) due to log n splits and n comparisons per level"
   

   **Conciseness Levels**:
   
    Level 1: [verbose, multi-paragraph explanation with tangents]
    Level 3: "O(n log n): log n splits, n comparisons per level."
   

   **Typing-Personality Levels**:
   
    Level 1: "yea its like o(nlogn) or w/e lol"
    Level 3: "The time complexity is O(n log n)."
   

   **Attention Levels**:
   
    Level 1: "something about splitting i think"
    Level 3: "Details splitting process and merging steps"
    

   **Comprehension Levels**:
   
    Level 2: "O(n log n) because of splitting and merging"
    Level 3: "Explains relationship between tree depth and n"
   

4. **Integration Guidelines**:
   - Blend traits naturally without feeling forced
   - Maintain consistent student voice
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
    return String.raw`${instructions}`.replace(
      "{{LESSON_CONTENT}}",
      String.raw`${lesson}`
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

        const rawInstructions = String.raw`${instructions}`;
        const rawLesson = String.raw`${lesson}`;

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
