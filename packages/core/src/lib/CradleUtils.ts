import { EmitterDefinition } from './EmitterConfiguration'

import { EmitterOptionsArgs } from './EmitterOptions'
import { ICradleEmitter, ICradleEmitterConstructable } from './ICradleEmitter'
import { ICradleLoader, ICradleLoaderConstructable } from './ICradleLoader'
import { ILoaderOptions } from './LoaderOptions'
import {
  CradleSchema,
  CradleModel,
  PropertyType,
  PropertyTypes,
  ArrayPropertyType,
  ReferenceModelType,
  ImportModelType,
  ICradleOperation
} from '..'

const handler = {
  construct() {
    return handler
  }
}

/**
 * Returns true if a method is a constructor
 */
const isConstructor = (x) => {
  try {
    return !!new new Proxy(x, handler)()
  } catch (e) {
    return false
  }
}

/**
 * Loads the specified loader from node_modules.  Once the loader module is found
 * and loaded, prepareLoader will be called on it.
 * @param options Options to specify the loader to use
 */
export async function getLoader(options: ILoaderOptions): Promise<ICradleLoader> {
  let loader!: ICradleLoader
  if (typeof options.module === 'string') {
    try {
      const loaderDefRef: any = require(options.module)
      const loaderDef: ICradleLoaderConstructable = loaderDefRef.default
        ? loaderDefRef.default
        : loaderDefRef
      try {
        loader = new loaderDef(options)
      } catch (err) {
        return Promise.reject(
          `${options.module} module was found but a valid ICradleLoader is not the default export`
        )
      }
    } catch (err) {
      return Promise.reject(err)
    }
  } else {
    loader = options.module
  }
  if (loader.prepareLoader) {
    await loader.prepareLoader()
  }

  return loader
}

/**
 * Loads the specified emitter from node_modules.  Once the emitter module is found
 * and loaded, prepareEmitter will be called on it.
 * @param options Options specific to this emitter
 * @param baseOptions Global options to that will be merged with local options
 */
export async function getEmitter(
  options: EmitterDefinition,
  baseOptions: EmitterOptionsArgs = {}
): Promise<ICradleEmitter> {
  let emitter: ICradleEmitter

  if (!options.module) {
    throw new Error(
      `Expected an instance of IEmitterOptions, got: { ${Object.keys(options).join(', ')} }`
    )
  }
  if (typeof options.module === 'string') {
    if (!options.console) {
      throw new Error('You must pass a console argument if you are passing a module name')
    }

    try {
      let EmitterDef: ICradleEmitterConstructable | any = require(options.module)
      if (!isConstructor(EmitterDef)) {
        EmitterDef = EmitterDef.default
      }

      try {
        emitter = new EmitterDef(options.options, options.output, options.console!)
      } catch (err) {
        console.error(err)
        return Promise.reject(
          `${options.module} module was found but a valid ICradleEmitter is not the default export `
        )
      }
    } catch (err) {
      console.error(err)
      err.message = `Error loading ${options.module}: ${err.message}`
      return Promise.reject(err)
    }
  } else {
    emitter = options.module
  }
  if (emitter.prepareEmitter) {
    await emitter.prepareEmitter()
  }

  return emitter
}

/**
 * Removes all records of any excluded Models, Operations, or Properties.  This allows
 * emitters to not worry about exclusions.
 * @param schema - The cradle schema loaded from the provided cradle configuration
 * @param options
 */
export function applyExclusionsToSchema(
  schema: CradleSchema,
  options: EmitterOptionsArgs
): CradleSchema {
  let newSchema: CradleSchema = Object.assign(Object.create(Object.getPrototypeOf(schema)), schema)
  const excludes = options.exclude || []
  excludes.forEach((exclude) => {
    const excludeParts = exclude.split('.')
    const modelName = excludeParts[0]
    const model = newSchema.GetModel(modelName)
    if (model) {
      const modelIndex = newSchema.Models.findIndex((m) => m.Name === modelName)

      switch (excludeParts.length) {
        case 1: {
          // Remove all references to this model
          newSchema = removeModelReferencesFromSchema(newSchema, model)
        }
        case 2: {
          // Remove all properties or operations
          const refType = excludeParts[1]
          if (refType === 'Operations') {
            const opNames = Object.keys(model.Operations)
            opNames.forEach((opName) => {
              newSchema = removeOperationFromSchema(newSchema, model, opName)
            })
          }
          if (refType === 'Properties') {
            const propNames = Object.keys(model.Properties)
            propNames.forEach((propName) => {
              newSchema = removePropertyReferencesFromSchema(newSchema, model, propName)
            })
          }
        }
        case 3: {
          // Remove a property or operation
          const refType = excludeParts[1]
          if (refType === 'Operations') {
            const opName = excludeParts[2]
            newSchema = removeOperationFromSchema(newSchema, model, opName)
          }
          if (refType === 'Properties') {
            const propName = excludeParts[2]
            newSchema = removePropertyReferencesFromSchema(newSchema, model, propName)
          }
        }
      }
    }
  })
  return newSchema
}

function removeModelReferencesFromSchema(schema: CradleSchema, model: CradleModel) {
  let modelIndex = -1

  schema.Models.forEach((modelRef, index) => {
    if (modelRef.Name === model.Name) {
      modelIndex = index
    } else {
      const propertyNames = Object.keys(modelRef.Properties)
      propertyNames.forEach((propName, propIndex) => {
        const propRef = modelRef.Properties[propName]
        if (doesPropertyReferenceModel(propRef, model)) {
          delete schema.Models[index].Properties[propName]
        }
      })

      const operationNames = Object.keys(modelRef.Operations)
      operationNames.forEach((opName) => {
        const opRef = modelRef.Operations[opName]
        if (doesOperationReferenceModel(opRef, model)) {
          delete schema.Models[index].Operations[opName]
        }
      })
    }
  })
  if (modelIndex > -1) {
    schema.Models.splice(modelIndex, 1)
  }
  return schema
}

function removePropertyReferencesFromSchema(
  schema: CradleSchema,
  model: CradleModel,
  propertyName: string
) {
  schema.Models.forEach((modelRef, modelIndex) => {
    const propertyNames = Object.keys(modelRef.Properties)
    propertyNames.forEach((propName, propIndex) => {
      const propRef = modelRef.Properties[propName]
      if (doesPropertyReferenceProperty(propRef, model, propertyName)) {
        delete schema.Models[modelIndex].Properties[propName]
      }
    })

    if (modelRef.Name === model.Name) {
      delete schema.Models[modelIndex].Properties[propertyName]
    }
  })

  return schema
}

function removeOperationFromSchema(
  schema: CradleSchema,
  model: CradleModel,
  operationName: string
) {
  schema.Models.forEach((modelRef, modelIndex) => {
    if (modelRef.Name === model.Name) {
      delete schema.Models[modelIndex].Operations[operationName]
    }
  })
  return schema
}

function doesPropertyReferenceProperty(
  propRef: PropertyType,
  otherModel: CradleModel,
  otherPropertyName: string
) {
  if (propRef.TypeName === PropertyTypes.Array) {
    const propInstance = propRef as ArrayPropertyType
    if (typeof propInstance.MemberType === 'object') {
      propRef = propInstance.MemberType as PropertyType
    }
  }

  if (propRef.TypeName === PropertyTypes.ReferenceModel) {
    const propInstance = propRef as ReferenceModelType
    if (
      propInstance.ModelName === otherModel.Name &&
      propInstance.ForeignProperty === otherPropertyName
    ) {
      return true
    }
  }
}

function doesPropertyReferenceModel(propRef: PropertyType, model: CradleModel) {
  if (propRef.TypeName === PropertyTypes.Array) {
    const propInstance = propRef as ArrayPropertyType
    if (typeof propInstance.MemberType === 'object') {
      propRef = propInstance.MemberType as PropertyType
    }
  }
  if (propRef.TypeName === PropertyTypes.ImportModel) {
    const propInstance = propRef as ImportModelType
    if (propInstance.ModelName === model.Name) {
      return true
    }
  }
  if (propRef.TypeName === PropertyTypes.ReferenceModel) {
    const propInstance = propRef as ReferenceModelType
    if (propInstance.ModelName === model.Name) {
      return true
    }
  }
  return false
}

function doesOperationReferenceModel(opRef: ICradleOperation, model: CradleModel) {
  const opArgs: PropertyType[] = Object.values(opRef.Arguments)
  return (
    opArgs.some((propRef) => doesPropertyReferenceModel(propRef, model)) ||
    doesPropertyReferenceModel(opRef.Returns, model)
  )
}
