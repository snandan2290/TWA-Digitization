exports.sendSuccess = function (res, result, message) {
  res.status(200).send({
    status: "success",
    message: message,
    data: result,
  });
  return;
};

exports.sendFailure = function (res, exception, message) {
  res.status(400).send({
    status: "fail",
    message: message,
    data: exception != null ? exception.message : null,
  });
};
