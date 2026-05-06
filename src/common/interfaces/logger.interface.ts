export interface ILogger {
  addLog(
    action: string,
    entityType: string,
    entityId?: number,
    userId?: string,
    payload?: any,
  ): Promise<void>;
}
