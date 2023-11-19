// Enumeration representing different environment modes: Development and Production
export enum Env {
    Dev, // Development environment
    Prod // Production environment
}

// Base URL for API endpoints
export const API_BASE_URL: string = "https://api.example.com";

// Maximum number of retries for API requests
export const MAX_RETRIES: number = 3;
// DatabaseHost - the hostname of the RethinkDB server
export const DatabaseHost = '192.168.1.1';
// DatabasePort - the port number of the RethinkDB server
export const DatabasePort = 28015;
// DatabaseForceDrop - indicates whether the database should be forcefully dropped (true/false)
export const DatabaseForceDrop = false;

function getEnvVar(key: string): string {
    const value = process.env[key];
    if (value === undefined) {
        throw new Error(`Environment variable ${key} is not set`);
    }
    return value;
}

export interface ProcessEnv {
    LLM_GATWAY_HOST: string;
    LLM_GATWAY_PORT: string;
    LLM_GATWAY_AUTH_TOKEN: string;
    DEV_LLM_GATWAY_HOST: string;
    DEV_LLM_GATWAY_PORT: string;
    DEV_LLM_GATWAY_AUTH_TOKEN: string;
}

export const dotEnv: ProcessEnv = {
    LLM_GATWAY_HOST: getEnvVar('LLM_GATWAY_HOST'),
    LLM_GATWAY_PORT: getEnvVar('LLM_GATWAY_PORT'),
    LLM_GATWAY_AUTH_TOKEN: getEnvVar('LLM_GATWAY_AUTH_TOKEN'),
    DEV_LLM_GATWAY_HOST: getEnvVar('DEV_LLM_GATWAY_HOST'),
    DEV_LLM_GATWAY_PORT: getEnvVar('DEV_LLM_GATWAY_PORT'),
    DEV_LLM_GATWAY_AUTH_TOKEN: getEnvVar('DEV_LLM_GATWAY_AUTH_TOKEN')
};