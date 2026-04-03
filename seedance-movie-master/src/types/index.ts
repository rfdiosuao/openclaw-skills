/**
 * Seedance 2.0 电影级漫剧生成大师 - 类型定义
 */

// ==================== 基础配置 ====================

export interface SeedanceConfig {
  apiKey: string;
  baseUrl?: string;
  defaultRatio?: VideoRatio;
  defaultDuration?: number;
}

export type VideoRatio = '16:9' | '9:16' | '1:1' | '4:3' | '3:4';

export type StoryType = '悬疑' | '武侠' | '奇幻' | '科幻' | '校园' | '爱情' | '冒险' | '恐怖';

export type ArtStyle = '赛博朋克' | '国漫' | '日系' | '美漫' | '写实' | '水墨' | '油画' | '低多边形';

// ==================== 6 阶权重提示词 ====================

export interface SixStagePrompt {
  /** Stage 1 [主体]: 核心角色/物体 (权重 1.5) */
  subject: string;
  /** Stage 2 [动作]: 具体行为/运动 (权重 1.3) */
  action: string;
  /** Stage 3 [场景]: 环境/背景 (权重 1.2) */
  scene: string;
  /** Stage 4 [镜头]: 视角/运镜 (权重 1.1) */
  camera: string;
  /** Stage 5 [光影]: 光线/色彩 (权重 1.0) */
  lighting: string;
  /** Stage 6 [风格]: 艺术风格 (权重 0.9) */
  style: string;
}

export interface WeightedPrompt {
  text: string;
  weight: number;
  stage: number;
}

// ==================== 故事规划 ====================

export interface StoryPlan {
  title: string;
  logline: string;
  type: StoryType;
  style: ArtStyle;
  episodes: number;
  durationPerEpisode: number;
  
  /** 三幕式结构 */
  structure: ThreeActStructure;
  
  /** 主要人物 */
  characters: CharacterDNA[];
  
  /** 世界观设定 */
  worldBuilding: WorldBuilding;
  
  /** 分集规划 */
  episodes_plan: EpisodePlan[];
}

export interface ThreeActStructure {
  act1_setup: {
    title: string;
    description: string;
    keyEvents: string[];
  };
  act2_confrontation: {
    title: string;
    description: string;
    keyEvents: string[];
  };
  act3_resolution: {
    title: string;
    description: string;
    keyEvents: string[];
  };
}

export interface WorldBuilding {
  era: string;
  location: string;
  rules: string[];
  technology: string;
  magic_system?: string;
  social_structure: string;
}

export interface EpisodePlan {
  episode: number;
  title: string;
  coreEvent: string;
  keyTwist: string;
  climax: string;
  duration: number;
}

// ==================== 角色 DNA ====================

export interface CharacterDNA {
  /** 角色名称 */
  name: string;
  
  /** 外貌特征（用于视觉一致性） */
  appearance: {
    age: string;
    gender: string;
    height: string;
    bodyType: string;
    facialFeatures: string;
    hairstyle: string;
    eyeColor: string;
    skinTone: string;
    distinctiveMarks: string[];
  };
  
  /** 服装造型 */
  costume: {
    main: string;
    accessories: string[];
    colorScheme: string[];
    style: string;
  };
  
  /** 性格特点 */
  personality: string[];
  
  /** 能力/技能 */
  abilities: string[];
  
  /** 背景故事 */
  backstory: string;
  
  /** 角色弧光 */
  characterArc: string;
  
  /** 标志性动作/表情 */
  signatureMoves: string[];
  
  /** 参考图提示词（用于生成一致性角色） */
  referencePrompts: string[];
  
  /** DNA 锁定关键词（用于@标签引用） */
  dnaKeywords: string[];
}

// ==================== 分镜设计 ====================

export interface Storyboard {
  title: string;
  scenes: Scene[];
  totalShots: number;
  estimatedDuration: number;
}

export interface Scene {
  sceneNumber: number;
  location: string;
  time: string;
  description: string;
  shots: Shot[];
}

export interface Shot {
  shotNumber: number;
  type: ShotType;
  angle: CameraAngle;
  movement: CameraMovement;
  duration: number;
  description: string;
  characters: string[];
  action: string;
  dialogue?: string;
  soundEffects: string[];
  lighting: string;
  prompt: SixStagePrompt;
  referenceImages?: string[];
}

export type ShotType = '极远景' | '远景' | '全景' | '中景' | '近景' | '特写' | '极特写';

export type CameraAngle = '平视' | '俯视' | '仰视' | '荷兰角' | '过肩' | 'POV';

export type CameraMovement = '固定' | '推' | '拉' | '摇' | '移' | '跟' | '升' | '降' | '旋转';

// ==================== 视频生成 ====================

export interface GenerateOptions {
  prompt: string | SixStagePrompt;
  referenceImages?: string[];
  referenceVideo?: string;
  referenceAudio?: string;
  ratio?: VideoRatio;
  duration?: number;
  generateAudio?: boolean;
  watermark?: boolean;
  
  /** 角色 DNA 锁定 */
  characterDNA?: CharacterDNA[];
  
  /** 分镜信息 */
  storyboard?: Storyboard;
  
  /** 时间线拆解 */
  timeline?: TimelineSegment[];
}

export interface TimelineSegment {
  startTime: number;
  endTime: number;
  description: string;
  prompt: SixStagePrompt;
  soundLayers?: SoundLayer[];
}

export interface SoundLayer {
  type: 'dialogue' | 'sfx' | 'bgm' | 'ambience' | 'foley';
  description: string;
  startTime: number;
  endTime: number;
  volume?: number;
}

export interface GenerationTask {
  taskId: string;
  status: 'pending' | 'processing' | 'completed' | 'failed';
  videoUrl?: string;
  audioUrl?: string;
  thumbnailUrl?: string;
  error?: string;
  metadata?: GenerationMetadata;
}

export interface GenerationMetadata {
  model: string;
  ratio: string;
  duration: number;
  resolution: string;
  fps: number;
  createdAt: string;
  processingTime: number;
}

// ==================== 项目完整方案 ====================

export interface ProjectPlan {
  story: StoryPlan;
  characters: CharacterDNA[];
  storyboard: Storyboard;
  prompts: {
    perShot: Record<string, string>;
    combined: string;
  };
  production: {
    estimatedCost: number;
    estimatedTime: number;
    requiredAssets: string[];
  };
  deliverables: {
    videos: string[];
    audio: string[];
    documents: string[];
  };
}

// ==================== API 响应 ====================

export interface SeedanceAPIResponse {
  id?: string;
  task_id?: string;
  status?: string;
  video_url?: string;
  audio_url?: string;
  error?: {
    code: string;
    message: string;
  };
}

// ==================== 命令参数 ====================

export interface StoryCommandArgs {
  theme: string;
  type?: StoryType;
  style?: ArtStyle;
  episodes?: number;
  duration?: number;
}

export interface CharacterCommandArgs {
  name: string;
  age?: string;
  gender?: string;
  role?: string;
  personality?: string[];
  abilities?: string[];
  backstory?: string;
}

export interface StoryboardCommandArgs {
  script: string;
  scenes?: number;
  style?: ArtStyle;
}

export interface PromptCommandArgs {
  description: string;
  shotType?: ShotType;
  cameraAngle?: CameraAngle;
  cameraMovement?: CameraMovement;
}

export interface GenerateCommandArgs {
  prompt: string;
  images?: string[];
  video?: string;
  audio?: string;
  ratio?: VideoRatio;
  duration?: number;
  generateAudio?: boolean;
  watermark?: boolean;
}

export interface ProjectCommandArgs {
  concept: string;
  type?: StoryType;
  style?: ArtStyle;
  episodes?: number;
  duration?: number;
}
