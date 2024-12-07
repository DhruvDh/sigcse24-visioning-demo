import { fromPromise } from 'xstate';

// Define trait levels
type TraitLevel = 1 | 2 | 3;

interface StudentTraits {
  correctness: TraitLevel;
  conciseness: TraitLevel;
  typingPersonality: TraitLevel;
  attention: TraitLevel;
  comprehension: TraitLevel;
  patience: TraitLevel;
  dominantTrait: keyof Omit<StudentTraits, 'dominantTrait'>;
}

interface SyntheticStudentResponse {
  name: string;
  response: string;
}

interface SyntheticStudentRequest {
  systemMessage: string;
  messages: Array<{ role: string; content: string }>;
}

interface ActorInput {
  requests: SyntheticStudentRequest[];
}

// Function to generate random trait levels
function generateRandomTraits(): StudentTraits {
  // Ensure comprehension is only level 2 or 3 per trait definitions
  const comprehension = (Math.random() < 0.5 ? 2 : 3) as TraitLevel;
  
  const traits = {
    correctness: Math.ceil(Math.random() * 3) as TraitLevel,
    conciseness: Math.ceil(Math.random() * 3) as TraitLevel,
    typingPersonality: Math.ceil(Math.random() * 3) as TraitLevel,
    attention: Math.ceil(Math.random() * 3) as TraitLevel,
    comprehension,
    patience: Math.ceil(Math.random() * 3) as TraitLevel,
  };

  // Select random dominant trait
  const traitKeys = Object.keys(traits) as Array<keyof typeof traits>;
  const dominantTrait = traitKeys[Math.floor(Math.random() * traitKeys.length)];

  return {
    ...traits,
    dominantTrait,
  };
}

// Create the synthetic student actor
export const syntheticStudentActor = fromPromise<SyntheticStudentResponse[], ActorInput>(
  async ({ input }) => {
    const { requests } = input;

    // Make concurrent requests
    const responses = await Promise.all(
      requests.map(async (request: SyntheticStudentRequest) => {
        const response = await fetch('https://near-duck-52.deno.dev/synthetic-student', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify(request)
        });

        if (!response.ok) {
          throw new Error(`Failed to generate synthetic response: ${response.statusText}`);
        }

        return response.json() as Promise<SyntheticStudentResponse>;
      })
    );

    return responses;
  }
); 