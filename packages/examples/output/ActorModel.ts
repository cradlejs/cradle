import { Sequelize, Model, DataTypes } from 'sequelize'
export class Actor extends Model {
  public readonly id!: number
  public readonly firstName!: string | null
  public readonly lastName!: 'Gary' | 'Neff' | 'Murphy'
  public readonly dateOfBirth!: Date
}
