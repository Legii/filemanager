const express = require("express")
const formidable = require('formidable');
const hbs = require('express-handlebars');
const path = require("path")
const fs = require("fs").promises
const fsSync = require("fs")
const app = express()
const PORT = 3000;

app.use(express.static('static'))
app.set('views', path.join(__dirname, 'views'));         // ustalamy katalog views
app.engine('hbs', hbs({ defaultLayout: 'main.hbs' }));   // domyślny layout, potem można go zmienić
app.set('view engine', 'hbs');                           // określenie nazwy silnika szablonów



const root = path.join(__dirname, "uploads")
const Path = (p) => {
  
    return path.join(root,p)
}

async function isEmptyDir(p) {  
    const data = await fs.readdir(p)
    return (Boolean(data.length))
}

const getFiles = async () => {
   
    try {
       
 
         const data = await fs.readdir(root)
        let list = [];
         for (let i = 0; i < data.length; i++) {
            const p =Path(data[i])
            const stat = await fs.lstat(p)
             const isDirectory = stat.isDirectory()
             const name = data[i]
             const empty=  isDirectory ? await isEmptyDir(p) : false
             console.log(empty)
            let obj = {
                isDirectory:isDirectory,
                name:name,
                path:p,
                safePath:encodeURI(p)
            }
            console.log(JSON.stringify(obj))
            if(empty) {obj.empty = true} 
             await list.push(obj)
         }
         
         return list;
     } catch (error) {
         console.log(error);
     }

}


const deleteFile = async (filepath) => {
    filepath = decodeURI(filepath)
    console.log(filepath)
    try {
        if(fsSync.existsSync(filepath))
        {
                await fs.rm(filepath,{recursive: true, force: true})
            
    }   }
    catch {
        console.log("E")
    }
    
}




app.listen(PORT, function () {
    console.log("start serwera na porcie " + PORT )
})

app.get("/", async function (req, res) {
    files = await getFiles()
    const context = {files: files }
    res.render('filemanager.hbs',context); 
})
app.get("/delete", async function (req, res) {
    deleteFile(req.query.path)
    res.redirect("/")
})
app.get('/addFile',function(req,res)
{
    filepath = Path(req.query.path)
    fsSync.writeFile(filepath, "a",  (err)=> {
        if (err) throw err
        console.log("plik nadpisany");
    })
    res.redirect("/")
})

app.get('/addDir',function(req,res)
{
    filepath = Path(req.query.path)
    fsSync.mkdir(filepath,  (err)=> {
        if (err) console.log(err)
        console.log("plik nadpisany");
    })
    res.redirect("/")
})



app.post('/handleUpload', function (req, res) {
    let form = formidable({});
    form.uploadDir = root  
    form.on('file', function(field, file) {
            fs.rename(file.path, path.join(form.uploadDir, file.name));
    }); 

    form.parse(req, function (err, fields, files) {
 
    res.redirect("/")
        
    });
});