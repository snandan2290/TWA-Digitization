'use strict';

module.exports = {
  up: (queryInterface, Sequelize) => {
      return queryInterface.createTable('user', {
    // attributes
    id: {
      type: Sequelize.INTEGER,      
      allowNull: false,
      primaryKey: true,
      autoIncrement: true
    },
    uniqueUserId: {
      type: Sequelize.STRING,      
      allowNull: false
    },
    username: {
      type: Sequelize.STRING,      
      allowNull: false
    },
    password: {
      type: Sequelize.STRING,      
      allowNull: false
    },
    isAdmin: {
      type: Sequelize.BOOLEAN,      
      defaultValue: false,
    },
    role: {
      type:   Sequelize.ENUM,
      allowNull: false,
      values: ['Admin', 'Supervisor','Operator']
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
    },
  }); 
  },

  down: (queryInterface, Sequelize) => {
   return queryInterface.dropTable('user');
  }
};