import { GoogleGenAI, Type } from "@google/genai";

const ai = new GoogleGenAI({ apiKey: process.env.GEMINI_API_KEY as string });

export async function getWritingFeedback(task: number, prompt: string, text: string, wordCount: number) {
  try {
    const isTask1 = task === 1;
    const response = await ai.models.generateContent({
      model: "gemini-3.1-pro-preview",
      contents: `You are a strict, official IELTS examiner. Evaluate the following response strictly using the official public IELTS Writing Band Descriptors. Provide a professional, objective examiner report. Do not inflate scores; be highly rigorous.

Task: IELTS Academic Writing ${isTask1 ? "Task 1" : "Task 2"}
Prompt: "${prompt}"
Word count: ${wordCount} words

Student's response:
"""
${text}
"""

For each criterion (${isTask1 ? "Task Achievement" : "Task Response"}, Coherence & Cohesion, Lexical Resource, Grammatical Range and Accuracy), provide a specific band score (e.g., 6.0, 6.5, 7.0) and a brief, formal justification quoting the exact language from the official band descriptors (e.g., 'uses a mix of simple and complex sentence forms', 'presents a clear overview').

Finally, write a complete, flawless Band 9 model answer for this exact prompt.`,
      config: {
        responseMimeType: "application/json",
        responseSchema: {
          type: Type.OBJECT,
          properties: {
            overallBand: { type: Type.NUMBER },
            criteria: {
              type: Type.OBJECT,
              properties: {
                taskAchievement: { type: Type.NUMBER },
                taskResponse: { type: Type.NUMBER },
                coherenceCohesion: { type: Type.NUMBER },
                lexicalResource: { type: Type.NUMBER },
                grammaticalRange: { type: Type.NUMBER }
              }
            },
            criteriaFeedback: {
              type: Type.OBJECT,
              properties: {
                taskAchievement: { type: Type.STRING },
                taskResponse: { type: Type.STRING },
                coherenceCohesion: { type: Type.STRING },
                lexicalResource: { type: Type.STRING },
                grammaticalRange: { type: Type.STRING }
              }
            },
            whatWorks: { type: Type.ARRAY, items: { type: Type.STRING } },
            improvements: { type: Type.ARRAY, items: { type: Type.STRING } },
            bandGap: { type: Type.STRING },
            rewrittenParagraph: { type: Type.STRING },
            targetVocabulary: { type: Type.ARRAY, items: { type: Type.STRING } },
            modelOpener: { type: Type.STRING },
            modelEssay: { type: Type.STRING },
            wordCountComment: { type: Type.STRING }
          }
        }
      }
    });
    return JSON.parse(response.text || "{}");
  } catch (error) {
    console.error("Error getting writing feedback:", error);
    return { overallBand: 0, criteria: {}, criteriaFeedback: {}, whatWorks: [], improvements: [], bandGap: "Error evaluating essay.", rewrittenParagraph: "", targetVocabulary: [], modelOpener: "", modelEssay: "", wordCountComment: "" };
  }
}

export async function chatWithExaminer(task: number, prompt: string, userText: string, feedback: any, history: any[], message: string) {
  try {
    const isTask1 = task === 1;
    
    let conversationHistory = "";
    if (history.length > 0) {
      conversationHistory = "\n\nPrevious conversation:\n" + history.map(msg => `${msg.role === "user" ? "Student" : "Examiner"}: ${msg.text}`).join("\n");
    }

    const systemInstruction = `You are a strict, official IELTS examiner. You have just evaluated a student's IELTS Academic Writing ${isTask1 ? "Task 1" : "Task 2"} response.
Prompt: "${prompt}"
Student's response: "${userText}"
Your previous evaluation: ${JSON.stringify(feedback)}

The student is now asking you questions about their essay and your feedback.
Answer their questions professionally, objectively, and directly. Use the official public IELTS Writing Band Descriptors to justify your answers.
Provide actionable advice on how they can improve their score. Be concise and helpful.${conversationHistory}`;

    const response = await ai.models.generateContent({
      model: "gemini-3.1-pro-preview",
      contents: message,
      config: {
        systemInstruction,
      },
    });

    return response.text;
  } catch (error) {
    console.error("Error chatting with examiner:", error);
    return "I'm sorry, I encountered an error while processing your request. Please try again.";
  }
}

export async function getSpeakingFeedback(part: number, question: string, responseText: string) {
  try {
    const response = await ai.models.generateContent({
      model: "gemini-3.1-pro-preview",
      contents: `You are a strict, official IELTS Speaking examiner. Evaluate the following transcript of a student's response strictly using the official public IELTS Speaking Band Descriptors. Provide a professional, objective examiner report. Do not inflate scores.

Task: Speaking Part ${part}
Question/Cue: "${question}"
Student's response: "${responseText}"

For each criterion (Fluency and Coherence, Lexical Resource, Grammatical Range and Accuracy), provide a specific band score and a formal justification quoting the exact language from the official band descriptors. (Note: Pronunciation cannot be fully assessed from text, so provide an estimated note based on word choices and sentence complexity).`,
      config: {
        responseMimeType: "application/json",
        responseSchema: {
          type: Type.OBJECT,
          properties: {
            band: { type: Type.NUMBER },
            fluencyBand: { type: Type.NUMBER },
            vocabularyBand: { type: Type.NUMBER },
            grammarBand: { type: Type.NUMBER },
            criteriaFeedback: {
              type: Type.OBJECT,
              properties: {
                fluency: { type: Type.STRING },
                vocabulary: { type: Type.STRING },
                grammar: { type: Type.STRING }
              }
            },
            pronunciationNote: { type: Type.STRING },
            strengths: { type: Type.ARRAY, items: { type: Type.STRING } },
            improvements: { type: Type.ARRAY, items: { type: Type.STRING } },
            upgradedResponse: { type: Type.STRING },
            bandGap: { type: Type.STRING }
          }
        }
      }
    });
    return JSON.parse(response.text || "{}");
  } catch (error) {
    console.error("Error getting speaking feedback:", error);
    return { band: 0, fluencyBand: 0, vocabularyBand: 0, grammarBand: 0, criteriaFeedback: {}, pronunciationNote: "", strengths: [], improvements: [], upgradedResponse: "", bandGap: "Error evaluating response." };
  }
}

export async function getWritingHints(topic: string, type: string) {
  const response = await ai.models.generateContent({
    model: "gemini-3.1-pro-preview",
    contents: `You are an expert IELTS Writing tutor. A student is preparing to write a Task 2 essay on the following topic:
Topic: "${topic}"
Essay Type: "${type}"

Provide a brainstorming guide to help them write a Band 8+ essay. Include:
1. 3-4 key ideas or arguments they could use (brainstorming).
2. 5-6 advanced, topic-specific vocabulary words (Band 7-9) with a short definition.
3. A suggested 4-paragraph structure (Intro, Body 1, Body 2, Conclusion) with a 1-sentence tip for each.`,
    config: {
      responseMimeType: "application/json",
      responseSchema: {
        type: Type.OBJECT,
        properties: {
          brainstorming: { type: Type.ARRAY, items: { type: Type.STRING } },
          vocabulary: {
            type: Type.ARRAY, items: {
              type: Type.OBJECT, properties: {
                word: { type: Type.STRING },
                meaning: { type: Type.STRING }
              }
            }
          },
          structure: {
            type: Type.ARRAY, items: {
              type: Type.OBJECT, properties: {
                paragraph: { type: Type.STRING },
                tip: { type: Type.STRING }
              }
            }
          }
        }
      }
    }
  });
  return JSON.parse(response.text || "{}");
}

export async function generateReadingPassage(topic: string) {
  try {
    const response = await ai.models.generateContent({
      model: "gemini-3.1-pro-preview",
      contents: `Generate a complete IELTS Academic Reading passage about "${topic}" at Band 7–8 level. Include exactly 5 paragraphs. Then create 8 questions in 3 types: 4 TRUE/FALSE/NOT GIVEN, 2 multiple choice (A/B/C/D), and 2 sentence completion (answer = no more than 3 words from passage).`,
      config: {
        responseMimeType: "application/json",
        responseSchema: {
          type: Type.OBJECT,
          properties: {
            title: { type: Type.STRING },
            difficulty: { type: Type.NUMBER },
            paragraphs: { type: Type.ARRAY, items: { type: Type.STRING } },
            tfng: {
              type: Type.ARRAY, items: {
                type: Type.OBJECT, properties: {
                  id: { type: Type.STRING }, statement: { type: Type.STRING }, answer: { type: Type.STRING }
                }
              }
            },
            mcq: {
              type: Type.ARRAY, items: {
                type: Type.OBJECT, properties: {
                  id: { type: Type.STRING }, question: { type: Type.STRING }, options: { type: Type.ARRAY, items: { type: Type.STRING } }, answer: { type: Type.STRING }
                }
              }
            },
            completion: {
              type: Type.ARRAY, items: {
                type: Type.OBJECT, properties: {
                  id: { type: Type.STRING }, sentence: { type: Type.STRING }, answer: { type: Type.STRING }
                }
              }
            }
          }
        }
      }
    });
    return JSON.parse(response.text || "{}");
  } catch (error) {
    console.error("Error generating reading passage:", error);
    return { title: "Error loading passage", difficulty: 0, paragraphs: [], tfng: [], mcq: [], completion: [] };
  }
}

export async function generateListeningSection(ctx: any) {
  try {
    const response = await ai.models.generateContent({
      model: "gemini-3.1-pro-preview",
      contents: `Generate a realistic IELTS Listening Section ${ctx.s} transcript. Context: ${ctx.ctx}. Speakers: ${ctx.speakers}. The transcript should be 350–450 words. Then generate 5 questions: 3 short-answer (1-5 words) and 2 multiple choice (A/B/C/D).`,
      config: {
        responseMimeType: "application/json",
        responseSchema: {
          type: Type.OBJECT,
          properties: {
            scenario: { type: Type.STRING },
            context: { type: Type.STRING },
            transcript: { type: Type.STRING },
            questions: {
              type: Type.ARRAY, items: {
                type: Type.OBJECT, properties: {
                  id: { type: Type.STRING }, type: { type: Type.STRING }, question: { type: Type.STRING }, answer: { type: Type.STRING }, options: { type: Type.ARRAY, items: { type: Type.STRING } }
                }
              }
            }
          }
        }
      }
    });
    return JSON.parse(response.text || "{}");
  } catch (error) {
    console.error("Error generating listening section:", error);
    return { scenario: "Error", context: "Error loading listening section.", transcript: "", questions: [] };
  }
}

export async function generateWritingT1() {
  try {
    const response = await ai.models.generateContent({
      model: "gemini-3.1-pro-preview",
      contents: `Create an IELTS Academic Writing Task 1 prompt about a random academic topic using a random chart type. Include realistic numerical data.`,
      config: {
        responseMimeType: "application/json",
        responseSchema: {
          type: Type.OBJECT,
          properties: {
            title: { type: Type.STRING },
            type: { type: Type.STRING },
            data: { type: Type.STRING }
          }
        }
      }
    });
    const data = JSON.parse(response.text || "{}");
    return { ...data, timeLimit: 1200 };
  } catch (error) {
    console.error("Error generating writing task 1:", error);
    return { title: "Error generating prompt", type: "Bar Chart", data: "[]", timeLimit: 1200 };
  }
}

export async function generateWritingT2() {
  try {
    const response = await ai.models.generateContent({
      model: "gemini-3.1-pro-preview",
      contents: `Write one IELTS Academic Writing Task 2 question. Make it precise, thought-provoking, realistic for IELTS Band 7+ candidates.`,
      config: {
        responseMimeType: "application/json",
        responseSchema: {
          type: Type.OBJECT,
          properties: {
            prompt: { type: Type.STRING }
          }
        }
      }
    });
    const data = JSON.parse(response.text || "{}");
    return {
      prompt: data.prompt, type: "Discussion + Opinion", timeLimit: 2400, wordTarget: 250,
      tips: ["Present both sides before giving your view", "State opinion clearly in intro AND conclusion", "Aim for 280–320 words for Band 7.5+"]
    };
  } catch (error) {
    console.error("Error generating writing task 2:", error);
    return {
      prompt: "Error generating prompt. Please try again.", type: "Discussion + Opinion", timeLimit: 2400, wordTarget: 250,
      tips: ["Present both sides before giving your view", "State opinion clearly in intro AND conclusion", "Aim for 280–320 words for Band 7.5+"]
    };
  }
}

export async function generateSpeakingPart1(topic?: string) {
  try {
    const response = await ai.models.generateContent({
      model: "gemini-3.1-pro-preview",
      contents: `Generate 4 IELTS Speaking Part 1 questions about a random common topic${topic ? ` related to ${topic}` : ''}.`,
      config: {
        responseMimeType: "application/json",
        responseSchema: {
          type: Type.OBJECT,
          properties: {
            topic: { type: Type.STRING },
            questions: { type: Type.ARRAY, items: { type: Type.STRING } }
          }
        }
      }
    });
    return JSON.parse(response.text || "{}");
  } catch (error) {
    console.error("Error generating speaking part 1:", error);
    return { topic: "Error", questions: [] };
  }
}

export async function generateSpeakingPart2() {
  try {
    const response = await ai.models.generateContent({
      model: "gemini-3.1-pro-preview",
      contents: `Generate an IELTS Speaking Part 2 cue card about a random topic. Write a 1-sentence task instruction and exactly 4 bullet points.`,
      config: {
        responseMimeType: "application/json",
        responseSchema: {
          type: Type.OBJECT,
          properties: {
            cue: { type: Type.STRING },
            bullets: { type: Type.ARRAY, items: { type: Type.STRING } }
          }
        }
      }
    });
    const data = JSON.parse(response.text || "{}");
    return { ...data, time: 120 };
  } catch (error) {
    console.error("Error generating speaking part 2:", error);
    return { cue: "Error generating cue card.", bullets: [], time: 120 };
  }
}

export async function generateSpeakingPart3(theme?: string) {
  try {
    const response = await ai.models.generateContent({
      model: "gemini-3.1-pro-preview",
      contents: `Generate 4 IELTS Speaking Part 3 discussion questions on an abstract academic theme${theme ? ` related to ${theme}` : ''}.`,
      config: {
        responseMimeType: "application/json",
        responseSchema: {
          type: Type.OBJECT,
          properties: {
            topic: { type: Type.STRING },
            questions: { type: Type.ARRAY, items: { type: Type.STRING } }
          }
        }
      }
    });
    return JSON.parse(response.text || "{}");
  } catch (error) {
    console.error("Error generating speaking part 3:", error);
    return { topic: "Error", questions: [] };
  }
}

export async function upgradeSentenceToBand9(sentence: string, taskContext: string) {
  try {
    const response = await ai.models.generateContent({
      model: "gemini-3.1-pro-preview",
      contents: `You are an expert IELTS Writing tutor. A student wrote the following sentence in their essay:
"${sentence}"

The essay prompt/context is: "${taskContext}"

Rewrite this exact sentence to a Band 9 level. Use advanced academic vocabulary, complex grammatical structures, and ensure perfect coherence.
Provide a brief explanation of why the new version is better.`,
      config: {
        responseMimeType: "application/json",
        responseSchema: {
          type: Type.OBJECT,
          properties: {
            upgradedSentence: { type: Type.STRING },
            explanation: { type: Type.STRING }
          }
        }
      }
    });
    return JSON.parse(response.text || "{}");
  } catch (error) {
    console.error("Error upgrading sentence:", error);
    return { upgradedSentence: "Error upgrading sentence.", explanation: "Please try again." };
  }
}

export async function generateStudyPlanAndAnalytics(logs: any[], targetBand: number) {
  try {
    const hasLogs = logs && logs.length > 0;
    const prompt = hasLogs 
      ? `You are an expert IELTS tutor. Analyze the following student history logs and their target band of ${targetBand}.
Identify their top 2 weaknesses based on the data. Then, generate a personalized 7-day study plan to help them reach their target band.

Student Logs:
${JSON.stringify(logs.slice(0, 20))}`
      : `You are an expert IELTS tutor. The student has a target band of ${targetBand} but hasn't completed any practice tests yet.
Identify 2 common weaknesses for students aiming for this band. Then, generate a general 7-day study plan to help them get started and reach their target band.`;

    const response = await ai.models.generateContent({
      model: "gemini-3.1-pro-preview",
      contents: prompt,
      config: {
        responseMimeType: "application/json",
        responseSchema: {
          type: Type.OBJECT,
          properties: {
            weaknesses: {
              type: Type.ARRAY, items: {
                type: Type.OBJECT, properties: {
                  skill: { type: Type.STRING },
                  description: { type: Type.STRING },
                  advice: { type: Type.STRING }
                }
              }
            },
            studyPlan: {
              type: Type.ARRAY, items: {
                type: Type.OBJECT, properties: {
                  day: { type: Type.NUMBER },
                  focus: { type: Type.STRING },
                  task: { type: Type.STRING }
                }
              }
            }
          }
        }
      }
    });
    return JSON.parse(response.text || "{}");
  } catch (error) {
    console.error("Error generating study plan:", error);
    return { weaknesses: [], studyPlan: [] };
  }
}

export async function getDailyVocabChallenge() {
  try {
    const response = await ai.models.generateContent({
      model: "gemini-3.1-pro-preview",
      contents: `Generate a daily academic vocabulary challenge for an IELTS student. Provide 5 advanced words (Band 7-9) that frequently appear in IELTS Reading or Writing.
For each word, provide its definition, an example sentence, and a multiple-choice question to test understanding.`,
      config: {
        responseMimeType: "application/json",
        responseSchema: {
          type: Type.OBJECT,
          properties: {
            words: {
              type: Type.ARRAY, items: {
                type: Type.OBJECT, properties: {
                  word: { type: Type.STRING },
                  definition: { type: Type.STRING },
                  example: { type: Type.STRING },
                  question: { type: Type.STRING },
                  options: { type: Type.ARRAY, items: { type: Type.STRING } },
                  correctAnswer: { type: Type.STRING }
                }
              }
            }
          }
        }
      }
    });
    return JSON.parse(response.text || "{}");
  } catch (error) {
    console.error("Error generating vocab challenge:", error);
    return { words: [] };
  }
}

export async function evaluateSpeakingAudio(audioBase64: string, mimeType: string, prompt: string) {
  try {
    const response = await ai.models.generateContent({
      model: "gemini-2.5-flash",
      contents: {
        parts: [
          {
            inlineData: {
              data: audioBase64,
              mimeType: mimeType
            }
          },
          {
            text: `You are a strict, official IELTS Speaking examiner. Evaluate the attached audio response to the following prompt: "${prompt}".
Strictly use the official public IELTS Speaking Band Descriptors. Provide a professional, objective examiner report. Do not inflate scores.

For each criterion (Fluency and Coherence, Lexical Resource, Grammatical Range and Accuracy, Pronunciation), provide a specific band score and a formal justification quoting the exact language from the official band descriptors.`
          }
        ]
      },
      config: {
        responseMimeType: "application/json",
        responseSchema: {
          type: Type.OBJECT,
          properties: {
            band: { type: Type.NUMBER },
            fluencyBand: { type: Type.NUMBER },
            vocabularyBand: { type: Type.NUMBER },
            grammarBand: { type: Type.NUMBER },
            pronunciationBand: { type: Type.NUMBER },
            criteriaFeedback: {
              type: Type.OBJECT,
              properties: {
                fluency: { type: Type.STRING },
                vocabulary: { type: Type.STRING },
                grammar: { type: Type.STRING },
                pronunciation: { type: Type.STRING }
              }
            },
            transcript: { type: Type.STRING },
            strengths: { type: Type.ARRAY, items: { type: Type.STRING } },
            improvements: { type: Type.ARRAY, items: { type: Type.STRING } },
            bandGap: { type: Type.STRING }
          }
        }
      }
    });
    return JSON.parse(response.text || "{}");
  } catch (error) {
    console.error("Error evaluating speaking audio:", error);
    return {
      band: 0,
      fluencyBand: 0,
      vocabularyBand: 0,
      grammarBand: 0,
      pronunciationBand: 0,
      criteriaFeedback: {
        fluency: "Error evaluating audio.",
        vocabulary: "Error evaluating audio.",
        grammar: "Error evaluating audio.",
        pronunciation: "Error evaluating audio."
      },
      transcript: "Error transcribing audio.",
      strengths: [],
      improvements: [],
      bandGap: "Error evaluating audio."
    };
  }
}

