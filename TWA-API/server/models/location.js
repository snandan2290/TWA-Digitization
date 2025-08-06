module.exports = (sequelize, DataTypes) => {
  const location = sequelize.define(
    "location",
    {
      // attributes
      id: {
        type: DataTypes.INTEGER,
        allowNull: false,
        primaryKey: true,
        autoIncrement: true
      },
      code: {
        type: DataTypes.STRING,
        allowNull: false
      },
      name: {
        type: DataTypes.STRING,
        allowNull: false
      },
      address: {
        type: DataTypes.STRING,
        allowNull: true
      },
      isActive: {
        type: DataTypes.BOOLEAN,
        defaultValue: true
      }
    },
    {
      timestamps: true,
      freezeTableName: true, //Stop changing table names to plural
      tableName: "location"
    }
  );
  location.associate = models => {
    location.hasMany(models.assemblyLine, {
      foreignKey: "locationId",
      sourceKey: "id",
      as: "assemblyLine"
    });
  };
  return location;
};
