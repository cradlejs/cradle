import { Sequelize, Model, DataTypes } from 'sequelize'
export class Film extends Model {
  public readonly id!: number
  public readonly name!: string
  public readonly totalBoxOffice!: number
  public readonly releaseDate!: Date
  public readonly isDeleted!: boolean
  public readonly actors!: IActor[]
}
