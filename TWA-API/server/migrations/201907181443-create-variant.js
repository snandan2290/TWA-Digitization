"use strict";

module.exports = {
  up: (queryInterface, Sequelize) => {
    return queryInterface.createTable("variant", {
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
        allowNull: true
      },
      description: {
        type: Sequelize.STRING,
        allowNull: true
      },
      imagePath: {
        type: Sequelize.ARRAY(Sequelize.STRING),
        allowNull: true
      },
      isActive: {
        type: Sequelize.BOOLEAN,
        defaultValue: true
      },
      createdAt: {
        type: Sequelize.DATE,
        defaultValue: Sequelize.literal("NOW()")
      },
      updatedAt: {
        type: Sequelize.DATE,
        defaultValue: Sequelize.literal("NOW()")
      },
      billOfMaterialId: {
        type: Sequelize.INTEGER,
        references: {
          model: "billOfMaterial",
          key: "id",
          as: "id"
        }
      }
    });
  },

  down: (queryInterface, Sequelize) => {
    return queryInterface.dropTable("variant");
  }
};
