import { CradleModel } from './CradleModel'

/**
 * The Cradle Schema - this is a collection of models along with some helper methods
 * for locating models.
 */
export class CradleSchema {
  public Models: CradleModel[] = []

  constructor(models: CradleModel[]) {
    this.Models = models
  }

  /** Returns the first model that matches the given name */
  public GetModel = (modelName: string) => this.Models.find((m) => m.Name === modelName)

  /** Returns the index of the first model that matches the given name */
  public GetModelIndex = (modelName: string) => this.Models.findIndex((m) => m.Name === modelName)
}
