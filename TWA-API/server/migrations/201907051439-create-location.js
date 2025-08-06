'use strict';

module.exports = {
  up: (queryInterface, Sequelize) => {
      return queryInterface.createTable('location', {
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
    address: {
      type: Sequelize.STRING,      
      allowNull: true
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
    }
  }); 
  },

  down: (queryInterface, Sequelize) => {
   return queryInterface.dropTable('location');
  }
};