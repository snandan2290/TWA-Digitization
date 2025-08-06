module.exports = (sequelize, DataTypes) => {
 
const billOfMaterial = sequelize.define('billOfMaterial', {
    // attributes
    id: {
      type: DataTypes.INTEGER,      
      allowNull: false,
      primaryKey: true,
      autoIncrement: true
    },
    componentId: {
      type: DataTypes.ARRAY({type: DataTypes.INTEGER,
      references: { model: 'component', key: 'id' }}),  //List of Compoment IDs from Component table      
      allowNull: false
    }
  }, 
  {
    timestamps: true,
    freezeTableName: true, //Stop changing table names to plural
    tableName: 'billOfMaterial'

  });
  return billOfMaterial;

};