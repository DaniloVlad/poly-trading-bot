import { DataTypes, Model } from "sequelize";
import { db } from "../connection";

// User deposits into the system represented as USD value
class UserDeposit extends Model {
  declare id: number;
  declare userId: number;
  declare amount: string;
  declare status: "PENDING" | "BRIDGING" | "COMPLETED" | "FAILED";
}

UserDeposit.init(
  {
    id: {
      type: DataTypes.BIGINT.UNSIGNED,
      autoIncrement: true,
      primaryKey: true,
    },
    userId: {
      type: DataTypes.BIGINT.UNSIGNED,
      allowNull: false,
    },
    amount: {
      type: DataTypes.STRING,
      allowNull: false,
    },
    status: {
      type: DataTypes.ENUM("PENDING", "BRIDGING", "COMPLETED", "FAILED"),
      allowNull: false,
    },
  },
  {
    sequelize: db,
    tableName: "user_deposits",
    timestamps: true,
  }
);

export { UserDeposit };
