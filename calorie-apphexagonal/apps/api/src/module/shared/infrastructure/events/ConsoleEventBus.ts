import type { EventBus } from '../../../entries/aplication/ports/EventBus';
import type { DomainEvent } from '../../../entries/domain/events/DomainEvent';

export class ConsoleEventBus implements EventBus {
  async publish(events: DomainEvent[]): Promise<void> {
    for (const ev of events) {
      // eslint-disable-next-line no-console
      console.log('[EVENT]', ev.eventName, {
        aggregateId: ev.aggregateId,
        payload: ev.payload,
      });
    }
  }
}
