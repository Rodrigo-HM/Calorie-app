export type DomainEvent = {
  eventName: string;
  aggregateId: string;
  occurredOn: Date;
  payload: Record<string, unknown>;
};