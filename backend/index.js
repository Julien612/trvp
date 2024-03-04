import express from 'express';
import dotenv from 'dotenv';
import path from 'path';
import {fileURLToPath} from 'url';
import DB from './db/client.js';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

console.log(__filename, __dirname);

dotenv.config({
	path: './backend/.env'
});

const appHost = process.env.APP_HOST;
const appPort = process.env.APP_PORT;

const app = express();

const db = new DB();


app.use('*', (req, res, next)=>{
    console.log(
        req.method, req.baseUrl || req.url, new Date().toISOString()
    );
    
    next();  
});

app.use('/', express.static(path.resolve(__dirname, '../dist')));


app.get('/tasklists', async (req, res) => {
    try{
        const [dbMenus, dbDishes] = await Promise.all([db.getTasklists(), db.getTasks()]);
    
        const dishes = dbDishes.map(({id, name, type}) => ({dishID:id, name, type }));
        console.log(dishes);
        const menus = dbMenus.map(menu => ({
            menuID: menu.id,
            week_day: menu.week_day,
            variant: menu.variant,
            dishes: dishes.filter(dish => menu.dishes.indexOf(dish.dishID) !== -1)
        }));
        
        
        res.statusCode = 200;
        res.statusMessage = 'OK';
        res.json({ menus });
        //console.log(menus);
    } catch(err) {
        res.statusCode = 500;
        res.statusMessage = 'internal server error';
        res.json({
            timestamp: new Date().toISOString(),
            statusCode:500, 
            message: `Getting tasklists and tasks error: ${err.error}` //err.error.message ||
        });
    }
});

app.use('/tasklists', express.json());

app.post('/tasklists', async (req, res) => {
    try{
        //console.log(req.body);
        const { menuID, week_day, variant, position } = req.body;

        const menus_rows = await db.addTasklist({ menuID, week_day, variant, position }); //length
        
        res.statusCode = 200;
        res.statusMessage = 'OK';
        
        res.json({ menus_rows }); //_length
        res.send();
    } catch(err) {
        switch(err.type) {
            case 'client':
                res.statusCode = 400;
                res.statusMessage = 'BAD REQUEST';
                break;
            default:
                res.statusCode = 500;
                res.statusMessage = 'Internal server error';
        }
        res.json({
        timestamp: new Date().toISOString(),
        statusCode: res.statusCode,
        message:`Add tasklist error: ${err.error.message || err.error}`
        });
    }
});

app.use('/tasklists/:menuID', express.json());

app.patch('/tasklists/:menuID', async (req, res) => {
    try {
        const { menuID } = req.params;
        const { week_day, prev_week_day, variant,prev_variant, type_of_update } = req.body;
        console.log( menuID, week_day, prev_week_day, variant,prev_variant, type_of_update);
        const menus_rows_length =  await db.updateTasklist({ menuID, week_day, prev_week_day, variant,prev_variant, type_of_update });
        
        
        res.statusCode = 200;
        res.statusMessage = 'OK';
        res.json({ menus_rows_length });
        res.send();
        
    } catch(err) {
        switch(err.type){
            case 'client':
                res.statusCode = 400;
                res.statusMessage = 'BAD REQUEST';
                break;
            default:
                res.statusCode = 500;
                res.statusMessage = 'Internal server error';
        }
        res.json({
            timestamp: new Date().toISOString(),
            statusCode: res.statusCode,
            message:`Update task error: ${err.error}` //err.error.message ||
        });
    }
});

app.delete('/tasklists/:menuID', async (req, res) => {
    try {
        const { menuID } = req.params;
        await db.deleteTasklist({ menuID });
        res.statusCode = 200;
        res.statusMessage = 'OK';
        res.send();
        
    } catch(err) {
        switch(err.type){
            case 'client':
                res.statusCode = 400;
                res.statusMessage = 'BAD REQUEST';
                break;
            default:
                res.statusCode = 500;
                res.statusMessage = 'Internal server error';
        }
        res.json({
            timestamp: new Date().toISOString(),
            statusCode: res.statusCode,
            message:`Delete task error: ${err.error}` 
        });
    }
});
app.use('/tasks/:dishID', express.json());
app.delete('/tasks/:dishID', async (req, res) => {
    try {
        const { dishID } = req.params;
        await db.deleteTask({ dishID });
        res.statusCode = 200;
        res.statusMessage = 'OK';
        res.send();
        
    } catch(err) {
        switch(err.type){
            case 'client':
                res.statusCode = 400;
                res.statusMessage = 'BAD REQUEST';
                break;
            default:
                res.statusCode = 500;
                res.statusMessage = 'Internal server error';
        }
        res.json({
            timestamp: new Date().toISOString(),
            statusCode: res.statusCode,
            message:`Delete task error: ${err.error}` 
        });
    }
});
app.patch('/tasks/:dishID', async (req, res) => {
    try {
        const { dishID } = req.params;
        const { name, newType } = req.body;
        await db.updateTask({ dishID, name, newType });
        

        res.statusCode = 200;
        res.statusMessage = 'OK';
        res.send();
        
    } catch(err) {
        switch(err.type){
            case 'client':
                res.statusCode = 400;
                res.statusMessage = 'BAD REQUEST';
                break;
            default:
                res.statusCode = 500;
                res.statusMessage = 'Internal server error';
        }
        res.json({
            timestamp: new Date().toISOString(),
            statusCode: res.statusCode,
            message:`Update task error: ${err.error}` //err.error.message ||
        });
    }
});
app.use('/tasks', express.json());

app.post('/tasks', async (req, res) => {
    try{
        const { dishID, name, type, menuID } = req.body;
        //let add_result = 
        await db.addTask({dishID, name, type, menuID });

        res.statusCode = 200;
        res.statusMessage = 'OK';
        //res.json({ add_result });
        res.send();
        
    } catch(err) {
        switch(err.type){
            case 'client':
                res.statusCode = 400;
                res.statusMessage = 'BAD REQUEST';
                break;
            default:
                res.statusCode = 500;
                res.statusMessage = 'Internal server error';
        }
        res.json({
            timestamp: new Date().toISOString(),
            statusCode: res.statusCode,
            message:`Add task error: ${ err.error}` //err.error.message ||
        });
    }
});


app.patch('/tasklists', async (req, res) => {
    try{
        const {dishID, srcTasklistID, destTasklistID } = req.body;
        await db.moveTask({ dishID, srcTasklistID, destTasklistID });
        res.statusCode = 200;
        res.statusMessage = 'OK';
        res.send();
        
    } catch(err) {
        switch(err.type){
            case 'client':
                res.statusCode = 400;
                res.statusMessage = 'BAD REQUEST';
                break;
            default:
                res.statusCode = 500;
                res.statusMessage = 'Internal server error';
        }
        res.json({
            timestamp: new Date().toISOString(),
            statusCode: res.statusCode,
            message:`Move task error: ${ err.error}` //err.error.message ||
        });
    }
});

const server = app.listen(Number(appPort), appHost, async () => {
    try{
        await db.connect();
        
    } catch (error){
        console.log('Task manager app shut down');
        process.exit(100);
    }
    console.log(`Task manger app started at host http://${appHost}:${appPort}`);
});

process.on('SIGTERM', () =>{
    console.log('SIGTERM signal recived: closing HTTP server');
    server.close(async () =>{
        await db.disconnect();
        console.log('HTTP server closed');
    });
});