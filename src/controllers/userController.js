const express = require('express');

const User = require('../models/user');

const router = express.Router();
const bcr = require('bcryptjs');
const jwt = require('jsonwebtoken');
const auth = require('../config/auth.json');
const crypto = require('crypto');
const mailer = require('../modules/mailer');


/**
 * Já que estamos trabalhando como se fosse uma API feita para
 * integração com um Front separado... Vai ai uma documentação 
 * de como usar a API -> 
 * Rota do post ===> ela vai servir para injetar as autenticações 
 * do usuario para dentro do banco de dados
 */

 /**Rota de registro de usuario*/
router.post('/registro',async (req,res) =>{
    const {email,senha} = req.body;
    try{
        
        if(await User.findOne({email})){
            return res.status(400).send({error:"Email já cadastrado!"});
        }

        const user = await User.create(req.body);

       
       /*
        const{email} = req.body
        if(await User.findOne({email}))
        return res.status(400).send("Esse email já esta cadastrado")

        const user = await User.create(req.body);
        user.senha = undefined;
        return res.send({user});

        */
        user.senha = undefined;
        return res.send({user,
        token: geracaoToken({id:user.id}),
        });

    }catch(err){
        return res.status(400).send({error: 'Falha ao registrar '+'Verifique se os dados estão corretos!'});
    }
});


function geracaoToken(params = {}){
    return jwt.sign(params,auth.secret,{expiresIn: 86400, /*Espira em um dia*/});
}

router.post('/autenticacao', async (req,res) => {
    const {email,senha} = req.body;
    const user = await User.findOne({email}).select('+senha');
    if(!user){return res.status(400).send({error:"Email não Cadastrado"})}
    if(!await bcr.compare(senha,user.senha)){res.status(400).send("Senha incorreta")}
    user.senha = undefined;
     
    const token = //jwt.sign({id:user.id},auth.secret,{expiresIn: 86400, /*Espira em um dia*/});
    res.send({user,
    token: geracaoToken({id:user.id}),
    });
    
});
//Rota de esqueci a senha do usuario, infelismente está com problema, até segunda ajeito.
router.post('/esqueciSenha', async (req,res)=> {
    const {email} = req.body;
    try{ 
        
        
        const user = await User.findOne({email});
        
        
        if(!user){return res.status(400).send({error:"Email não Cadastrado"})}
       
        
        const token = crypto.randomBytes(20).toString('hex');
        
        
        const now = new Date();
        
        
        now.setHours(now.getHours()+ 1);
         
        await User.findByIdAndUpdate(user.id,{'$set':{tokenRecuperadorSenha:token,senhaResetadaTempo:now,}})

        console.log("O token agora é: ",token);
        console.log("O tempo token agora é: ",now);
        console.log("Seu tolken é: "+ token+" Na data: "+now);

        //Essa parte tá bem chatinha...
        //Ta dando erro na parte de enviar o email, tá dizendo que os parametros tem que ser strings...
        //se rodar vai aparecer os erros...Eles estão no console...
        mailer.sendMail({
            to: email,
            from:'gaderaldo10@gmail.com',
            template:'../resouce/htmlEsqueciSenha',
            context:{token},
        });


        
    }catch(err){
        console.log(err);
        res.status(400).send({error:'Erro no processo de altenticação tente novamnte'});
    }
});

/*Rota de listagem de usuario*/
router.get('/',async(req,res)=>{
    try{
        const user = await User.find()
        return res.send({user})
    }catch(err){
        res.status(400).send({error:'erro nenhum usuario encontrado'})
    }
});



module.exports = app => app.use('/user',router);