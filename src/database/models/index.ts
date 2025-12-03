import { db } from "../connection";
import { User } from "./User";
import { UserDeposit } from "./UserDeposit";

async function syncModels() {
  await db.sync({ force: false, alter: true });

  User.hasMany(UserDeposit, { foreignKey: "userId", as: "deposits" });
  UserDeposit.belongsTo(User, { foreignKey: "userId", as: "user" });
}

export { syncModels, User, UserDeposit };
