export const events = {
  botReady: 'bot:ready',
  botClose: 'bot:close',
  commandExecuted: 'command:executed',
  commandFailed: 'command:failed',
} as const;

export type EventName = (typeof events)[keyof typeof events];
