module.exports = (sequelize, DataTypes) => {
  const user = sequelize.define(
    "user",
    {
      // attributes
      id: {
        type: DataTypes.INTEGER,
        allowNull: false,
        primaryKey: true,
        autoIncrement: true
      },
      uniqueUserId: {
        type: DataTypes.STRING,
        allowNull: false
      },
      username: {
        type: DataTypes.STRING,
        allowNull: false
      },
      email: {
        type: DataTypes.STRING,
        allowNull: true
      },
      password: {
        type: DataTypes.STRING,
        allowNull: false
      },
      isAdmin: {
        type: DataTypes.BOOLEAN,
        defaultValue: false
      },
      role: {
        type: DataTypes.ENUM,
        allowNull: false,
        values: ["Admin", "Supervisor", "Operator"]
      },
      isActive: {
        type: DataTypes.BOOLEAN,
        defaultValue: true
      }
    },
    {
      timestamps: true,
      freezeTableName: true, //Stop changing table names to plural
      tableName: "user"
    }
  );

  user.associate = models => {
    user.belongsTo(models.location, {
      foreignKey: "locationId"
    });
  };

  return user;
};
