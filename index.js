const { Telegraf } = require('telegraf')
// const { callback } = require('telegraf/typings/button')
const sqlite3 = require('sqlite3').verbose()

const bot = new Telegraf('6373270540:AAHn5a4oP0WVSKYGbc5PajZF62D0idekGcI')

const db = new sqlite3.Database('sqlite3')

function createTable(){
    const query = `CREATE TABLE User(
        id INTEGER PRIMARY KEY, 
        status varchar(255)
    );`
    db.run(query);
}

function createTableFiles(){
    const query = `CREATE TABLE File(
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        file int,
        user_id int 
        );`
    db.run(query);
}

function getAll(user_id, callback){
    const query  = `SELECT file FROM File WHERE user_id = ${user_id}`
    db.all(query, (err, res) =>{
        callback(res)
    })
}

function createMessage(file, user_id){
    const query = `INSERT INTO File(file, user_id) VALUES(?, ?);`
    db.run(query, [file, user_id])
}

function getUser(id, callback){ 
    const query = `SELECT status FROM User WHERE id = ${id}`   
    db.get(query, (err, res )=>{
        callback(res)
    })
}

function addUser(id, status){
    const query =  `INSERT INTO User(id, status)VALUES(?, ?);`
    db.run(query, [id, status])
}

function updStatus(id, status){
    const query = `UPDATE User SET status = '${status}' WHERE id = ${id}`
    db.get(query)
}

function getFile(id, callback){
    const query = `SELECT file, user_id FROM File WHERE id = ${id}`
    db.get(query, (err, res)=>{
        callback(res)
    })
}

// function getUserId(id){
//     const query = `SELECT user_id FROM File WHERE id = ${id}`
//     db.get(query)
// }

bot.start((ctx)=>{
    addUser(ctx.from.id, 'standart')
})
// createTable()
// createTableFiles()
bot.command('createfile', (ctx) => {
    getUser(ctx.from.id, (res)=>{
        if(res){
            updStatus(ctx.from.id, 'add')
            ctx.reply('Чекаю на ваш файл:')
            bot.on('message', (ctx) => {
                createMessage(ctx.message.message_id, ctx.from.id)
            })
        
        }else{
            addUser(ctx.from.id, 'standart')
        }
    })
})

bot.command('search_file', (ctx) => {
    getUser(ctx.from.id, (res)=>{
        if(res){
            ctx.reply('Запищіть номер файла:')
            updStatus(ctx.from.id, 'search')
            bot.on('text', (ctx) => {
                getFile(Number(ctx.message.text), (res) =>{
                        bot.telegram.forwardMessage(ctx.from.id, res.user_id, res.file)
                })
            })
        }else{
            addUser(ctx.from.id, 'standart')
        }
    })
})

bot.command('myfiles', (ctx)=>{
    ctx.reply('Всі ваші файли:')
    getAll(ctx.from.id, (res)=>{
        for (let i of res){
            bot.telegram.forwardMessage(ctx.from.id, ctx.from.id, i.file)
        }
        
    })
})

bot.launch()


// ctx.reply('Відправте мені файл:');
//     bot.on('file', (ctx) =>{
//         const fileId = ctx.message.file.file_id;
//         const fileLink = ctx.telegram.getFileLink(fileId);

//         ctx.reply('Файл було успішно збережено!');
//         ctx.replyWithDocument(fileLink);
//     })