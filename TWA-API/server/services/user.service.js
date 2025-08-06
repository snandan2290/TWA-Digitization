const bcrypt = require("bcryptjs");
var path = require("path");
var userModel = require("../models").user;
var locationModel = require("../models").location;
var saltRound = 10;
var baseService = require("./base.service");
const Op = require("sequelize").Op;
const sequelize = require("sequelize");

exports.create = async function (user) {
  const hashPassword = await bcrypt.hash(user.password, saltRound);
  user.password = hashPassword;
  let _newUser = await userModel.create(user);
  _newUser.password = undefined;
  return _newUser;
};

exports.update = async function (user) {
  if (user.password != undefined && user.password != null) {
    const hashPassword = await bcrypt.hash(user.password, saltRound);
    user.password = hashPassword;
  }
  await userModel.update(user, { where: { id: user.id } });
  user.password = undefined;
  return user;
};

exports.getById = async function (id) {
  let _user = await userModel.findByPk(id);
  _user.password = undefined;
  return _user;
};
exports.authenticate = async function (username, password) {
  let _user = await userModel.findAll({
    where: { uniqueUserId: username, isActive: true },
  });
  if (_user != null && _user.length > 0) {
    //Check if userv provided password for Admin and Supervior Login
    if (password != undefined && password != "") {
      let compare = await bcrypt.compare(password, _user[0].password);
      if (compare) {
        //remove password from the response
        _user[0].password = undefined;
        return _user;
      } else {
        return null;
      }
    } else {
      return _user;
    }
  }
  return null;
};

exports.getUserListByLocation = async function (locationId) {
  let _userList = await userModel.findAll({
    where: {
      locationId: locationId,
      isActive: true,
    },
    order: [["id", "ASC"]],
    attributes: ["id", "uniqueUserId", "username", "isAdmin", "role"],
  });
  return _userList;
};

exports.getAllUserListByPagination = async function (
  page,
  pageSize,
  searchParam
) {
  let whereClause = {};

  if (
    searchParam !== undefined &&
    searchParam !== null &&
    searchParam !== "undefined"
  ) {
    if (searchParam.toUpperCase() === "ACTIVE") {
      whereClause = [{ isActive: true }];
    } else if (searchParam.toUpperCase() === "INACTIVE") {
      whereClause = [{ isActive: false }];
    } else {
      whereClause[Op.or] = [
        { uniqueUserId: { [Op.iLike]: `%${searchParam}%` } },
        { username: { [Op.iLike]: `%${searchParam}%` } },
        { email: { [Op.iLike]: `%${searchParam}%` } },
        sequelize.where(sequelize.col("location.name"), {
          [Op.iLike]: `%${searchParam}%`,
        }),
        sequelize.where(sequelize.cast(sequelize.col("user.role"), "varchar"), {
          [Op.iLike]: `%${searchParam}%`,
        }),
      ];
    }
  }

  let pageOffset = baseService.getPageoffset(page, pageSize);
  let _userList = await userModel.findAndCountAll({
    where: whereClause,
    limit: pageOffset.limit,
    offset: pageOffset.offset,
    order: [
      ["isActive", "DESC"],
      ["id", "DESC"],
    ],
    include: [
      {
        model: locationModel,
        as: "location",
        attributes: ["id", "name", "code"],
      },
    ],
    attributes: [
      "id",
      "uniqueUserId",
      "username",
      "isAdmin",
      "role",
      "email",
      "isActive",
    ],
  });
  return _userList;
};

exports.isEmpCodeExists = async function (empCode, userId) {
  let whereClause = {
    isActive: true,
    uniqueUserId: empCode,
  };
  if (userId !== null) {
    whereClause["id"] = { [Op.notIn]: [userId] };
  }
  let _userList = await userModel.findAll({
    where: whereClause,
  });
  if (_userList.length > 0) {
    return true;
  }
  return false;
};

exports.isUserEmailExists = async function (email, userId) {
  let whereClause = {
    isActive: true,
    email: email,
  };
  if (userId !== null) {
    whereClause["id"] = { [Op.notIn]: [userId] };
  }
  let _userList = await userModel.findAll({
    where: whereClause,
  });

  if (_userList.length > 0) {
    return true;
  }
  return false;
};
