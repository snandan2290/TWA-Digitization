module.exports = (sequelize, DataTypes) => {
 
const device = sequelize.define('device', {
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
    uuid: {
      type: DataTypes.STRING,      
      allowNull: false
    },
    isActive:{
      type: DataTypes.BOOLEAN,      
      defaultValue: true,
    },
    operator_id: {
      type: DataTypes.INTEGER,
      allowNull: true,
    },
    fcm_token: {
      type: DataTypes.STRING,
      allowNull: true,
    }
  }, 
  {
    timestamps: true,
    freezeTableName: true, //Stop changing table names to plural
    tableName: 'device'

  });

  device.associate = (models) => {
    device.belongsTo(models.assemblyLine,{
      foreignKey: 'assemblyLineId',
    });
    device.belongsTo(models.process,{
      foreignKey: 'processId',
    });
  };

  return device;

}
