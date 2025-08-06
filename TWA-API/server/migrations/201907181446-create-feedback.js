'use strict';

module.exports = {
  up: (queryInterface, Sequelize) => {
      return queryInterface.createTable('feedback', {
    // attributes
    id: {
      type: Sequelize.INTEGER,      
      allowNull: false,
      primaryKey: true,
      autoIncrement: true
    },
    voiceFeedback: {
      type: Sequelize.STRING,  //Feedback File path 
      allowNull: true
    },
    textFeedback: {
      type: Sequelize.STRING,      
      allowNull: true
    },
    resolveMessage: {
      type: Sequelize.STRING,      
      allowNull: true
    },
    isResolved:{
      type: Sequelize.BOOLEAN,      
      defaultValue: false,
    },
    isEscalated:{
      type: Sequelize.BOOLEAN,      
      defaultValue: false,
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
    processId: {
      type: Sequelize.INTEGER,
      references: {
        model: 'process',
        key: 'id',
        as: 'id',
      },
    },
    operatorId: {
      type: Sequelize.INTEGER,
      references: {
        model: 'user',
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
   return queryInterface.dropTable('feedback');
  }
};