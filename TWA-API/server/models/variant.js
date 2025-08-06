module.exports = (sequelize, DataTypes) => {
  const variant = sequelize.define(
    "variant",
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
        allowNull: true
      },
      description: {
        type: DataTypes.STRING,
        allowNull: true
      },
      sopFile: {
        type: DataTypes.STRING,
        allowNull: true
      },
      imagePath: {
        type: DataTypes.ARRAY(DataTypes.STRING),
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
      tableName: "variant"
    }
  );

  variant.associate = models => {
    variant.belongsTo(models.billOfMaterial, {
      foreignKey: "billOfMaterialId"
    });
  };

  return variant;
};
