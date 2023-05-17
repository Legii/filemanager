const express = require("express")
const hbs = require('express-handlebars');
const path = require("path")
const fs = require("fs").promises

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
            }
            if(empty) {obj.empty = true} 
             await list.push(obj)
         }
         
         return list;
     } catch (error) {
         console.log(error);
     }

}







app.listen(PORT, function () {
    console.log("start serwera na porcie " + PORT )
})

app.get("/", async function (req, res) {
    files = await getFiles()
    console.log(files)
    const context = {files: files }
    res.render('filemanager.hbs',context); 
})