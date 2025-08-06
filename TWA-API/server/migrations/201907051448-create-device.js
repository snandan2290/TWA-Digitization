'use strict';

module.exports = {
  up: (queryInterface, Sequelize) => {
      return queryInterface.createTable('device', {
    // attributes
    id: {
      type: Sequelize.INTEGER,      
      allowNull: false,
      primaryKey: true,
      autoIncrement: true
    },
    name: {
      type: Sequelize.STRING,      
      allowNull: true
    },
    uuid: {
      type: Sequelize.STRING,      
      allowNull: false
    },
    isActive:{
      type: Sequelize.BOOLEAN,      
      defaultValue: true,
    },
    createdAt:
    {
      type: Sequelize.DATE,      
      defaultValue: Sequelize.literal('NOW()')
    },
    updatedAt:{
      type: Sequelize.DATE,      
      defaultValue: Sequelize.literal('NOW()')
    },
    assemblyLineId: {
      type: Sequelize.INTEGER,
      references: {
        model: 'assemblyLine',
        key: 'id',
        as: 'id',
      }
    },
    processId: {
      type: Sequelize.INTEGER,
      references: {
        model: 'process',
        key: 'id',
        as: 'id',
      } 
    }
   
  }); 
  },

  down: (queryInterface, Sequelize) => {
   return queryInterface.dropTable('device');
  }
};