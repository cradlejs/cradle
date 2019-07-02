# Cradle - A Schema Pipeline [![Build Status](https://dev.azure.com/gatewayapps/cradlejs/_apis/build/status/cradlejs.cradle?branchName=master)](https://dev.azure.com/gatewayapps/cradlejs/_build/latest?definitionId=46&branchName=master)

## What is Cradle?

Cradle is a tool for loading data models from one place and emitting it to another. This can be leveraged to eliminate the manual creation of redundant and tedious code within your project/application. We provide the ability to create specs that can, in turn, be executed against emitters with the output resulting in the code you wish to use.

[Getting Started](#getting-started)  
[The Cradle CLI](#the-cradle-cli)  
[Loaders](#cradle-loader-api)  
[Emitters](#cradle-emitter-api)

## Getting Started

To get started, first install Cradle in your local project folder:
`npm i --save-dev @cradlejs/core`

## The Cradle Flow

Cradle was built to load a schema from any source via CradleLoaders and emit to any destination via CradleEmitters.

When you execute `npx cradle emit`, it will load your schema, then send it to each of your configured emitters. We have developed a few emitters for you to use (@cradlejs/template-emitter and @cradlejs/react-emitter), but the API is simple to understand and implement.

## Cradle Loader API

If you want to develop a custom Cradle Loader, (for instance, loading from Postgres or Mongo), all you have to do is implement ICradleLoader in a npm module.

```
    prepareLoader: (options: {[key: string]: any}, console: IConsole) => Promise < void >
    readModelNames: () => Promise < string[] >
    readModelPropertyNames: (modelName: string) => Promise < string[] >
    readModelPropertyType: (modelName: string, propertyName: string) => Promise < PropertyType >
    readModelReferenceNames: (modelName: string) => Promise < string[] >
    readModelReferenceType: (modelName: string, referenceName: string) => Promise < ModelReference >
    readModelMetadata: (modelName: string) => Promise < object >
    finalizeSchema: (schema: CradleSchema) => Promise < CradleSchema >
    loadSchema: () => Promise<CradleSchema>
```

You can reference @cradlejs/spec-loader for a functioning loader

## Cradle Emitter API

You can also write a custom emitter. Suppose you wanted to write your schema to a database, you could implement a sql-emitter by implementing the ICradleEmitter interface.

```
  prepareEmitter(options: IEmitterOptions, console: IConsole)
  emitSchema(schema: CradleSchema)
```

You can reference @cradlejs/file-emitter for an example.
