require("dotenv").config();
const express = require("express");
const mogoose = require("mongoose");
const bscrypt = require("bcrypt");
const jwt = require("jsonwebtoken");
const cors = require('cors')
const { json } = require("express/lib/response");

const { default: mongoose } = require("mongoose");
const User = require("./models/user");
const Entregador = require("./models/delivery");

const app = express();

app.use((req, res, next) => {
	//Qual site tem permissão de realizar a conexão, no exemplo abaixo está o "*" indicando que qualquer site pode fazer a conexão
    res.header("Access-Control-Allow-Origin", "*");
	//Quais são os métodos que a conexão pode realizar na API
    res.header("Access-Control-Allow-Methods", 'GET,PUT,POST,DELETE');
    app.use(cors());
    next();
  });
  app.use(express.json())

app.post("/", (req, res) => {
 return res.status(200).json({
    res: req.body,
  });
});

function checkToken (req, res, next) {
  const authHeader = req.headers['authorization']

  const token = authHeader && authHeader.split(' ')[1]

  if(!token){
    res.status(401).json({
      res: "Acesso Não autorizado",
    });
  }

  try {
    
    const secret = process.env.SECRET
    
    jwt.verify(token, secret)
    
    next()

  } catch (error) {
    console.log(error)
    res.status(401).json({
      res: "Token Não autorizado",
    });
  }
}

app.post("/auth/register/location", async (req, res) => {
  const { name, email, password, confirmPassword, establishment, image, address } = req.body;
  if (!name) {
    return res.status(422).json({
      res: "Nome é obrigatório",
    });
  }
  if (!email) {
    return res.status(422).json({
      res: "Email é obrigatório",
    });
  }
  if (!password) {
    return res.status(422).json({
      res: "Password é obrigatório",
    });
  }
  if (!confirmPassword) {
    return res.status(422).json({
      res: "ConfirmPassword é obrigatório",
    });
  }
  if (!(password === confirmPassword)) {
    return res.status(422).json({
      res: "As senhas não batem",
    });
  }
  const userExist = await User.findOne({email: email})

  if (userExist) {
    return res.status(422).json({
      res: "Email já registrado, Use outro",
    });
  }

  const salt = await bscrypt.genSalt(12)
  const passwordHash = await bscrypt.hash(password, salt)

  const user = new User({
    name, 
    email, 
    password: passwordHash,
    establishment,
    image,
    address
  })

  try {
   await user.save()

    return res.status(201).json({
        res: "Usuário criado com sucesso",
      });
  } catch (error) {
    console.log(error)
      return res.status(500).json({
        res: "deu errado",
      });
  }

});

app.post("/auth/login/location", async (req, res) => {
  console.log(req.body);
  const {email, password} = req.body
  if (!email) {
    return res.status(422).json({
      res: "Email é obrigatório",
    });
  }
  if (!password) {
    return res.status(422).json({
      res: "Password é obrigatório",
    });
  }

  const userExist = await User.findOne({email: email})

  if (!userExist) {
    return res.status(404).json({
      res: "Usuáriio não encontrado",
    });
  }

  const checkPassword = await bscrypt.compare(password, userExist.password)
  if (!checkPassword) {
    return res.status(422).json({
      res: "Senha Invalida",
    });
  }

  try {

    const secret = process.env.SECRET

    const token = jwt.sign({
      id: userExist._id
    }, secret)

    res.status(200).json({
      res:'sucesso', token
    })
    
  } catch (error) {
    console.log(error)
      return res.status(500).json({
        res: "deu errado",
      });
  }
})

app.post("/auth/register/delivery", async (req, res) => {
  const { email, password, confirmPassword } = req.body;

  if (!email) {
    return res.status(422).json({
      res: "Email é obrigatório",
    });
  }
  if (!password) {
    return res.status(422).json({
      res: "Password é obrigatório",
    });
  }
  if (!confirmPassword) {
    return res.status(422).json({
      res: "ConfirmPassword é obrigatório",
    });
  }
  if (!(password === confirmPassword)) {
    return res.status(422).json({
      res: "As senhas não batem",
    });
  }
  const userExist = await Entregador.findOne({email: email})

  if (userExist) {
    return res.status(422).json({
      res: "Email já registrado, Use outro",
    });
  }

  const salt = await bscrypt.genSalt(12)
  const passwordHash = await bscrypt.hash(password, salt)

  const user = new Entregador({
    email, 
    password: passwordHash
  })

  try {
   await user.save()

    return res.status(201).json({
        res: "Usuário criado com sucesso",
      });
  } catch (error) {
    console.log(error)
      return res.status(500).json({
        res: "deu errado",
      });
  }

});

app.post("/auth/login/delivery", async (req, res) => {
  const {email, password} = req.body

  if (!email) {
    return res.status(422).json({
      res: "Email é obrigatório",
    });
  }
  if (!password) {
    return res.status(422).json({
      res: "Password é obrigatório",
    });
  }

  const userExist = await Entregador.findOne({email: email})

  if (!userExist) {
    return res.status(404).json({
      res: "Usuáriio não encontrado",
    });
  }

  const checkPassword = await bscrypt.compare(password, userExist.password)
  if (!checkPassword) {
    return res.status(422).json({
      res: "Senha Invalida",
    });
  }

  try {

    const secret = process.env.SECRET

    const token = jwt.sign({
      id: userExist._id
    }, secret)

    res.status(200).json({
      res:'sucesso', token
    })
    
  } catch (error) {
    console.log(error)
      return res.status(500).json({
        res: "deu errado",
      });
  }
})

app.get('/user/:id', checkToken, async (req, res) => {
  const user = await User.findById(req.params.id, '-password')

  if (!user) {
    return res.status(404).json({
      res: "Usuáriio não encontrado",
    });
  }

  res.status(200).json({ user })
})

const DB_USER = process.env.DB_USER;
const DB_PASSWORD = process.env.DB_PASS;
mongoose.set('strictQuery', true);
mogoose
  .connect(
    `mongodb+srv://${DB_USER}:${DB_PASSWORD}@cluster0.pdngdnm.mongodb.net/?retryWrites=true&w=majority`
  )
  .then(() => {
    app.listen(8000);
    console.log("Conectou");
  })
  .catch((err) => {
    console.log(err);
  });
