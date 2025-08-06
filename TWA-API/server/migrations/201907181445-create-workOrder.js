'use strict';

module.exports = {
  up: (queryInterface, Sequelize) => {
      return queryInterface.createTable('workOrder', {
    // attributes
    id: {
      type: Sequelize.INTEGER,      
      allowNull: false,
      primaryKey: true,
      autoIncrement: true
    },
    assignedTime: {
      type: Sequelize.DATE,      
      allowNull: true
    },
    completedTime: {
      type: Sequelize.DATE,      
      allowNull: true
    },
    deletedTime: {
      type: Sequelize.DATE,      
      allowNull: true
    },
    status: {
      type:   Sequelize.ENUM,
      allowNull: false,
      values: ['Open', 'InProgress', 'Complete']
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
    variantId: {
      type: Sequelize.INTEGER,
      references: {
        model: 'variant',
        key: 'id',
        as: 'id',
      },
    },
    assemblyLineId: {
      type: Sequelize.INTEGER,
      references: {
        model: 'assemblyLine',
        key: 'id',
        as: 'id',
      },
    }
  }); 
  },

  down: (queryInterface, Sequelize) => {
   return queryInterface.dropTable('workOrder');
  }
};