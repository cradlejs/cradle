export class InvalidConsoleError extends Error {
  constructor(arg: any) {
    super(`Expected an object that implements IConsole, received a ${typeof arg}`)
  }
}
