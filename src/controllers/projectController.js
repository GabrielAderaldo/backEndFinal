const express = require('express');
const router = express.Router();
const authMiddle = require('../middlewares/auth');

/**Aqui já é opagina princiapal do sistema, quando a altenticação já foi feita... então se entra aqui:
 * se fara as manipulações especificas de cada usuario aqui*/ 

router.use(authMiddle);

router.get('/',(req,res)=>{
    res.send({Altorização:true,Id_Do_Usuario:req.userId});
    
});


module.exports = app => app.use('/PaginaPrincipal',router);