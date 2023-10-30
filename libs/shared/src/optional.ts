export class Optional<T> {
  static empty<T>() {
    return new Optional<T>(null);
  }

  static of<T>(value: T | undefined | null) {
    return value !== undefined && value !== null
      ? new Optional(value)
      : Optional.empty<T>();
  }

  constructor(private readonly value: T | null | undefined) {}

  public get(): T {
    if (this.value === null || this.value === undefined) {
      throw new Error('Value is null or undefined');
    }

    return this.value;
  }

  public getOrNull(): T | null {
    if (this.value === null || this.value === undefined) {
      return null;
    }

    return this.value;
  }

  public map<U>(fn: (value: T) => U) {
    return this.isNull() ? Optional.empty<U>() : Optional.of<U>(fn(this.get()));
  }

  public asyncMap<U>(fn: (value: T) => Promise<Optional<U>>) {
    return new Promise<Optional<U>>((resolve, reject) => {
      if (this.isNull()) {
        return resolve(Optional.empty<U>());
      }
      fn(this.value as T).then(resolve, reject);
    });
  }

  public getOrElse(defaultValue: T): T {
    if (this.value === null || this.value === undefined) {
      return defaultValue;
    }

    return this.value;
  }

  public getOrThrow(error: Error = new Error('Empty Optional')): T {
    if (this.value === null || this.value === undefined) {
      throw error;
    }

    return this.value;
  }

  isNull() {
    return this.value === null || this.value === undefined;
  }
}
