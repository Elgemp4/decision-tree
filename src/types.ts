export interface PromptNode {
  id: string;
  title: string;
  prompt: string;
  allowedFunctions: string[];
  useSTT: boolean;
}

export interface Link {
  next_step: string;
  condition?: string;
}

export interface YAMLScript {
  [key: string]: {
    prompt: string;
    allowed_functions?: Record<string, string>;
    use_stt: boolean;
    links: Link[];
  };
}

export interface YAMLData {
  system_prompt?: string;
  initial_step: string;
  script: YAMLScript;
}