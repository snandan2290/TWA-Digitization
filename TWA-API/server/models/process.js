module.exports = (sequelize, DataTypes) => {
  const process = sequelize.define(
    "process",
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
      description: {
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
      tableName: "process"
    }
  );
  process.associate = models => {
    process.hasMany(models.instruction, {
      foreignKey: "processId",
      sourceKey: "id",
      as: "instruction"
    });
  };

  return process;
};
