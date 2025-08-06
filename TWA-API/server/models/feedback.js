module.exports = (sequelize, DataTypes) => {
  const feedback = sequelize.define(
    "feedback",
    {
      // attributes
      id: {
        type: DataTypes.INTEGER,
        allowNull: false,
        primaryKey: true,
        autoIncrement: true
      },
      voiceFeedback: {
        type: DataTypes.STRING, //Feedback File path
        allowNull: true
      },
      textFeedback: {
        type: DataTypes.STRING,
        allowNull: true
      },
      resolveMessage: {
        type: DataTypes.STRING,
        allowNull: true
      },
      escalateMessage: {
        type: DataTypes.STRING,
        allowNull: true
      },
      escalatedTo: {
        type: DataTypes.STRING,
        allowNull: true
      },
      category: {
        type: DataTypes.ENUM,
        values: ["Production stoppage", "Clarification", "Information"]
      },
      isResolved: {
        type: DataTypes.BOOLEAN,
        defaultValue: false
      },
      imagePath: {
        type: DataTypes.ARRAY(DataTypes.STRING),
        allowNull: true
      },
      isEscalated: {
        type: DataTypes.BOOLEAN,
        defaultValue: false
      },
      isActive: {
        type: DataTypes.BOOLEAN,
        defaultValue: true
      },
      variant_code: {
        type: DataTypes.STRING,
        allowNull: true
      },
      workorder_no: {
        type: DataTypes.STRING,
        allowNull: true
      },
      component_id: {
        type: DataTypes.INTEGER,
        allowNull: true
      },
      severity: {
        type: DataTypes.ENUM,
        values: ["Critical", "Major", "Minor"],
        allowNull: true
      },
      component_type: {
        type: DataTypes.ENUM,
        values: ['Crown', 'Movement', 'Hands', 'Dial', 'Case'],
        allowNull: true
      },
      isNew:{
        type: DataTypes.BOOLEAN,
        defaultValue: true
      }
    },
    {
      timestamps: true,
      freezeTableName: true, //Stop changing table names to plural
      tableName: "feedback"
    }
  );

  feedback.associate = models => {
    feedback.belongsTo(models.process, {
      foreignKey: "processId"
    });
    feedback.belongsTo(models.user, {
      foreignKey: "operatorId"
    });
    feedback.belongsTo(models.assemblyLine, {
      foreignKey: "assemblyLineId"
    });
    feedback.hasOne(models.feedbackTemplate, {
      foreignKey: "feedbackId",
      as: "template"
    });
  };

  return feedback;
};
