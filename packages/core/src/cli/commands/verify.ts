import colors from 'colors'
import { getLoader } from '../../lib/CradleUtils'
import { loadConfiguration } from '../utils/config'

/**
 * Loads a schema using the specified loader.  Used to verify loader configuration.
 * @param configFilePath Path to cradle configuration.
 */
async function verify(configFilePath: string) {
  try {
    const configuration = await loadConfiguration(configFilePath)
    if (configuration) {
      const loader = await getLoader(configuration.Loader)
      const schema = await loader.loadSchema()
      console.log(colors.yellow(JSON.stringify(schema, null, 2)))
      console.log(colors.green(`Schema verified`))
    }
  } catch (err) {
    console.log(colors.red(err.message))
    process.exit(1)
  }
}

/** @ignore */
export const command = 'verify [config]'

/** @ignore */
export const desc = 'Verifies a cradle schema based on the configuration'

/** @ignore */
export const builder = {
  config: {
    alias: ['c'],
    default: './cradle.yml',
    demandOption: false,
    describe: 'path to a cradle config file'
  }
}
/** @ignore */
export async function handler(argv) {
  return verify(argv.config)
}
