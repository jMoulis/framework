import e from "express";
import { Subject, Subscription, filter } from "rxjs";

interface IEventType<T> {
  type: string;
  payload: T;
}
/**
 * Service for managing event subscriptions.
 */
class EventSubscriptionService {
  subscriptions: Map<Element, Set<Subscription>> = new Map();
  private eventSubject = new Subject<IEventType<any>>();

  /**
   * Registers a subscription for a specific element.
   * @param element - The element to register the subscription for.
   * @param subscription - The subscription to register.
   */
  register(element: Element, subscription: Subscription) {
    const existingSubscriptions = this.subscriptions.get(element) || new Set();
    existingSubscriptions.add(subscription);
    this.subscriptions.set(element, existingSubscriptions);
  }

  /**
   * Sends an event to all subscribed actions.
   * @param event - The event to send.
   */
  publish<T>(event: IEventType<T>) {
    console.log(event)
    this.eventSubject.next(event);
  }

  /**
   * Subscribes to events for a specific element element.
   * @param element - The element element to subscribe to.
   * @param action - The action to perform when an event is received.
   */
  subscribe<T>(element: Element, eventType: string, action: (event: IEventType<T>) => void): Subscription {
    const eventStream = this.eventSubject.pipe(
      filter(event => event.type === eventType)
    );
    const subscription = eventStream.subscribe(action);
    const existingSubscriptions = this.subscriptions.get(element) || new Set();
    existingSubscriptions.add(subscription);
    this.subscriptions.set(element, existingSubscriptions);
    return subscription;
  }

  /**
   * Cleans up all subscriptions for a specific element element.
   * @param element - The element element to clean up subscriptions for.
   */
  cleanup(element: Element) {
    const subscriptions = this.subscriptions.get(element);
    if (subscriptions) {
      subscriptions.forEach(sub => sub.unsubscribe());
      subscriptions.clear();
      this.subscriptions.delete(element);
    }
  }

  /**
   * Destroys the event subscription service, unsubscribing from all events and clearing all subscriptions.
   */
  destroy() {
    this.subscriptions.forEach(subs => subs.forEach(sub => sub.unsubscribe()));
    this.subscriptions.clear();
    this.eventSubject.complete();
  }
}
const eventService = new EventSubscriptionService();
export const publishEvent = eventService.publish.bind(eventService);
export const subscribeEvent = eventService.subscribe.bind(eventService);
export const cleanup = eventService.cleanup.bind(eventService);
export const register = eventService.register.bind(eventService);