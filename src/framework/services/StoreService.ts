import { BehaviorSubject, Subscription } from "rxjs";

/**
 * Service for managing state using BehaviorSubject.
 */
class StoreService {
  /**
   * Creates a new BehaviorSubject with the initial state and returns a tuple containing the subscribe function, the update function, and the BehaviorSubject.
   *
   * @param initialState - The initial state for the BehaviorSubject.
   * @returns A tuple containing the subscribe function, the update function, and the BehaviorSubject.
   */
  useData<T>(initialState: T): [(callback: (value: T) => void) => () => void, (updateFn: (state: T) => T) => void, BehaviorSubject<T>] {
    const subject = new BehaviorSubject<T>(initialState);

    const subscribe = (callback: (value: T) => void) => {
      const subscription = subject.subscribe(callback);
      return subscription.unsubscribe;
    };

    const updateState = (updateFn: (prevValue: T) => T) => {
      const prevValue = subject.getValue();
      const newValue = updateFn(prevValue);
      subject.next(newValue);
    };
    return [subscribe, updateState, subject];
  }
  createStore<T>(initialState: T): [(callback: (value: T) => void) => () => void, (updateFn: (state: T) => T) => void, BehaviorSubject<T>] {
    return this.useData(initialState);
  }
}

const storeService = new StoreService();

/**
 * Binds the `useData` method of the `storeService` object.
 *
 * @returns The bound `useData` method.
 */
export const useData = storeService.useData.bind(storeService);
export const createStore = storeService.useData.bind(storeService);