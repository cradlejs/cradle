import { CradleModel } from './CradleModel'
import { CradleSchema } from './CradleSchema'
import { IConsole } from './IConsole'
import { ICradleLoader } from './ICradleLoader'
import { ICradleOperation } from './ICradleOperation'
import { ILoaderOptions, LoaderOptions } from './LoaderOptions'
import { PropertyType } from './PropertyTypes/PropertyType'

/**
 * The base class all loaders should inherit from
 */
export abstract class CradleLoaderBase<T> implements ICradleLoader {
  protected console?: IConsole
  protected options: T
  constructor(options: LoaderOptions) {
    this.options = options.options
    this.console = options.console
  }

  /**
   * Returns the name of all operations for a model
   * @param modelName Name of model to read operations from
   */
  public readModelOperationNames?(modelName: string): Promise<string[]>
  /**
   * Returns the operation definition for a given model and operation
   * @param modelName Name of model to read operation from
   * @param operationName Name of operation to read
   */
  public readModelOperation?(modelName: string, operationName: string): Promise<ICradleOperation>

  /**
   * Returns the PropertyType for a given model and property
   * @param modelName Name of model to read property type from
   * @param propertyName Name of property to read
   */
  public abstract readModelPropertyType(
    modelName: string,
    propertyName: string
  ): Promise<PropertyType>

  /**
   * Returns all model names
   */
  public abstract readModelNames(): Promise<string[]>

  /**
   * Returns a list of property names on a Model
   * @param modelName Name of model to read property names from
   */
  public abstract readModelPropertyNames(modelName: string): Promise<string[]>

  /**
   * Returns a key-value pair object with metadata information
   * @param modelName Name of model to read metadata for
   */
  public abstract readModelMetadata(modelName: string): Promise<object>

  /**
   * Optional method that can be called when a loader is loaded
   */
  public abstract prepareLoader?(): Promise<void>

  /**
   * Last call before a schema is finalized and sent to the emitter pipeline.
   * @param schema the cradle schema to be finalized
   */
  public finalizeSchema(schema: CradleSchema): Promise<CradleSchema> {
    return Promise.resolve(schema)
  }

  /**
   * Loads a schema from the loader
   */
  public async loadSchema(): Promise<CradleSchema> {
    const schema = {}
    const models: CradleModel[] = []

    const modelNames = await this.readModelNames()

    await Promise.all(
      modelNames.map(async (mn) => {
        schema[mn] = {
          meta: {},
          operations: {},
          properties: {}
        }
        const operationNames =
          (this.readModelOperationNames && (await this.readModelOperationNames(mn))) || []

        const propertyNames = await this.readModelPropertyNames(mn)
        await Promise.all(
          propertyNames.map(async (pn) => {
            const prop = await this.readModelPropertyType(mn, pn)
            schema[mn].properties[pn] = prop
          })
        )

        await Promise.all(
          operationNames.map(async (opName) => {
            const op = this.readModelOperation && (await this.readModelOperation(mn, opName))
            schema[mn].operations[opName] = op
          })
        )

        const meta = await this.readModelMetadata(mn)
        schema[mn].meta = meta
      })
    )

    modelNames.map((mn) => {
      models.push(
        new CradleModel(mn, schema[mn].properties, schema[mn].meta, schema[mn].operations)
      )
    })

    const finalSchema = new CradleSchema(models)

    return this.finalizeSchema(finalSchema)
  }
}
