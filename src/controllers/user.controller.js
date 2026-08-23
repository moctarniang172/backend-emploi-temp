// Ne gère que la partie HTTP du CRUD des comptes utilisateurs.
// Toute la logique métier vit dans services/user.service.js.

const userService = require('../services/user.service');
const asyncHandler = require('../utils/asyncHandler');
const { sendSuccess } = require('../utils/ApiResponse');

const listUsers = asyncHandler(async (req, res) => {
  const users = await userService.listUsers();
  sendSuccess(res, 200, 'Liste des comptes récupérée.', { users });
});

const createUser = asyncHandler(async (req, res) => {
  const user = await userService.createUser(req.body);
  sendSuccess(res, 201, 'Compte créé avec succès.', { user });
});

const updateUser = asyncHandler(async (req, res) => {
  const user = await userService.updateUser(req.params.id, req.body);
  sendSuccess(res, 200, 'Compte mis à jour.', { user });
});

const deleteUser = asyncHandler(async (req, res) => {
  await userService.deleteUser(req.params.id);
  sendSuccess(res, 200, 'Compte supprimé.');
});

module.exports = { listUsers, createUser, updateUser, deleteUser };
