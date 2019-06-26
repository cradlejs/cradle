export interface IConsole {
  error: (message?: any, ...optionalParams: any[]) => void
  log: (message?: any, ...optionalParams: any[]) => void
  info: (message?: any, ...optionalParams: any[]) => void
  warn: (message?: any, ...optionalParams: any[]) => void
  debug: (message?: any, ...optionalParams: any[]) => void
  trace: (message?: any, ...optionalParams: any[]) => void
}

export function isConsole(_testConsole: any): _testConsole is IConsole {
  return (
    'error' in _testConsole &&
    'log' in _testConsole &&
    'info' in _testConsole &&
    'warn' in _testConsole &&
    'trace' in _testConsole
  )
}
