'use strict';

module.exports = {
  up: (queryInterface, Sequelize) => {
      return queryInterface.createTable('billOfMaterial', {
    // attributes
    id: {
      type: Sequelize.INTEGER,      
      allowNull: false,
      primaryKey: true,
      autoIncrement: true
    },
    componentId: {
      type: Sequelize.ARRAY({type: Sequelize.INTEGER,
      references: { model: 'component', key: 'id' }}),      
      allowNull: false
    },
    createdAt:
    {
      type: Sequelize.DATE,      
      defaultValue: Sequelize.literal('NOW()')
    },
    updatedAt:{
      type: Sequelize.DATE,      
      defaultValue: Sequelize.literal('NOW()')
    }
  }); 
  },

  down: (queryInterface, Sequelize) => {
   return queryInterface.dropTable('billOfMaterial');
  }
};