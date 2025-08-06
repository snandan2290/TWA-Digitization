module.exports = (sequelize, DataTypes) => {
 
const assemblyLine = sequelize.define('assemblyLine', {
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
    isActive:{
      type: DataTypes.BOOLEAN,      
      defaultValue: true,
    },
  }, 
  {
    timestamps: true,
    freezeTableName: true, //Stop changing table names to plural
    tableName: 'assemblyLine'

  });

  assemblyLine.associate = (models) => {
    assemblyLine.belongsTo(models.location,{
      foreignKey: 'locationId',
    });
};

  return assemblyLine;

};