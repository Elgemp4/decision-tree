import { parse } from "yaml";

export interface FunctionConfig {
  allowed_functions: Record<string, string>;
}

export async function loadFunctionConfig(): Promise<FunctionConfig> {
  try {
    const response = await fetch("/functions.yaml");
    if (!response.ok) {
      throw new Error("Failed to load function configuration");
    }
    const yamlText = await response.text();
    return parse(yamlText) as FunctionConfig;
  } catch (error) {
    console.error("Error loading function configuration:", error);
    return { allowed_functions: {} };
  }
}
