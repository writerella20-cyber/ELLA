
export interface DocumentState {
  title: string;
  content: string;
  lastSaved: Date;
}

export interface DocumentVersion {
  id: string;
  name: string;
  timestamp: string;
  content: string;
}

export interface TimelineData {
  start?: string; // ISO Date string
  duration?: number; // Minutes
  color?: string;
  label?: string;
}

export interface PlotThread {
  id: string;
  name: string;
  color: string;
}

export interface MotionAnalysis {
  score: number; // 0-100 (0=Static, 100=Kinetic)
  status: 'Static' | 'Balanced' | 'Dynamic';
  actions: string[]; // List of physical actions identified
  feedback: string;
}

export interface SceneSetting {
  location: string;      // 30. Physical place
  time: string;          // 31. Time/Date
  objects: string[];     // 32. Props
  senses: {
    sight: string;       // 33.
    smell: string;       // 34.
    taste: string;       // 35.
    sound: string;       // 36.
    touch: string;       // 37.
  };
  emotionalImpact: string; // 38. Mood/Feeling
}

export interface SceneMetadata {
  storyMap: string;      // 17. 5-point story arc placement
  purpose: string;       // 18. Reason scene exists
  sceneType: 'Action' | 'Sequel' | 'Mixed' | ''; // 19. Action vs Reaction
  openingType: string;   // 20. Dialogue, Action, etc.
  entryHook: string;     // 21. Compelling start
  closingType: string;   // 22. Cliffhanger, etc.
  exitHook: string;      // 23. Compelling end
  tension: number;       // 24. 1-10 Scale
  pacing: number;        // 25. 1-10 Scale
  isFlashback: boolean;  // 26.
  backstory: 'None' | 'Low' | 'Moderate' | 'High'; // 27.
  revelation: string;    // 28. New Info
  plotPoint: string;     // 29. Inciting Incident, Midpoint, etc.
}

export interface CharacterSceneData {
  id: string;
  name: string;
  role: string;
  goal: string;       // External Driver
  motivation: string; // Internal Driver
  conflict: string;   // Obstacle
  climax: string;     // The moment of highest intensity
  outcome: string;    // Narrative Resolution
  arcStart?: string;  // Emotional Start State
  arcEnd?: string;    // Emotional End State
  motionAnalysis?: MotionAnalysis; // Physical Activity Tracking
}

export interface PovAnalysis {
  score: number; // 0-100 Consistency Score
  voiceType: string; // e.g. "Third Person Limited", "First Person"
  consistencyStatus: 'Consistent' | 'Minor Slips' | 'Head-Hopping Detected' | 'Uncertain';
  feedback: string;
  issues: {
    text: string;
    explanation: string;
  }[];
}

export interface RevisionSuggestion {
  id: string;
  original: string;
  replacement: string;
  category: 'Grammar' | 'Clarity' | 'Style' | 'Tone' | 'Conciseness' | 'Spelling' | 'Punctuation' | 'Semantics';
  explanation: string;
}

export interface ReadabilityMetrics {
  score: number; // 0-100 Smoothness Score
  gradeLevel: string;
  complexSentenceCount: number;
  avgSentenceLength: number;
  issues: {
    id: string;
    text: string;
    type: 'complexity' | 'phrasing';
    suggestion: string;
  }[];
}

export interface ReportResult {
  reportId: string;
  score?: number; // 0-100
  summary: string;
  highlights: {
    text: string;
    comment: string;
    type: 'critical' | 'warning' | 'info' | 'success';
  }[];
  stats?: { label: string; value: string | number }[];
  chartData?: { label: string; value: number }[];
}

export interface StickyNote {
  id: string;
  content: string;
  color: string; // hex or tailwind class
  x?: number;
  y?: number;
  rotation?: number;
}

export interface BinderItem {
  id: string;
  type: 'folder' | 'document';
  title: string;
  content?: string; // Only for documents
  children?: BinderItem[]; // Only for folders
  isOpen?: boolean; // UI state for folders
  isBookmarked?: boolean; // Bookmark status
  stickyNotes?: StickyNote[]; // Sticky notes associated with this item
  versions?: DocumentVersion[]; // Snapshots
  timelineData?: TimelineData;
  readability?: ReadabilityMetrics; // Cached metrics
  plotPoints?: Record<string, string>; // Map of ThreadID -> Content
  characterData?: CharacterSceneData[]; // Character Elements for this scene
  sceneMetadata?: SceneMetadata; // Story Mechanics & Narrative Arc
  sceneSetting?: SceneSetting; // World & Atmosphere
  povCharacterId?: string; // The ID of the character whose POV this scene is told from
  povAnalysis?: PovAnalysis; // AI Analysis of the narrative voice
  lastReport?: ReportResult; // Cache for the last run report
}

export interface BookDesign {
  id: string;
  name: string;
  description: string;
  previewColor: string;
  styles: {
    fontBody: string;
    fontHeading: string;
    paragraphIndent: boolean;
    paragraphSpacing: boolean;
    dropCap: boolean;
    justify: boolean;
    headingUppercase: boolean;
    fontSize: string;
  };
}

export interface WorkspaceTheme {
  id: string;
  name: string;
  background: string; // CSS value
  isDark: boolean;
}

export interface Project {
  id: string;
  title: string;
  author: string;
  lastModified: Date;
  wordCount: number;
  synopsis: string;
  coverStyle: {
    color: string;
    pattern?: 'plain' | 'gradient' | 'texture';
    font?: string;
  };
  isFavorite?: boolean;
}

export enum EditorTool {
  SELECT = 'select',
  TEXT = 'text',
  IMAGE = 'image',
  MAGIC = 'magic'
}

export interface AIResponse {
  text?: string;
  imageUrl?: string;
  error?: string;
}

export interface ChatMessage {
  id: string;
  role: 'user' | 'model';
  text: string;
  timestamp: Date;
}

export type FormatType = 
  | 'bold' 
  | 'italic' 
  | 'underline' 
  | 'strikeThrough'
  | 'subscript'
  | 'superscript'
  | 'justifyLeft' 
  | 'justifyCenter' 
  | 'justifyRight' 
  | 'insertOrderedList' 
  | 'insertUnorderedList' 
  | 'formatBlock'
  | 'fontName'
  | 'fontSize'
  | 'foreColor'
  | 'hiliteColor'
  | 'toggleInlineNote';

export interface ToolbarAction {
  icon: any;
  label: string;
  action: () => void;
  isActive?: boolean;
}
