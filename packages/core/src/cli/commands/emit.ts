import colors from 'colors'
import { getEmitter, getLoader, applyExclusionsToSchema } from '../../lib/CradleUtils'
import { loadConfiguration } from '../utils/config'
import { EmitterDefinition } from '../../lib/EmitterConfiguration'
import { execSync } from 'child_process'

/**
 * Loads a schema using the specified loader, then invokes the specified emitter, or all emitters
 * if none are specified.
 * @param configFilePath Path to cradle configuration.
 * @param emitterName Emitter to invoke.  If not provided, all emitters will be invoked.
 */
async function emit(configFilePath: string, emitterName?: string) {
  try {
    const configuration = await loadConfiguration(configFilePath)
    if (configuration) {
      const loader = await getLoader(configuration.Loader)

      const schema = await loader.loadSchema()

      let emitters: EmitterDefinition[] = []
      if (emitterName) {
        if (configuration.Emitters[emitterName]) {
          emitters.push(configuration.Emitters[emitterName])
        }
      } else {
        const emitterNames = Object.keys(configuration.Emitters)
        emitters = emitterNames.map((en) => configuration.Emitters[en])
      }

      await Promise.all(
        emitters.map(async (em) => {
          em.console = console
          const emitter = await getEmitter(em)
          const finalSchema = applyExclusionsToSchema(schema, em.options)

          await emitter.emitSchema(finalSchema)
          if (emitter.options.afterEmitCommand) {
            execSync(emitter.options.afterEmitCommand, { stdio: 'inherit' })
          }
        })
      )
    }
  } catch (err) {
    console.log(colors.red(err.message))
    console.log(colors.yellow(err.stack))
    process.exit(1)
  }
}

/**
 * @ignore
 */
export async function handler(argv) {
  return emit(argv.config, argv.emit)
}

/**
 * @ignore
 */
export const command = 'emit [config]'

/**
 * @ignore
 */
export const desc = 'Loads a Cradle schema and writes it out using emitters'

/**
 * @ignore
 */
export const builder = {
  config: {
    alias: ['c'],
    default: './cradle.yml',
    demandOption: false,
    describe: 'path to a cradle config file'
  },
  emit: {
    alias: ['e'],
    demandOption: false,
    describe: 'emitter configuration name or * for all'
  }
}
