
import { GoogleGenAI, Type } from "@google/genai";
import { RevisionSuggestion, ReadabilityMetrics, PovAnalysis, MotionAnalysis, SceneMetadata, SceneSetting, ReportResult, CharacterSceneData, TimelineData } from "../types";

let ai: GoogleGenAI | null = null;

// Initialize dynamic client
const getClient = (): GoogleGenAI | null => {
    if (ai) return ai;
    
    // Priority: LocalStorage (User entered) -> Env Var (Build time)
    const storedKey = localStorage.getItem('nebula_api_key');
    const envKey = process.env.API_KEY;
    const finalKey = (storedKey && storedKey.trim() !== '') ? storedKey : (envKey && envKey !== 'dummy_key' && envKey !== '') ? envKey : null;

    if (finalKey) {
        try {
            ai = new GoogleGenAI({ apiKey: finalKey });
            return ai;
        } catch (e) {
            console.warn("AI Client failed to initialize.", e);
            return null;
        }
    }
    return null;
};

// Allow updating the key at runtime
export const setUserApiKey = (key: string) => {
    localStorage.setItem('nebula_api_key', key);
    ai = null; // Force recreation
    getClient();
};

// --- HELPER: Simulation Delay ---
const simulateDelay = () => new Promise(resolve => setTimeout(resolve, 1500));

// --- FUNCTIONS ---

export const generateWritingAssistance = async (prompt: string, context: string): Promise<string> => {
  try {
    const client = getClient();
    if (!client) throw new Error("Offline");
    
    const model = 'gemini-3-flash-preview';
    const response = await client.models.generateContent({
      model,
      contents: `You are an expert editor and writing assistant. Context: "${context}". User Instruction: "${prompt}". Return ONLY the improved/generated text.`,
    });
    return response.text || "Could not generate text.";
  } catch (error) {
    await simulateDelay();
    return `[OFFLINE MODE] Here is a simulated continuation based on your prompt: "${prompt}". \n\nThe wind howled through the trees, mimicking the turmoil inside his heart. He knew he couldn't stay here any longer. (This is placeholder text generated because no valid API Key was found. Please add your key in Settings).`;
  }
};

export const refineText = async (selection: string, instruction: string): Promise<string> => {
  try {
     const client = getClient();
     if (!client) throw new Error("Offline");
     const model = 'gemini-3-flash-preview';
    const response = await client.models.generateContent({
      model,
      contents: `Rewrite the following text according to the instruction: "${instruction}". Original: "${selection}". Return ONLY the rewritten text.`,
    });
    return response.text || selection;
  } catch (error) {
    await simulateDelay();
    return `[OFFLINE REWRITE]: ${selection} (Simulated polish for instruction: ${instruction})`;
  }
}

export const generateImage = async (prompt: string): Promise<string> => {
  try {
    const client = getClient();
    if (!client) throw new Error("Offline");
    const model = 'gemini-2.5-flash-image';
    const response = await client.models.generateContent({
      model,
      contents: { parts: [{ text: prompt }] }
    });
    for (const part of response.candidates?.[0]?.content?.parts || []) {
      if (part.inlineData) return `data:${part.inlineData.mimeType};base64,${part.inlineData.data}`;
    }
    throw new Error("No image data");
  } catch (error) {
    await simulateDelay();
    // Return a placeholder image service URL
    return `https://placehold.co/600x400/EEE/31343C?font=playfair-display&text=${encodeURIComponent(prompt.substring(0, 20))}`;
  }
};

export const chatWithDocument = async (history: {role: string, parts: {text: string}[]}[], newMessage: string, docContext: string) => {
    try {
        const client = getClient();
        if (!client) throw new Error("Offline");
        const chat = client.chats.create({
            model: 'gemini-3-flash-preview',
            config: { systemInstruction: `You are a helpful assistant. Context: ${docContext}` },
            history: history as any
        });
        const result = await chat.sendMessage({ message: newMessage });
        return result.text;
    } catch (error) {
        await simulateDelay();
        return "I am currently in Offline Mode. I can't analyze the live text, but I'm here to help you organize your thoughts! Please add a free API key in Settings to activate me.";
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
        const client = getClient();
        if (!client) throw new Error("Offline");
        
        const parser = new DOMParser();
        const doc = parser.parseFromString(context, 'text/html');
        const plainText = doc.body.textContent || "";
        if (!plainText.trim()) return null;

        const model = 'gemini-3-flash-preview';
        const response = await client.models.generateContent({
            model,
            contents: `Analyze this text and return a JSON object with characters, setting, metadata (story mechanics), and timeline estimation. Text: "${plainText.substring(0, 25000)}"`,
            config: { 
                responseMimeType: "application/json",
                responseSchema: {
                    type: Type.OBJECT,
                    properties: {
                        characters: { type: Type.ARRAY, items: { type: Type.OBJECT, properties: {
                            id: {type: Type.STRING}, name: {type: Type.STRING}, role: {type: Type.STRING}, goal: {type: Type.STRING}, motivation: {type: Type.STRING}, conflict: {type: Type.STRING}, climax: {type: Type.STRING}, outcome: {type: Type.STRING}, arcStart: {type: Type.STRING}, arcEnd: {type: Type.STRING}
                        }}},
                        setting: { type: Type.OBJECT, properties: {
                            location: {type: Type.STRING}, time: {type: Type.STRING}, objects: {type: Type.ARRAY, items: {type: Type.STRING}},
                            senses: {type: Type.OBJECT, properties: { sight: {type: Type.STRING}, sound: {type: Type.STRING}, smell: {type: Type.STRING}, touch: {type: Type.STRING}, taste: {type: Type.STRING} }},
                            emotionalImpact: {type: Type.STRING}
                        }},
                        metadata: { type: Type.OBJECT, properties: {
                            storyMap: {type: Type.STRING}, purpose: {type: Type.STRING}, sceneType: {type: Type.STRING}, openingType: {type: Type.STRING}, entryHook: {type: Type.STRING}, closingType: {type: Type.STRING}, exitHook: {type: Type.STRING}, tension: {type: Type.NUMBER}, pacing: {type: Type.NUMBER}, isFlashback: {type: Type.BOOLEAN}, backstory: {type: Type.STRING}, revelation: {type: Type.STRING}, plotPoint: {type: Type.STRING}
                        }},
                        timeline: { type: Type.OBJECT, properties: {
                            start: {type: Type.STRING}, duration: {type: Type.NUMBER}
                        }}
                    }
                }
            }
        });
        
        return JSON.parse(response.text || "null");
    } catch (error) {
        await simulateDelay();
        // Simulation Data
        return {
            characters: [
                { id: 'sim-1', name: 'Offline Hero', role: 'Protagonist', goal: 'To survive', motivation: 'Fear', conflict: 'The storm', climax: '', outcome: '', arcStart: 'Anxious', arcEnd: 'Brave' }
            ],
            setting: {
                location: 'Offline Mode Room',
                time: 'Midnight',
                objects: ['Computer', 'Coffee Cup'],
                senses: { sight: 'Dim light', sound: 'Humming', smell: 'Coffee', touch: 'Cold keys', taste: 'Bitter' },
                emotionalImpact: 'Isolation'
            },
            metadata: {
                storyMap: 'Rising Action',
                purpose: 'Establish the stakes',
                sceneType: 'Action',
                openingType: 'Dialogue',
                entryHook: 'The lights flickered.',
                closingType: 'Cliffhanger',
                exitHook: 'Then the door opened.',
                tension: 7,
                pacing: 8,
                isFlashback: false,
                backstory: 'Low',
                revelation: 'He was not alone.',
                plotPoint: 'Inciting Incident'
            },
            timeline: {
                start: new Date().toISOString().slice(0,16),
                duration: 0
            }
        };
    }
}

// --- Specific Analyzers ---

export const generateRevisionSuggestions = async (context: string): Promise<RevisionSuggestion[]> => {
    try {
        const client = getClient();
        if (!client) throw new Error("Offline");
        
        // Simplified for brevity, normally you'd use a robust schema here
        const response = await client.models.generateContent({
            model: 'gemini-3-flash-preview',
            contents: `Act as a book editor. Analyze the text for style, clarity, and conciseness issues. Return JSON array of suggestions. Text: ${context.substring(0, 10000)}`,
            config: { responseMimeType: "application/json" }
        });
        return JSON.parse(response.text || "[]");
    } catch (error) {
        await simulateDelay();
        return [
            { id: 'sim-rev-1', original: 'very good', replacement: 'excellent', category: 'Style', explanation: 'Avoid weak modifiers.' },
            { id: 'sim-rev-2', original: 'He thought to himself', replacement: 'He thought', category: 'Conciseness', explanation: 'Redundant phrasing.' }
        ];
    }
}

export const runAdvancedGrammarCheck = async (context: string): Promise<RevisionSuggestion[]> => {
    try {
        const client = getClient();
        if (!client) throw new Error("Offline");
        // Grammar logic
        const response = await client.models.generateContent({
            model: 'gemini-3-flash-preview',
            contents: `Check grammar, spelling and punctuation. Return JSON array. Text: ${context.substring(0, 10000)}`,
            config: { responseMimeType: "application/json" }
        });
        return JSON.parse(response.text || "[]");
    } catch(e) {
        await simulateDelay();
        return []; 
    }
}

export const analyzeStyle = async (context: string): Promise<RevisionSuggestion[]> => {
    try {
        const client = getClient();
        if (!client) throw new Error("Offline");
        const response = await client.models.generateContent({
            model: 'gemini-3-flash-preview',
            contents: `Analyze writing style (passive voice, show don't tell, adverbs). Return JSON array. Text: ${context.substring(0, 10000)}`,
            config: { responseMimeType: "application/json" }
        });
        return JSON.parse(response.text || "[]");
    } catch(e) {
        await simulateDelay();
        return [
            { id: 'style-1', original: 'There was', replacement: '[Strong Verb]', category: 'Style', explanation: 'Passive voice detected. (Offline Sim)' }
        ];
    }
}

export const analyzeReadability = async (context: string): Promise<ReadabilityMetrics | null> => {
    // Basic calculation can run offline
    const parser = new DOMParser();
    const doc = parser.parseFromString(context, 'text/html');
    const text = doc.body.textContent || "";
    
    const words = text.trim().split(/\s+/).length;
    const sentences = text.split(/[.!?]+/).length;
    const avgLen = sentences > 0 ? words / sentences : 0;
    
    let score = 100 - (avgLen * 1.5); 
    if (score < 0) score = 0;
    if (score > 100) score = 100;

    let grade = "5th Grade";
    if (avgLen > 15) grade = "9th Grade";
    if (avgLen > 25) grade = "College Level";

    // Only use AI for qualitative analysis if available
    let issues = [];
    const client = getClient();
    if (client) {
        try {
             const response = await client.models.generateContent({
                model: 'gemini-3-flash-preview',
                contents: `Identify long, complex, or hard-to-read sentences. Return JSON array of issues {id, text, type, suggestion}. Text: ${text.substring(0, 5000)}`,
                config: { responseMimeType: "application/json" }
            });
            const aiData = JSON.parse(response.text || "{}");
            if (Array.isArray(aiData)) issues = aiData;
            else if (aiData.issues) issues = aiData.issues;
        } catch(e) {}
    } else if (avgLen > 20) {
        issues.push({ id: 'sim-read', text: text.substring(0, 50) + "...", type: 'complexity', suggestion: 'Shorten this sentence.' });
    }

    return {
        score: Math.round(score),
        gradeLevel: grade,
        complexSentenceCount: Math.round(sentences * 0.1),
        avgSentenceLength: avgLen,
        issues: issues
    };
}

export const checkPovConsistency = async (context: string, charName: string): Promise<PovAnalysis | null> => {
    try {
        const client = getClient();
        if (!client) throw new Error("Offline");
        const response = await client.models.generateContent({
            model: 'gemini-3-flash-preview',
            contents: `Analyze POV consistency for character "${charName}". Return JSON. Text: ${context.substring(0, 10000)}`,
            config: { responseMimeType: "application/json" }
        });
        return JSON.parse(response.text || "null");
    } catch(e) {
        await simulateDelay();
        return {
            score: 85,
            voiceType: 'Third Person Limited',
            consistencyStatus: 'Consistent',
            feedback: 'Narrative distance is well maintained. (Offline Sim)',
            issues: []
        };
    }
}

export const analyzeCharacterArc = async (context: string, charName: string): Promise<{ start: string, end: string, outcome: string } | null> => {
    try {
        const client = getClient();
        if (!client) throw new Error("Offline");
        const response = await client.models.generateContent({
            model: 'gemini-3-flash-preview',
            contents: `Analyze character arc for "${charName}". Return JSON {start, end, outcome}. Text: ${context.substring(0, 10000)}`,
            config: { responseMimeType: "application/json" }
        });
        return JSON.parse(response.text || "null");
    } catch(e) {
        await simulateDelay();
        return { start: 'Undecided', end: 'Committed', outcome: 'Action taken (Offline)' };
    }
}

export const analyzeCharacterMotion = async (context: string, charName: string): Promise<MotionAnalysis | null> => {
    try {
        const client = getClient();
        if (!client) throw new Error("Offline");
        const response = await client.models.generateContent({
            model: 'gemini-3-flash-preview',
            contents: `Analyze physical motion for "${charName}". Return JSON MotionAnalysis. Text: ${context.substring(0, 10000)}`,
            config: { responseMimeType: "application/json" }
        });
        return JSON.parse(response.text || "null");
    } catch(e) {
        await simulateDelay();
        return { score: 50, status: 'Balanced', actions: ['Walks', 'Sits'], feedback: 'Good balance. (Offline)' };
    }
}

export const generateActionSuggestions = async (context: string, charName: string): Promise<string[]> => {
    try {
        const client = getClient();
        if (!client) throw new Error("Offline");
        const response = await client.models.generateContent({
            model: 'gemini-3-flash-preview',
            contents: `Suggest 3 physical actions for "${charName}" based on context. Return JSON array of strings. Text: ${context.substring(0, 5000)}`,
            config: { responseMimeType: "application/json" }
        });
        return JSON.parse(response.text || "[]");
    } catch(e) {
        await simulateDelay();
        return ['Paces around', 'Checks watch', 'Leans against wall'];
    }
}

export const analyzeCharacterConflict = async (context: string, charName: string): Promise<string | null> => {
    try {
        const client = getClient();
        if (!client) throw new Error("Offline");
        const response = await client.models.generateContent({
            model: 'gemini-3-flash-preview',
            contents: `Summarize the main conflict for "${charName}" in one sentence. Text: ${context.substring(0, 5000)}`,
        });
        return response.text;
    } catch(e) {
        await simulateDelay();
        return "Internal doubt vs External pressure (Offline)";
    }
}

export const analyzeSceneMechanics = async (context: string): Promise<SceneMetadata | null> => {
    try {
        const client = getClient();
        if (!client) throw new Error("Offline");
        const response = await client.models.generateContent({
            model: 'gemini-3-flash-preview',
            contents: `Analyze scene mechanics. Return JSON SceneMetadata. Text: ${context.substring(0, 10000)}`,
            config: { responseMimeType: "application/json" }
        });
        return JSON.parse(response.text || "null");
    } catch(e) {
        await simulateDelay();
        return {
            storyMap: 'Rising Action',
            purpose: 'Advance the plot',
            sceneType: 'Mixed',
            openingType: 'Action',
            entryHook: 'Simulated Entry Hook',
            closingType: 'Dialogue',
            exitHook: 'Simulated Exit Hook',
            tension: 6,
            pacing: 5,
            isFlashback: false,
            backstory: 'Low',
            revelation: 'Something important.',
            plotPoint: 'Beat 1'
        };
    }
}

export const analyzeSceneSetting = async (context: string): Promise<SceneSetting | null> => {
    try {
        const client = getClient();
        if (!client) throw new Error("Offline");
        const response = await client.models.generateContent({
            model: 'gemini-3-flash-preview',
            contents: `Analyze scene setting. Return JSON SceneSetting. Text: ${context.substring(0, 10000)}`,
            config: { responseMimeType: "application/json" }
        });
        return JSON.parse(response.text || "null");
    } catch(e) {
        await simulateDelay();
        return {
            location: 'Simulated Location',
            time: 'Day',
            objects: ['Chair', 'Table'],
            senses: { sight: 'Bright', sound: 'Quiet', smell: 'Neutral', touch: 'Rough', taste: '-' },
            emotionalImpact: 'Calm'
        };
    }
}

export const scanSceneDetails = async (context: string): Promise<{
    characters: string[];
    location: string;
    time: string;
    date: string;
} | null> => {
    try {
        const client = getClient();
        if (!client) throw new Error("Offline");
        const response = await client.models.generateContent({
            model: 'gemini-3-flash-preview',
            contents: `Extract scene details: characters (names), location, time of day, date (if any). Return JSON. Text: ${context.substring(0, 10000)}`,
            config: { responseMimeType: "application/json" }
        });
        return JSON.parse(response.text || "null");
    } catch(e) {
        await simulateDelay();
        return {
            characters: ['Hero', 'Villain'],
            location: 'The Base',
            time: 'Night',
            date: '2023-10-01'
        };
    }
}

export const runWritingReport = async (reportId: string, context: string): Promise<ReportResult | null> => {
    try {
        const client = getClient();
        if (!client) throw new Error("Offline");
        const response = await client.models.generateContent({
            model: 'gemini-3-flash-preview',
            contents: `Generate writing report "${reportId}". Return JSON ReportResult {summary, highlights: [{text, comment, type}], stats, chartData}. Text: ${context.substring(0, 15000)}`,
            config: { responseMimeType: "application/json" }
        });
        return JSON.parse(response.text || "null");
    } catch(e) {
        await simulateDelay();
        return {
            reportId,
            score: 75,
            summary: "This is a simulated report generated in Offline Mode. The text flows well, but specific AI analysis requires an API Key. Please enter your free key in Settings.",
            highlights: [],
            stats: [{ label: "Simulated Stat", value: "100%" }],
            chartData: [{ label: "A", value: 30 }, { label: "B", value: 70 }]
        };
    }
}
