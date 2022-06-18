export interface HookResponder<T> {
  run(functions: any, args: T): void
}
