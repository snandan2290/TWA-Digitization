module.exports = (sequelize, DataTypes) => {
 
const instruction = sequelize.define('instruction', {
    // attributes
    id: {
      type: DataTypes.INTEGER,      
      allowNull: false,
      primaryKey: true,
      autoIncrement: true
    },
    fileLocation: {
      type: DataTypes.STRING,      
      allowNull: false
    },
    instructionType: {
      type:   DataTypes.ENUM,
      allowNull: false,
      values: ['SOP', 'GE']
    }
  }, 
  {
    timestamps: true,
    freezeTableName: true, //Stop changing table names to plural
    tableName: 'instruction'

  });

  instruction.associate = (models) => {
    instruction.belongsTo(models.variant,{
      foreignKey: 'variantId',
    });
    instruction.belongsTo(models.process,{
      foreignKey: 'processId',
    });
};

  return instruction;

};