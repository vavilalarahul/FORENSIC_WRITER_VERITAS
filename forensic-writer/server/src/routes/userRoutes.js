const express = require('express');
const router = express.Router();
const { 
    getUsers, 
    getAllUsers,
    createUser, 
    updateUserRole, 
    deleteUser, 
    getProfile, 
    updateProfile, 
    uploadAvatar, 
    setPresetAvatar, 
    getRoles 
} = require('../controllers/userController');
// Public routes (no authentication)
router.get('/', getAllUsers);
router.get('/me', getProfile);
router.put('/profile', updateProfile);
router.put('/avatar/preset', setPresetAvatar);
router.post('/avatar/upload', uploadAvatar);
router.post('/', createUser);
router.put('/:id/role', updateUserRole);
router.delete('/:id', deleteUser);
router.get('/roles', getRoles);

module.exports = router;
