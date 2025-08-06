'use strict';

module.exports = {
  up: (queryInterface, Sequelize) => {
      return queryInterface.createTable('assemblyLine', {
    // attributes
    id: {
      type: Sequelize.INTEGER,      
      allowNull: false,
      primaryKey: true,
      autoIncrement: true
    },
    code: {
      type: Sequelize.STRING,      
      allowNull: false
    },
    name: {
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
    locationId: {
      type: Sequelize.INTEGER,
      references: {
        model: 'location',
        key: 'id',
        as: 'id',
      },
    }
   
  }); 
  },

  down: (queryInterface, Sequelize) => {
   return queryInterface.dropTable('assemblyLine');
  }
};