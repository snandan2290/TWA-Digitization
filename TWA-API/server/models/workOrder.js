module.exports = (sequelize, DataTypes) => {
 
const workOrder = sequelize.define('workOrder', {
    // attributes
    id: {
      type: DataTypes.INTEGER,      
      allowNull: false,
      primaryKey: true,
      autoIncrement: true
    },
    name: {
      type: DataTypes.STRING,      
      allowNull: true
    },
    quantity: {
      type: DataTypes.INTEGER,      
      allowNull: true
    },
    assignedTime: {
      type: DataTypes.DATE,      
      allowNull: true
    },
    completedTime: {
      type: DataTypes.DATE,      
      allowNull: true
    },
    deletedTime: {
      type: DataTypes.DATE,      
      allowNull: true
    },
    status: {
      type:   DataTypes.ENUM,
      allowNull: false,
      values: ['Open', 'InProgress', 'Complete']
    },
    isActive:{
      type: DataTypes.BOOLEAN,      
      defaultValue: true,
    },
    type:{
      type: DataTypes.STRING,      
      allowNull: true
    },
    cluster:{
      type: DataTypes.STRING,      
      allowNull: true
    },
    UCP:{
      type: DataTypes.STRING,      
      allowNull: true
    },
    priority: {
      type:   DataTypes.ENUM,
      allowNull: true,
      values: ['FWS1', 'FWS2', 'NPPL','FWS4','FWE4','OTHER'],
      defaultValue: 'OTHER'
    },
  }, 
  {
    timestamps: true,
    freezeTableName: true, //Stop changing table names to plural
    tableName: 'workOrder'

  });

  workOrder.associate = (models) => {
    workOrder.belongsTo(models.variant,{
      foreignKey: 'variantId',
    });
    workOrder.belongsTo(models.assemblyLine,{
      foreignKey: 'assemblyLineId',
    });
};

  return workOrder;

};