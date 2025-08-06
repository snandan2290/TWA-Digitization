module.exports = (sequelize, DataTypes) => {
  const feedbackTemplate = sequelize.define(
    "feedbackTemplate",
    {
      // attributes
      id: {
        type: DataTypes.INTEGER,
        allowNull: false,
        primaryKey: true,
        autoIncrement: true
      },
      feedbackId:{
        type: DataTypes.INTEGER, //Feedback ID
        allowNull: false,
        references: {
          model: "feedback", // Name of the table
          key: "id" // Key in the referenced table
        },
        unique: true // Ensure one template per feedback
      },
      template: {
        type: DataTypes.JSON, //Feedback File path
        allowNull: false
      }
    },
    {
      timestamps: true,
      freezeTableName: true, //Stop changing table names to plural
      tableName: "feedbackTemplate" //Table name in database
    }
  );

  feedbackTemplate.associate = models => {
    feedbackTemplate.belongsTo(models.feedback, {
      foreignKey: "feedbackId",
      as: "feedback"
    });
  };

  return feedbackTemplate;
};
