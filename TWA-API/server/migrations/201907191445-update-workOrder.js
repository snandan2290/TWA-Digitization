'use strict';

module.exports = {
  up: (queryInterface, Sequelize) => {
      return Promise.all([
        queryInterface.addColumn(
          'workOrder',
          'name',
          {
            type: Sequelize.STRING
          }
        ),
        queryInterface.addColumn(
          'workOrder',
          'quantity',
          {
            type: Sequelize.INTEGER
          }
        ),
      ]);
    },
  

    down: (queryInterface, Sequelize) => {
      return Promise.all([
        queryInterface.removeColumn('workOrder', 'name'),
        queryInterface.removeColumn('workOrder', 'quantity')
      ]);
    }
  
};