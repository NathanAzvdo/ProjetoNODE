// Carregando módulos
const express = require('express');
const handlebars = require('express-handlebars');
const bodyParser = require('body-parser'); // Apenas uma importação
const app = express();
const admin = require('./routes/admin');
const path = require('path');
const mongoose = require('mongoose');
const session = require('express-session');
const flash = require('connect-flash');
require('./models/Postagens');
const Postagem = mongoose.model('Postagens');
require('./models/Categoria');
const Categoria = mongoose.model('Categorias')
// Configuração

//config sessão
app.use(session({
    secret:"secretTest",
    resave: true,
    saveUninitialized:true, 
}))
app.use(flash());
//body-parser
app.use(bodyParser.urlencoded({ extended: true }));
app.use(bodyParser.json());
//handlebars
app.engine('handlebars', handlebars.engine({
    defaultLayout: 'main',
    runtimeOptions: {
        allowProtoPropertiesByDefault: true,
        allowProtoMethodsByDefault: true,
    }
}));
app.set('view engine', 'handlebars');
//mongoose
mongoose.Promise = global.Promise;
mongoose.connect('mongodb://localhost/blogapp').then(()=>{
    console.log('Conected to database');
}).catch((err) => {
    console.log('Error to connect to mongodb:' + err)
})
app.use((req, res, next)=>{
    res.locals.success_msg = req.flash("success_msg");
    res.locals.error_msg = req.flash("error_msg");
    next();
})

//arquivos estáticos
app.use(express.static(path.join(__dirname, "public")));
//utilizamos o dirname para pegar o caminho absoluto para o diretorio

// Rotas
app.get('/', (req, res)=>{
    Postagem.find().populate("categoria").sort({data:'descending'}).limit(5).then((postagens)=>{
        res.render('index', {postagens:postagens});
    }).catch((err)=>{
        res.status(404).send('Erro 404: Página não encontrada');
    })
    
    
})

app.get("/categorias", (req, res)=>{
    Categoria.find().then((categorias)=>{
        res.render('categorias/index', {categorias: categorias});
    }).catch((err)=>{
        req.flash("error_msg", "Erro ao carregar categorias");
        res.redirect('/');
    })
});
app.get('/categorias/posts/:slug', (req,res)=>{
    Categoria.findOne({slug:req.params.slug}).then((categoria)=>{
        if(categoria){
            Postagem.find({categoria:categoria._id}).then((postagens)=>{
                res.render("categorias/postagens", {categoria:categoria, postagens:postagens})
            }).catch((err)=>{
                req.flash('error_msg', "Erro ao carregar postagens")
                res.render("categorias/index")
            });  
        }else{
            req.flash("error_msg", "Essa categoria não existe");
            res.redirect("/categorias/")
        }
    }).catch((err)=>{
        req.flash("error_msg", "Houve um erro interno ao carregar a página dessa categoria!");
        res.redirect("/categorias");
    })
})

app.get('/categorias/postCompleto/:id', (req, res)=>{    
    Postagem.findOne({id: req.params.id}).then((postagem)=>{
        res.render("categorias/postC", {postagem: postagem})
    }).catch((err)=>{
        req.flash("error_msg", "Erro ao carregar postagem")
        res.redirect("categorias/posts")
    })
});


app.use('/admin', admin);

// Outros
const PORT = 8084;

app.listen(PORT, () => {
    console.log("running on: localhost:" + PORT);
});


