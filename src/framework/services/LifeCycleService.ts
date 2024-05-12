import * as EventSubscriptionService from "./EventSubscriptionService";

/**
 * Represents a set of callback functions for mutation events.
 */
export interface MutationEventCallbacks {
  /**
   * Callback function triggered when children are added to an element.
   * @param nodes - The added nodes.
   */
  onChildrenAdded?: (nodes: NodeList) => void;

  /**
   * Callback function triggered when children are removed from an element.
   * @param nodes - The removed nodes.
   */
  onChildrenRemoved?: (nodes: NodeList) => void;

  /**
   * Callback function triggered when an attribute of an element changes.
   * @param element - The element whose attribute has changed.
   * @param attributeName - The name of the attribute that has changed.
   * @param hasChanged - Indicates whether the attribute value has changed.
   * @param values - Object containing the previous and new values of the attribute.
   *   - previousValue: The previous value of the attribute.
   *   - newValue: The new value of the attribute.
   */
  onAttributeChange?: (element: HTMLElement, attributeName: string | null, hasChanged: boolean, values: {
    previousValue: string | null,
    newValue: string | null
  }) => void;
}

/**
 * Represents a service that manages the lifecycle of elements and provides various event callbacks.
 */
class LifeCycleService {
  subscriptions: Map<HTMLElement, Set<IntersectionObserver | MutationObserver>> = new Map();
  cleanupFunctions: Map<Element, Function[]> = new Map();

  constructor() {
    this.setupGlobalObserver();
  }
  /**
 * Sets up a global observer to monitor changes in the DOM and perform cleanup operations
 * when an HTMLElement is removed from the document body.
 */
  private setupGlobalObserver() {
    const observer = new MutationObserver(mutations => {
      mutations.forEach(mutation => {
        if (mutation.removedNodes?.length) {
          this.bulkCleanup(mutation.removedNodes);
        }
      });
    });
    observer.observe(document.body, { childList: true, subtree: true });
  }
  private flattenNodes(nodes: Node[]): Node[] {
    return nodes.reduce((acc, node) => {
      if (node instanceof Element) {
        acc.push(node);
        acc.push(...this.flattenNodes(Array.from(node.children)));
      }
      return acc;
    }, [] as Node[]);
  }

  /**
   * Adds an observer to the subscription list for the specified element.
   * @param element - The element to subscribe to.
   * @param observer - The observer to add to the subscription list.
   */
  addToSubscription(element: HTMLElement, observer: IntersectionObserver | MutationObserver) {
    const existingObservers = this.subscriptions.get(element) || new Set();
    existingObservers.add(observer);
    this.subscriptions.set(element, existingObservers);
  }
  /**
   * Determines whether the element should be updated based on the given mutations.
   * @param element - The element to check for updates.
   * @param mutations - An array of MutationRecord objects representing the mutations observed by the MutationObserver.
   * @returns A boolean value indicating whether the element should be updated.
   */
  private shouldUpdate(element: HTMLElement, mutations: MutationRecord[]): boolean {
    return mutations.some(mutation => {
      if (mutation.type === 'attributes') {
        const oldValue = mutation.oldValue;
        const newValue = element.getAttribute(mutation.attributeName || '');
        return oldValue !== newValue;
      }
      if (mutation.type === 'childList' && mutation.addedNodes.length > 0) {
        return true;
      }
      if (mutation.type === 'childList' && mutation.removedNodes.length > 0) {
        this.bulkCleanup(mutation.removedNodes);
        return true;
      }
      return false;
    });
  }
  /**
   * Processes a mutation record and triggers the corresponding callbacks based on the mutation type.
   * @param mutation - The mutation record to process.
   * @param callbacks - Optional callbacks object containing event handlers for different mutation types.
   */
  private processMutation(mutation: MutationRecord, callbacks?: MutationEventCallbacks) {
    switch (mutation.type) {
      case 'childList':
        if (mutation.addedNodes.length > 0 && callbacks?.onChildrenAdded) {
          callbacks.onChildrenAdded(mutation.addedNodes);
        }
        if (mutation.removedNodes.length > 0) {
          ;
          if (callbacks?.onChildrenRemoved) {
            callbacks.onChildrenRemoved(mutation.removedNodes);
          }
        }
        break;
      case 'attributes':
        const oldValue = mutation.oldValue;
        const newValue = (mutation.target as HTMLElement).getAttribute(mutation.attributeName || '');
        const hasChanged = oldValue !== newValue;
        if (hasChanged && callbacks?.onAttributeChange) {
          callbacks.onAttributeChange(mutation.target as HTMLElement, mutation.attributeName, hasChanged, {
            previousValue: oldValue,
            newValue,
          });
        }
        break;
    }
  }

  private bulkCleanup(nodes: NodeList | HTMLElement[]) {
    const allNodes = this.flattenNodes(Array.from(nodes)) as HTMLElement[];
    allNodes.forEach(node => {
      if (node instanceof HTMLElement) {
        this.internalGlobalElementCleanup(node);
      }
    })
    nodes.forEach(node => {
      if (node instanceof HTMLElement) {
        this.internalGlobalElementCleanup(node);
      }
    });
  }
  /**
 * Cleans up internal resources associated with the specified element.
 * @param element - The element for which to perform the cleanup.
 */
  private internalGlobalElementCleanup(element: HTMLElement) {
    const observers = this.subscriptions.get(element);
    observers?.forEach(observer => observer.disconnect());
    this.subscriptions.delete(element);
    this.executeDeveloperCleanup(element);
    EventSubscriptionService.cleanup(element);
  }
  /**
   * Adds a cleanup function for the specified element.
   * @param element - The HTML element to associate the cleanup function with.
   * @param cleanupFunc - The cleanup function to be called when the element is cleaned up.
   */
  private addCleanupFunction(element: HTMLElement, cleanupFunc: Function) {
    const existingCleanups = this.cleanupFunctions.get(element) || [];
    existingCleanups.push(cleanupFunc);
    this.cleanupFunctions.set(element, existingCleanups);
  }
  /**
   * Executes the cleanup functions associated with the specified element.
   * @param element - The HTML element for which to execute the cleanup functions.
   */
  private executeDeveloperCleanup(element: HTMLElement) {
    const cleanups = this.cleanupFunctions.get(element);
    cleanups?.forEach(cleanup => cleanup());
    this.cleanupFunctions.delete(element);
  }
  /**
   * Disconnects the given observer and removes it from the subscriptions map if necessary.
   * @param element - The HTML element associated with the observer.
   * @param observer - The observer to be cleaned up.
   */
  private cleanupObserver(element: HTMLElement, observer: IntersectionObserver | MutationObserver) {
    observer.disconnect();
    const observers = this.subscriptions.get(element);
    if (observers) {
      observers.delete(observer);
      if (observers.size === 0) {
        this.subscriptions.delete(element);
      }
    }
  }
  /**
   * Observes mutations on the specified element and triggers the provided callbacks when mutations occur.
   * @param element - The element to observe for mutations.
   * @param config - Optional configuration options for the MutationObserver.
   * @param callbacks - Optional callbacks to be executed when mutations occur.
   * @param options - Optional configuration options for the observer.
   *  - disconnectOnMatch: Indicates whether the observer should be disconnected after a matching mutation is found.
   * - filter: A filter function to determine whether a mutation should trigger an update.
   */
  onUpdate(element: HTMLElement, config?: MutationObserverInit, callbacks?: MutationEventCallbacks, options?: { disconnectOnMatch?: boolean, filter?: (mutation: MutationRecord) => boolean }) {
    const observer = new MutationObserver((mutations, mutationObserver) => {

      if (this.shouldUpdate(element, mutations)) {
        mutations.forEach(mutation => {
          this.processMutation(mutation, callbacks);
        });

        if (options?.disconnectOnMatch && mutations.some(m => options.filter && options.filter(m))) {
          this.cleanupObserver(element, mutationObserver);
        }
      }
    });
    observer.observe(element, config);
    this.addToSubscription(element, observer);
  }
  /**
   * Attaches an IntersectionObserver to the specified element and invokes the provided callback
   * when the element becomes visible in the viewport.
   *
   * @param element - The element to observe.
   * @param onVisible - The callback function to be invoked when the element becomes visible.
   * @param options - Optional configuration for the IntersectionObserver.
   * @param autoUnobserve - Indicates whether the observer should be disconnected after the element becomes visible.
   */
  onMount(element: HTMLElement, onVisible: (element: HTMLElement) => void, options?: IntersectionObserverInit, autoUnobserve = true) {
    const observer = new IntersectionObserver((entries, intersectionObserver) => {
      entries.forEach((entry) => {
        if (entry.isIntersecting) {
          const target = entry.target as HTMLElement;
          const cleanup = onVisible(target);
          if (typeof cleanup === 'function') {
            this.addCleanupFunction(target, cleanup);
          }
          if (autoUnobserve) {
            observer.unobserve(entry.target);
            this.cleanupObserver(entry.target as HTMLElement, observer);
          }
          intersectionObserver.disconnect();
        }
      });
    }, options);
    observer.observe(element);
    this.addToSubscription(element, observer);
  }

}

const lifecycle = new LifeCycleService();

export const onMount = lifecycle.onMount.bind(lifecycle);
export const onUpdate = lifecycle.onUpdate.bind(lifecycle);