// Reutilizaremos el EventBus de entries, lo dejamos por claridad si luego separas contextos
export interface EventBus {
  publish(
    events: Array<{
      eventName: string;
      aggregateId: string;
      occurredOn: Date;
      payload: Record<string, unknown>;
    }>
  ): Promise<void>;
}
