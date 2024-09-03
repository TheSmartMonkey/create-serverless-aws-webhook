// Secret environment type containing protected environment variables
export type SecretEnv = {
  SSM_EXAMPLE: string;
};

// Type for environment variables in .env file
export type DotEnv = {
  MONGODB_URL: string;
};

// Type for environment variables stored in SSM (using Config.Secret)
export type SsmEnv = {
  // [K in keyof SecretEnv]: Config.Secret;
};

// Type combining both SSM and DotEnv environments
export type Env = DotEnv & SecretEnv;
