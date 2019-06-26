import fs, { readFileSync } from 'fs'
import path from 'path'
import { CradleConfig, ICradleConfig } from '../../lib/CradleConfig'
import { safeLoad } from 'js-yaml'

/**
 * Loads a cradle configuration from the given path
 * @param configFile Path to a cradle.yml file. Defaults to *./cradle.yml*
 */
export async function loadConfiguration(
  configFile: string = './cradle.yml'
): Promise<CradleConfig> {
  const finalPath = path.join(process.cwd(), configFile)
  if (fs.existsSync(finalPath)) {
    try {
      const cradleConfigContents = readFileSync(finalPath, 'utf8')

      const cradleConfigStruct: ICradleConfig = safeLoad(cradleConfigContents)
      if (!isConfigurationValid) {
        //TODO: let's add a link to cradle documentation here, pointing to a valid config file
        throw new Error(`A cradle configuration must define a loader and at least one emitter`)
      } else {
        return new CradleConfig(
          cradleConfigStruct.loader,
          cradleConfigStruct.emitters,
          cradleConfigStruct.defaultOptions
        )
      }
    } catch (err) {
      console.log(err)
      throw err
    }
  } else {
    throw new Error('Cradle config file not found')
  }
}

function isConfigurationValid(config: any): Boolean {
  return config.loader && config.emitters && config.emitters.length > 0
}
