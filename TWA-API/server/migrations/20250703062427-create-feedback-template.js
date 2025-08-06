'use strict';

const { feedback } = require('../models');

/** @type {import('sequelize-cli').Migration} */
module.exports = {
  up: async(queryInterface, Sequelize) => {
    await queryInterface.createTable('feedbackTemplate', {
      id: {
        allowNull: false,
        autoIncrement: true,
        primaryKey: true,
        type: Sequelize.INTEGER
      },
      feedbackId: {
        type: Sequelize.INTEGER, // Feedback ID
        allowNull: false,
        references: {
          model: 'feedback', // Name of the table   
          key: 'id' // Key in the referenced table
        },
        unique: true // Ensure one template per feedback
      },
      template: {
        type: Sequelize.JSON
      },
      createdAt: {
        allowNull: false,
        type: Sequelize.DATE
      },
      updatedAt: {
        allowNull: false,
        type: Sequelize.DATE
      }
    });
  },
  down: async (queryInterface, Sequelize) => {
    await queryInterface.dropTable('feedbackTemplate');
  }
};