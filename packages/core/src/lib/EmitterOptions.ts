export class EmitterOptionsArgs {
  exclude?: string[]
  overwrite?: boolean | { [key: string]: boolean }
  afterEmitCommand?: string
}
