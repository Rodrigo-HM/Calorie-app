export type DomainEvent = { eventName: string; aggregateId: string; occurredOn: Date; payload: Record<string, unknown>; };

export interface DomainEventHandler<E extends DomainEvent = DomainEvent> {
  eventName(): string;
  handle(event: E): Promise<void>;
}

export interface EventBus {
  register(handler: DomainEventHandler): void;
  publish(events: DomainEvent[]): Promise<void>;
}

export class InMemoryEventBus implements EventBus {
  private handlers = new Map<string, DomainEventHandler[]>();

  register(handler: DomainEventHandler): void {
    const name = handler.eventName();
    const list = this.handlers.get(name) ?? [];
    this.handlers.set(name, [...list, handler]);
  }

  async publish(events: DomainEvent[]): Promise<void> {
    for (const ev of events) {
      const list = this.handlers.get(ev.eventName) ?? [];
      for (const h of list) {
        await h.handle(ev);
      }
    }
  }
}
