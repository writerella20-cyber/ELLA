
import { GoogleGenAI, Type } from "@google/genai";
import { RevisionSuggestion, ReadabilityMetrics, PovAnalysis, MotionAnalysis, SceneMetadata, SceneSetting, ReportResult, CharacterSceneData, TimelineData } from "../types";

const ai = new GoogleGenAI({ apiKey: process.env.API_KEY });

// --- Existing Functions (Keep generic ones, add the master sync function below) ---

export const generateWritingAssistance = async (prompt: string, context: string): Promise<string> => {
  try {
    const model = 'gemini-3-flash-preview';
    const response = await ai.models.generateContent({
      model,
      contents: `You are an expert editor and writing assistant.
      
      Context of the document:
      "${context}"

      User Instruction:
      "${prompt}"
      
      Return ONLY the improved/generated text. Do not add conversational filler.`,
    });
    
    return response.text || "Could not generate text.";
  } catch (error) {
    console.error("Gemini Writing Error:", error);
    throw error;
  }
};

export const refineText = async (selection: string, instruction: string): Promise<string> => {
  try {
     const model = 'gemini-3-flash-preview';
    const response = await ai.models.generateContent({
      model,
      contents: `You are an expert editor. Rewrite the following text according to the instruction: "${instruction}".
      
      Original Text: "${selection}"
      
      Return ONLY the rewritten text. Do not include quotes unless they are part of the text.`,
    });
    return response.text || selection;
  } catch (error) {
    console.error("Gemini Refine Error:", error);
    throw error;
  }
}

export const generateImage = async (prompt: string): Promise<string> => {
  try {
    const model = 'gemini-2.5-flash-image';
    const response = await ai.models.generateContent({
      model,
      contents: {
        parts: [
          { text: prompt }
        ]
      }
    });

    for (const part of response.candidates?.[0]?.content?.parts || []) {
      if (part.inlineData) {
        return `data:${part.inlineData.mimeType};base64,${part.inlineData.data}`;
      }
    }
    
    throw new Error("No image data returned");
  } catch (error) {
    console.error("Gemini Image Error:", error);
    throw error;
  }
};

export const chatWithDocument = async (history: {role: string, parts: {text: string}[]}[], newMessage: string, docContext: string) => {
    try {
        const chat = ai.chats.create({
            model: 'gemini-3-flash-preview',
            config: {
                systemInstruction: `You are a helpful assistant for a document editor. use the following document content as context for your answers:\n\n${docContext}`
            },
            history: history as any
        });

        const result = await chat.sendMessage({ message: newMessage });
        return result.text;
    } catch (error) {
        console.error("Chat Error:", error);
        throw error;
    }
}

// --- MASTER SYNC FUNCTION ---
export const autoPopulateSceneData = async (context: string): Promise<{
    characters: CharacterSceneData[];
    setting: SceneSetting;
    metadata: SceneMetadata;
    timeline: TimelineData;
} | null> => {
    try {
        const parser = new DOMParser();
        const doc = parser.parseFromString(context, 'text/html');
        const plainText = doc.body.textContent || "";
        
        if (!plainText.trim()) return null;

        const model = 'gemini-3-flash-preview';
        const response = await ai.models.generateContent({
            model,
            contents: `Analyze the following story scene. Extract metadata to populate the author's planning tools automatically.
            
            1. Identify all characters present. Infer their role, goal, and motivation based on the text.
            2. Identify the setting details (Location, Time, Senses).
            3. Analyze story mechanics (Tension, Pacing, Purpose).
            4. Infer the specific timeline date/time if mentioned or implied.

            Scene Text:
            "${plainText.substring(0, 25000)}"`,
            config: {
                responseMimeType: "application/json",
                responseSchema: {
                    type: Type.OBJECT,
                    properties: {
                        characters: {
                            type: Type.ARRAY,
                            items: {
                                type: Type.OBJECT,
                                properties: {
                                    name: { type: Type.STRING },
                                    role: { type: Type.STRING, enum: ['Protagonist', 'Antagonist', 'Supporting', 'Minor'] },
                                    goal: { type: Type.STRING, description: "What they want in this scene" },
                                    motivation: { type: Type.STRING, description: "Why they want it" },
                                    conflict: { type: Type.STRING, description: "What stops them" }
                                },
                                required: ["name", "role", "goal", "motivation"]
                            }
                        },
                        setting: {
                            type: Type.OBJECT,
                            properties: {
                                location: { type: Type.STRING },
                                time: { type: Type.STRING },
                                objects: { type: Type.ARRAY, items: { type: Type.STRING } },
                                senses: {
                                    type: Type.OBJECT,
                                    properties: {
                                        sight: { type: Type.STRING },
                                        smell: { type: Type.STRING },
                                        taste: { type: Type.STRING },
                                        sound: { type: Type.STRING },
                                        touch: { type: Type.STRING },
                                    }
                                },
                                emotionalImpact: { type: Type.STRING }
                            }
                        },
                        metadata: {
                            type: Type.OBJECT,
                            properties: {
                                purpose: { type: Type.STRING },
                                sceneType: { type: Type.STRING, enum: ['Action', 'Sequel', 'Mixed'] },
                                tension: { type: Type.INTEGER, description: "1-10" },
                                pacing: { type: Type.INTEGER, description: "1-10" },
                                entryHook: { type: Type.STRING },
                                exitHook: { type: Type.STRING },
                                plotPoint: { type: Type.STRING }
                            }
                        },
                        timeline: {
                            type: Type.OBJECT,
                            properties: {
                                inferredDateTime: { type: Type.STRING, description: "ISO format or description" }
                            }
                        }
                    },
                    required: ["characters", "setting", "metadata"]
                }
            }
        });

        const jsonStr = response.text || "{}";
        const result = JSON.parse(jsonStr);

        // Transform into internal types
        const characters: CharacterSceneData[] = (result.characters || []).map((c: any) => ({
            id: `char-${Date.now()}-${Math.random()}`,
            name: c.name,
            role: c.role,
            goal: c.goal,
            motivation: c.motivation,
            conflict: c.conflict || '',
            climax: '',
            outcome: '',
            arcStart: '',
            arcEnd: ''
        }));

        const setting: SceneSetting = {
            location: result.setting?.location || '',
            time: result.setting?.time || '',
            objects: result.setting?.objects || [],
            senses: result.setting?.senses || { sight: '', sound: '', smell: '', touch: '', taste: '' },
            emotionalImpact: result.setting?.emotionalImpact || ''
        };

        const metadata: SceneMetadata = {
            storyMap: '',
            purpose: result.metadata?.purpose || '',
            sceneType: result.metadata?.sceneType || 'Mixed',
            openingType: '',
            entryHook: result.metadata?.entryHook || '',
            closingType: '',
            exitHook: result.metadata?.exitHook || '',
            tension: result.metadata?.tension || 5,
            pacing: result.metadata?.pacing || 5,
            isFlashback: false,
            backstory: 'None',
            revelation: '',
            plotPoint: result.metadata?.plotPoint || ''
        };

        const timeline: TimelineData = {
            start: result.timeline?.inferredDateTime,
            duration: 0
        };

        return { characters, setting, metadata, timeline };

    } catch (error) {
        console.error("Auto-Populate Error:", error);
        return null;
    }
}

// --- Specific Analyzers (Keep these for granular updates if needed) ---

export const generateRevisionSuggestions = async (context: string): Promise<RevisionSuggestion[]> => {
    // ... (rest of the file remains unchanged, keeping existing imports and functions)
    try {
        const model = 'gemini-3-flash-preview';
        const response = await ai.models.generateContent({
            model,
            contents: `Analyze the following HTML Document content for clarity, style, tone, and conciseness improvements. 
            The input is raw HTML. You must identify specific substrings to improve.
            
            IMPORTANT: 
            1. The 'original' field MUST be the EXACT substring found in the input HTML.
            2. The 'replacement' field must be the valid HTML replacement.
            3. Do not break the HTML structure.
            
            HTML Content to analyze:
            "${context}"`,
            config: {
                responseMimeType: "application/json",
                responseSchema: {
                    type: Type.OBJECT,
                    properties: {
                        suggestions: {
                            type: Type.ARRAY,
                            items: {
                                type: Type.OBJECT,
                                properties: {
                                    original: { type: Type.STRING },
                                    replacement: { type: Type.STRING },
                                    category: { type: Type.STRING },
                                    explanation: { type: Type.STRING }
                                },
                                required: ["original", "replacement", "category", "explanation"]
                            }
                        }
                    }
                }
            }
        });

        const jsonStr = response.text || "{}";
        const result = JSON.parse(jsonStr);
        
        return result.suggestions.map((s: any, index: number) => ({
            id: `sug-${Date.now()}-${index}`,
            ...s
        }));
    } catch (error) {
        console.error("Revision Analysis Error:", error);
        return [];
    }
}

export const runAdvancedGrammarCheck = async (context: string): Promise<RevisionSuggestion[]> => {
    try {
        const model = 'gemini-3-flash-preview';
        const response = await ai.models.generateContent({
            model,
            contents: `Act as a professional proofreader. Identify grammar, spelling, punctuation, and semantic errors in the provided HTML.
            
            IMPORTANT: 
            1. The 'original' field MUST be the EXACT HTML substring.
            2. The 'replacement' must be the corrected HTML substring.
            
            HTML Content:
            "${context}"`,
            config: {
                responseMimeType: "application/json",
                responseSchema: {
                    type: Type.OBJECT,
                    properties: {
                        suggestions: {
                            type: Type.ARRAY,
                            items: {
                                type: Type.OBJECT,
                                properties: {
                                    original: { type: Type.STRING },
                                    replacement: { type: Type.STRING },
                                    category: { type: Type.STRING },
                                    explanation: { type: Type.STRING }
                                },
                                required: ["original", "replacement", "category", "explanation"]
                            }
                        }
                    }
                }
            }
        });

        const jsonStr = response.text || "{}";
        const result = JSON.parse(jsonStr);
        
        return result.suggestions.map((s: any, index: number) => ({
            id: `lt-${Date.now()}-${index}`,
            ...s
        }));
    } catch (error) {
        console.error("Grammar Check Error:", error);
        return [];
    }
}

export const analyzeStyle = async (context: string): Promise<RevisionSuggestion[]> => {
  try {
      const model = 'gemini-3-flash-preview';
      const response = await ai.models.generateContent({
          model,
          contents: `Analyze the text for stylistic weaknesses (Passive Voice, Adverbs, Repetition, Weak Verbs).
          Input text: "${context}"`,
          config: {
              responseMimeType: "application/json",
              responseSchema: {
                  type: Type.OBJECT,
                  properties: {
                      suggestions: {
                          type: Type.ARRAY,
                          items: {
                              type: Type.OBJECT,
                              properties: {
                                  original: { type: Type.STRING },
                                  replacement: { type: Type.STRING },
                                  category: { type: Type.STRING },
                                  explanation: { type: Type.STRING }
                              },
                              required: ["original", "replacement", "category", "explanation"]
                          }
                      }
                  }
              }
          }
      });

      const jsonStr = response.text || "{}";
      const result = JSON.parse(jsonStr);
      return result.suggestions.map((s: any, index: number) => ({
          id: `style-${Date.now()}-${index}`,
          ...s
      }));
  } catch (error) {
      console.error("Style Analysis Error:", error);
      return [];
  }
}

export const analyzeReadability = async (context: string): Promise<ReadabilityMetrics | null> => {
  try {
    const parser = new DOMParser();
    const doc = parser.parseFromString(context, 'text/html');
    const plainText = doc.body.textContent || "";

    if (!plainText.trim()) return null;

    const model = 'gemini-3-flash-preview';
    const response = await ai.models.generateContent({
      model,
      contents: `Analyze readability (Score 0-100, Grade Level, Complexity). Input: "${plainText.substring(0, 20000)}"`,
      config: {
        responseMimeType: "application/json",
        responseSchema: {
          type: Type.OBJECT,
          properties: {
            score: { type: Type.INTEGER },
            gradeLevel: { type: Type.STRING },
            complexSentenceCount: { type: Type.INTEGER },
            avgSentenceLength: { type: Type.NUMBER },
            issues: {
              type: Type.ARRAY,
              items: {
                type: Type.OBJECT,
                properties: {
                  text: { type: Type.STRING },
                  type: { type: Type.STRING },
                  suggestion: { type: Type.STRING }
                },
                required: ["text", "type", "suggestion"]
              }
            }
          },
          required: ["score", "gradeLevel", "complexSentenceCount", "avgSentenceLength", "issues"]
        }
      }
    });

    const jsonStr = response.text || "{}";
    const result = JSON.parse(jsonStr);
    
    return {
      score: result.score,
      gradeLevel: result.gradeLevel,
      complexSentenceCount: result.complexSentenceCount,
      avgSentenceLength: result.avgSentenceLength,
      issues: result.issues.map((i: any, idx: number) => ({
        id: `read-${Date.now()}-${idx}`,
        ...i
      }))
    };

  } catch (error) {
    console.error("Readability Analysis Error:", error);
    return null;
  }
}

export const checkPovConsistency = async (context: string, charName: string): Promise<PovAnalysis | null> => {
  try {
    const parser = new DOMParser();
    const doc = parser.parseFromString(context, 'text/html');
    const plainText = doc.body.textContent || "";
    
    if (!plainText.trim()) return null;

    const model = 'gemini-3-flash-preview';
    const response = await ai.models.generateContent({
      model,
      contents: `Analyze POV consistency for character "${charName}". Input: "${plainText.substring(0, 20000)}"`,
      config: {
        responseMimeType: "application/json",
        responseSchema: {
          type: Type.OBJECT,
          properties: {
            score: { type: Type.INTEGER },
            voiceType: { type: Type.STRING },
            consistencyStatus: { type: Type.STRING, enum: ['Consistent', 'Minor Slips', 'Head-Hopping Detected', 'Uncertain'] },
            feedback: { type: Type.STRING },
            issues: {
              type: Type.ARRAY,
              items: {
                type: Type.OBJECT,
                properties: {
                  text: { type: Type.STRING },
                  explanation: { type: Type.STRING }
                },
                required: ["text", "explanation"]
              }
            }
          },
          required: ["score", "voiceType", "consistencyStatus", "feedback", "issues"]
        }
      }
    });

    const jsonStr = response.text || "{}";
    return JSON.parse(jsonStr);

  } catch (error) {
    console.error("POV Analysis Error:", error);
    return null;
  }
}

export const analyzeCharacterArc = async (context: string, charName: string): Promise<{ start: string, end: string, outcome: string } | null> => {
  try {
    const parser = new DOMParser();
    const doc = parser.parseFromString(context, 'text/html');
    const plainText = doc.body.textContent || "";
    if (!plainText.trim()) return null;

    const model = 'gemini-3-flash-preview';
    const response = await ai.models.generateContent({
      model,
      contents: `Analyze character arc for "${charName}". Input: "${plainText.substring(0, 20000)}"`,
      config: {
        responseMimeType: "application/json",
        responseSchema: {
          type: Type.OBJECT,
          properties: {
            start: { type: Type.STRING },
            end: { type: Type.STRING },
            outcome: { type: Type.STRING }
          },
          required: ["start", "end", "outcome"]
        }
      }
    });

    const jsonStr = response.text || "{}";
    return JSON.parse(jsonStr);

  } catch (error) {
    console.error("Arc Analysis Error:", error);
    return null;
  }
}

export const analyzeCharacterMotion = async (context: string, charName: string): Promise<MotionAnalysis | null> => {
    try {
        const parser = new DOMParser();
        const doc = parser.parseFromString(context, 'text/html');
        const plainText = doc.body.textContent || "";
        if (!plainText.trim()) return null;

        const model = 'gemini-3-flash-preview';
        const response = await ai.models.generateContent({
            model,
            contents: `Analyze physical actions for "${charName}". Input: "${plainText.substring(0, 20000)}"`,
            config: {
                responseMimeType: "application/json",
                responseSchema: {
                    type: Type.OBJECT,
                    properties: {
                        score: { type: Type.INTEGER },
                        status: { type: Type.STRING, enum: ['Static', 'Balanced', 'Dynamic'] },
                        actions: { type: Type.ARRAY, items: { type: Type.STRING } },
                        feedback: { type: Type.STRING }
                    },
                    required: ["score", "status", "actions", "feedback"]
                }
            }
        });

        const jsonStr = response.text || "{}";
        return JSON.parse(jsonStr);

    } catch (error) {
        console.error("Motion Analysis Error:", error);
        return null;
    }
}

export const generateActionSuggestions = async (context: string, charName: string): Promise<string[]> => {
    try {
        const parser = new DOMParser();
        const doc = parser.parseFromString(context, 'text/html');
        const plainText = doc.body.textContent || "";
        if (!plainText.trim()) return [];

        const model = 'gemini-3-flash-preview';
        const response = await ai.models.generateContent({
            model,
            contents: `Suggest physical actions for "${charName}" to make them less static. Context: "${plainText.substring(0, 20000)}"`,
            config: {
                responseMimeType: "application/json",
                responseSchema: {
                    type: Type.OBJECT,
                    properties: {
                        suggestions: { type: Type.ARRAY, items: { type: Type.STRING } }
                    },
                    required: ["suggestions"]
                }
            }
        });

        const jsonStr = response.text || "{}";
        const result = JSON.parse(jsonStr);
        return result.suggestions || [];
    } catch (error) {
        console.error("Action Suggestions Error:", error);
        return [];
    }
}

export const analyzeCharacterConflict = async (context: string, charName: string): Promise<string | null> => {
    try {
        const parser = new DOMParser();
        const doc = parser.parseFromString(context, 'text/html');
        const plainText = doc.body.textContent || "";
        if (!plainText.trim()) return null;

        const model = 'gemini-3-flash-preview';
        const response = await ai.models.generateContent({
            model,
            contents: `Analyze conflict for character "${charName}". Context: "${plainText.substring(0, 20000)}"`,
        });

        return response.text?.trim() || null;

    } catch (error) {
        console.error("Conflict Analysis Error:", error);
        return null;
    }
}

export const analyzeSceneMechanics = async (context: string): Promise<SceneMetadata | null> => {
    try {
        const parser = new DOMParser();
        const doc = parser.parseFromString(context, 'text/html');
        const plainText = doc.body.textContent || "";
        if (!plainText.trim()) return null;

        const model = 'gemini-3-flash-preview';
        const response = await ai.models.generateContent({
            model,
            contents: `Analyze scene mechanics. Input: "${plainText.substring(0, 20000)}"`,
            config: {
                responseMimeType: "application/json",
                responseSchema: {
                    type: Type.OBJECT,
                    properties: {
                        storyMap: { type: Type.STRING },
                        purpose: { type: Type.STRING },
                        sceneType: { type: Type.STRING, enum: ['Action', 'Sequel', 'Mixed'] },
                        openingType: { type: Type.STRING },
                        entryHook: { type: Type.STRING },
                        closingType: { type: Type.STRING },
                        exitHook: { type: Type.STRING },
                        tension: { type: Type.INTEGER },
                        pacing: { type: Type.INTEGER },
                        isFlashback: { type: Type.BOOLEAN },
                        backstory: { type: Type.STRING, enum: ['None', 'Low', 'Moderate', 'High'] },
                        revelation: { type: Type.STRING },
                        plotPoint: { type: Type.STRING }
                    },
                    required: ["storyMap", "purpose", "sceneType", "openingType", "entryHook", "closingType", "exitHook", "tension", "pacing", "isFlashback", "backstory", "revelation", "plotPoint"]
                }
            }
        });

        const jsonStr = response.text || "{}";
        return JSON.parse(jsonStr);

    } catch (error) {
        console.error("Scene Mechanics Analysis Error:", error);
        return null;
    }
}

export const analyzeSceneSetting = async (context: string): Promise<SceneSetting | null> => {
    try {
        const parser = new DOMParser();
        const doc = parser.parseFromString(context, 'text/html');
        const plainText = doc.body.textContent || "";
        if (!plainText.trim()) return null;

        const model = 'gemini-3-flash-preview';
        const response = await ai.models.generateContent({
            model,
            contents: `Analyze setting details. Input: "${plainText.substring(0, 20000)}"`,
            config: {
                responseMimeType: "application/json",
                responseSchema: {
                    type: Type.OBJECT,
                    properties: {
                        location: { type: Type.STRING },
                        time: { type: Type.STRING },
                        objects: { type: Type.ARRAY, items: { type: Type.STRING } },
                        senses: {
                            type: Type.OBJECT,
                            properties: {
                                sight: { type: Type.STRING },
                                smell: { type: Type.STRING },
                                taste: { type: Type.STRING },
                                sound: { type: Type.STRING },
                                touch: { type: Type.STRING },
                            },
                            required: ["sight", "smell", "taste", "sound", "touch"]
                        },
                        emotionalImpact: { type: Type.STRING }
                    },
                    required: ["location", "time", "objects", "senses", "emotionalImpact"]
                }
            }
        });

        const jsonStr = response.text || "{}";
        return JSON.parse(jsonStr);

    } catch (error) {
        console.error("Scene Setting Analysis Error:", error);
        return null;
    }
}

export const scanSceneDetails = async (context: string): Promise<{
    characters: string[];
    location: string;
    time: string;
    date: string;
} | null> => {
    try {
        const parser = new DOMParser();
        const doc = parser.parseFromString(context, 'text/html');
        const plainText = doc.body.textContent || "";
        if (!plainText.trim()) return null;

        const model = 'gemini-3-flash-preview';
        const response = await ai.models.generateContent({
            model,
            contents: `Analyze the scene text to extract metadata for a tracking board.
            
            1. List names of characters present in the scene.
            2. Identify the specific Location.
            3. Identify the Time of day (e.g. Morning, 10:00 AM).
            4. Identify the Date (YYYY-MM-DD or relative like "Day 4") if mentioned or inferable. If not, leave empty.
            
            Input: "${plainText.substring(0, 15000)}"`,
            config: {
                responseMimeType: "application/json",
                responseSchema: {
                    type: Type.OBJECT,
                    properties: {
                        characters: { type: Type.ARRAY, items: { type: Type.STRING } },
                        location: { type: Type.STRING },
                        time: { type: Type.STRING },
                        date: { type: Type.STRING }
                    },
                    required: ["characters", "location", "time", "date"]
                }
            }
        });

        const jsonStr = response.text || "{}";
        return JSON.parse(jsonStr);
    } catch (error) {
        console.error("Scan Scene Error:", error);
        return null;
    }
}

export const runWritingReport = async (reportId: string, context: string): Promise<ReportResult | null> => {
    try {
        const parser = new DOMParser();
        const doc = parser.parseFromString(context, 'text/html');
        const plainText = doc.body.textContent || "";
        if (!plainText.trim()) return null;

        // Custom Prompts based on Report ID
        let systemInstruction = "You are a professional book editor.";
        let analysisPrompt = "";

        switch (reportId) {
            case 'writing-style':
                analysisPrompt = `Analyze the writing style. Identify passive voice usage and hidden verbs (nominalizations). Highlight them as 'warning'. Suggest punchier alternatives. Return stats on passive vs active ratio.`;
                break;
            case 'sticky-sentences':
                analysisPrompt = `Identify "Sticky Sentences" that contain a high percentage of glue words (the, of, is, a, to, in, etc.). Return the sentences as 'highlights' with type 'warning' and a comment on the glue index.`;
                break;
            case 'sentence-length':
                analysisPrompt = `Analyze sentence length variety. Return stats on distribution (Short, Medium, Long). Highlight very long sentences (30+ words) as warnings.`;
                break;
            case 'overused-words':
                analysisPrompt = `Identify overused words (e.g., just, felt, realized, that, really). Highlight them as 'warning'. Return stats on counts.`;
                break;
            case 'cliches':
                analysisPrompt = `Identify clichés and redundancies (e.g. "twelve noon"). Highlight them as 'warning'.`;
                break;
            case 'repeats':
                analysisPrompt = `Identify words or phrases repeated within close proximity. Highlight them.`;
                break;
            case 'dialogue-tags':
                analysisPrompt = `Analyze dialogue tags. Flag "said bookisms" (e.g. "he ejaculated", "she opined") and excessive adverbs in tags. Highlight them as 'warning'.`;
                break;
            case 'pacing':
                analysisPrompt = `Analyze the pacing. Highlight slow introspection sections (blue/info) and fast action sections (green/success). Return chart data for pacing over the text segments.`;
                break;
            case 'sensory':
                analysisPrompt = `Analyze use of 5 senses. Highlight sight, sound, smell, taste, touch words. Return stats on the distribution of senses.`;
                break;
            case 'emotions':
                analysisPrompt = `Flag "telling" of emotions (e.g. "he was angry"). Suggest "showing" alternatives in the comments. Highlight as 'info'.`;
                break;
            case 'vividness':
                analysisPrompt = `Identify weak adjectives and adverbs. Suggest stronger verbs. Highlight as 'warning'.`;
                break;
            case 'alliteration':
                analysisPrompt = `Check for accidental alliteration that is distracting. Highlight as 'info'.`;
                break;
            case 'structure-comparison':
                analysisPrompt = `Analyze the structural flow. Provide a summary of the arc. No specific highlights needed, focus on summary and stats.`;
                break;
            case 'transitions':
                analysisPrompt = `Analyze transitional phrases between paragraphs. Highlight good transitions as 'success', missing ones as 'warning'.`;
                break;
            case 'homonyms':
                analysisPrompt = `Identify commonly confused homonyms (their/there/they're, it's/its). Highlight potential errors as 'critical'.`;
                break;
            case 'contextual-spelling':
                analysisPrompt = `Identify correctly spelled words used in the wrong context (e.g., affect/effect, loose/lose, their/there). Highlight errors as 'critical' and provide the correct word in the comment.`;
                break;
            case 'acronyms':
                analysisPrompt = `List all acronyms. Check if they are defined on first use. Highlight undefined ones as 'warning'.`;
                break;
            case 'diction':
                analysisPrompt = `Scan for "purple prose" or overly complex words. Highlight them as 'info'.`;
                break;
            case 'consistency':
                analysisPrompt = `Check for consistency in spelling (US vs UK) and capitalization. Highlight inconsistencies as 'critical'.`;
                break;
            case 'pronouns':
                analysisPrompt = `Analyze pronoun usage ratio. If too high, highlight areas of confusion as 'warning'.`;
                break;
            case 'vague-words':
                analysisPrompt = `Flag vague filler words (very, really, things, stuff). Highlight as 'warning'.`;
                break;
            case 'readability':
                analysisPrompt = `Calculate readability scores (Flesch-Kincaid). Return score and summary. Highlight very complex paragraphs as 'warning'.`;
                break;
            case 'thesaurus':
                analysisPrompt = `Suggest synonyms for repetitive nouns and verbs. Highlight them as 'info' with suggestions in comments.`;
                break;
            case 'grammar':
                analysisPrompt = `Standard grammar and spell check. Highlight errors as 'critical'.`;
                break;
            case 'plagiarism':
                analysisPrompt = `Analyze the text for content that appears identical or highly similar to known published sources, common internet text, or clichés. Highlight phrases or sentences that are likely to be flagged as plagiarism or unoriginal. In the summary, provide an originality assessment. NOTE: State clearly that this is an AI estimate.`;
                break;
            case 'author-comparison':
                analysisPrompt = `Analyze the writing style (voice, tone, sentence structure). Compare it to famous authors. In the summary, state which author this most resembles (e.g. "Resembles Hemingway due to concise sentences"). Highlight specific phrases that mimic this style as 'info'.`;
                break;
            default:
                analysisPrompt = `Analyze the text for ${reportId}. Highlight interesting findings.`;
        }

        const model = 'gemini-3-flash-preview';
        const response = await ai.models.generateContent({
            model,
            contents: `${systemInstruction}
            
            Task: ${analysisPrompt}
            
            IMPORTANT:
            1. Return 'highlights' where 'text' is the EXACT substring in the input.
            2. 'stats' should be key-value pairs suitable for display.
            3. 'chartData' is optional, for graphing (label/value).
            
            Input Text:
            "${plainText.substring(0, 25000)}"`,
            config: {
                responseMimeType: "application/json",
                responseSchema: {
                    type: Type.OBJECT,
                    properties: {
                        reportId: { type: Type.STRING },
                        score: { type: Type.INTEGER },
                        summary: { type: Type.STRING },
                        highlights: {
                            type: Type.ARRAY,
                            items: {
                                type: Type.OBJECT,
                                properties: {
                                    text: { type: Type.STRING },
                                    comment: { type: Type.STRING },
                                    type: { type: Type.STRING, enum: ['critical', 'warning', 'info', 'success'] }
                                },
                                required: ["text", "comment", "type"]
                            }
                        },
                        stats: {
                            type: Type.ARRAY,
                            items: {
                                type: Type.OBJECT,
                                properties: {
                                    label: { type: Type.STRING },
                                    value: { type: Type.STRING }
                                },
                                required: ["label", "value"]
                            }
                        },
                        chartData: {
                            type: Type.ARRAY,
                            items: {
                                type: Type.OBJECT,
                                properties: {
                                    label: { type: Type.STRING },
                                    value: { type: Type.NUMBER }
                                },
                                required: ["label", "value"]
                            }
                        }
                    },
                    required: ["summary", "highlights"]
                }
            }
        });

        const jsonStr = response.text || "{}";
        const result = JSON.parse(jsonStr);
        return { ...result, reportId };

    } catch (error) {
        console.error("Report Generation Error:", error);
        return null;
    }
}
