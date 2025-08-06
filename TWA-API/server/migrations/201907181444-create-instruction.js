'use strict';

module.exports = {
  up: (queryInterface, Sequelize) => {
      return queryInterface.createTable('instruction', {
    // attributes
    id: {
      type: Sequelize.INTEGER,      
      allowNull: false,
      primaryKey: true,
      autoIncrement: true
    },
    fileLocation: {
      type: Sequelize.STRING,      
      allowNull: false
    },
    instructionType: {
      type:   Sequelize.ENUM,
      allowNull: false,
      values: ['SOP', 'GE']
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
    processId: {
      type: Sequelize.INTEGER,
      references: {
        model: 'process',
        key: 'id',
        as: 'id',
      },
    }
  }); 
  },

  down: (queryInterface, Sequelize) => {
   return queryInterface.dropTable('instruction');
  }
};