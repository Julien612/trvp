import pg from 'pg';

export default class DB {
    #dbClient = null;
    #dbHost = '';
    #dbPort = '';
    #dbName='';
    #dbLogin='';
    #dbPassword = '';
    
    constructor() {

        this.#dbHost = process.env.DB_HOST;
        this.#dbPort = process.env.DB_PORT;
        this.#dbName= process.env.DB_NAME;
        this.#dbLogin = process.env.DB_LOGIN;
        this.#dbPassword = process.env.DB_PASSWORD;
        
        this.#dbClient = new pg.Client({
            user: this.#dbLogin,
            password: this.#dbPassword,
            host: this.#dbHost,
            port: this.#dbPort,
            database: this.#dbName
        });
    }
    async connect() {
        try{
            await this.#dbClient.connect();
            console.log('DB connection established');
        } catch(error) {
            console.log('Unable to connect to DB: ', error);
            return Promise.reject(error);
        }
    }

    async disconnect() {
        await this.#dbClient.end();
        console.log('DB connection was closed');
        
    }

    async getTasklists() {
        try{
            const tasklists = await this.#dbClient.query(
                'SELECT * FROM menus ORDER BY position;'
            )
            //console.log(tasklists.rows);
            return tasklists.rows;
        } catch(error) {
            console.error('Unable get menus, error: ', error);
            return Promise.reject({
                type: 'internal',
                error
            });
        }
    }
    async getTasks(){
        try {
            const tasks = await this.#dbClient.query(
                'SELECT * FROM dishes ORDER BY menus_id, type;'
            );
            return tasks.rows;
        } catch(error) {
            console.error('Unable get tasks, error: ', error);
             return Promise.reject({
                type: 'internal',
                error
            });
        }
    }
    async addTasklist({ menuID, week_day, variant, position =-1 } = {menuID:null, week_day:'', variant ,position:-1}) {
        //console.log( menuID, week_day, variant,position);
        if (!menuID || week_day==='' || position < 0) {
            const errMsg = `Add tasklist error: wrong params (id:, name: , position: )`;
            console.error(errMsg);
             return Promise.reject({
                type: 'client',
                error: new Error(errMsg)
            });
        }
        try {
             

            const menus = await this.#dbClient.query(
                    'SELECT * FROM menus WHERE week_day = $1;', [week_day]
                );
            
            
            if(menus.rows.length===0){ //if there is first menu for this day of week
               await this.#dbClient.query(
                'INSERT INTO menus (id, week_day, position) VALUES ($1, $2, $3);',
                    [menuID, week_day, position]
                );
            } else { 
                
            //if it is not fisrt menu of the day of week we need to update 'variant' value if first menu of the day 
            //or we need just increment value if 'variant' of current menu
                if(menus.rows.length===1){
                    await this.#dbClient.query(
                    'UPDATE menus SET variant = $1 WHERE id = $2;', [1, menus.rows[0].id]
                    );
                }

                await this.#dbClient.query(
                    'INSERT INTO menus (id, week_day, position, variant) VALUES ($1, $2, $3, $4);',
                        [menuID, week_day, position, menus.rows.length+1]
                );
                
            }



            //console.log(menus.rows);
            return (menus.rows); //.length+1

        } catch(error) {
            console.error('Unable add tasklists, error: ', error);
             return Promise.reject({
                type: 'internal',
                error
            });
        }
        
    }
    async updateTasklist({
        menuID,
        week_day,
        prev_week_day,
        variant=null,prev_variant=null,type_of_update} = {
        menuID:null,
        week_day:'',prev_week_day,variant:null ,prev_variant:null,type_of_update}) 
    {
        if (!menuID || week_day===''){
            const errMsg = `Update task error: wrong params (taskID:  text: position: )`;
            console.error(errMsg);
            return Promise.reject({
                type: 'client',
                error: new Error(errMsg)
            });
        }
        
        let query = null;
        const queryParams = [];
        let menus = null
        let menus_prevWeekDay = null;
        try {
            //меняем д/н
            if(type_of_update===0){ 
                menus = await this.#dbClient.query(
                    'SELECT * FROM menus WHERE week_day = $1;', [week_day]
                );
                menus_prevWeekDay = await this.#dbClient.query(
                    'SELECT * FROM menus WHERE week_day = $1;', [prev_week_day]
                );
                
                
                if(prev_week_day){
                   
                    for (let menu of menus_prevWeekDay.rows) {
                        
                        if(menu.variant>variant){ //TODO: какой вариант брать
                            await this.#dbClient.query(
                                'UPDATE menus SET variant = $1 WHERE id = $2;', [menu.variant-1, menu.id]
                            );
                        }else if(menu.variant<variant && menus_prevWeekDay.rows.length===2){
                            await this.#dbClient.query(
                                'UPDATE menus SET variant = null WHERE id = $1;', [menu.id]
                            );
                            break;
                        }
                    }
                }

                if(menus.rows.length===0){
                    variant = null;
                    if(week_day){
                        query = 'UPDATE menus SET week_day = $1, variant = $2 WHERE id = $3;';
                        queryParams.push(week_day, variant, menuID);
                    }
                }else{
                    if(menus.rows.length===1){
                        await this.#dbClient.query(
                            'UPDATE menus SET variant = 1 WHERE id = $1;', [menus.rows[0].id]
                        );
                    }
                    variant = menus.rows.length+1;
                    if(week_day){
                        query = 'UPDATE menus SET week_day = $1, variant = $2 WHERE id = $3;';
                        queryParams.push(week_day, variant, menuID);
                    }
                }
                
                
            }else{
                if(prev_variant && week_day){
                    menus = await this.#dbClient.query(
                        'SELECT * FROM menus WHERE variant = $1 and week_day = $2;', [variant, week_day]
                    );
                    let menu_id = menus.rows[0].id;

                    await this.#dbClient.query(
                        'UPDATE menus SET variant = $1 WHERE id = $2;', [prev_variant, menu_id]
                    );

                    query = 'UPDATE menus SET variant = $1 WHERE id = $2;';
                    queryParams.push(variant, menuID);
                }

                
                    
                
            }

            await this.#dbClient.query(query, queryParams);
            
            return (menus.rows.length+1);
            
        }catch (error){
            console.error('Unable update tasks, error: ', error);
             return Promise.reject({
                type: 'internal',
                error
            });
        }
    }
    
    async deleteTasklist({ menuID } = {menuID: null}) {
        if (!menuID) {
            const errMsg = `Delete task error: wrong params (taskID)`;
            console.error(errMsg);
            return Promise.reject({
                type: 'client',
                error: new Error(errMsg)
            });
        }
        try {
            await this.#dbClient.query(
                'DELETE FROM dishes WHERE menus_id = $1;', [menuID]
            );

            let menus = null;
            menus = await this.#dbClient.query(
                'SELECT * FROM menus WHERE id = $1;', [menuID]
            );
            let variant = menus.rows[0].variant;
            let week_day = menus.rows[0].week_day;
            //другие меню этого дня недели
            menus = await this.#dbClient.query(
                'SELECT * FROM menus WHERE week_day = $1;', [week_day]
            );
            for (let menu of menus.rows) {
                if(menu.variant>variant){ 
                    await this.#dbClient.query(
                        'UPDATE menus SET variant = $1 WHERE id = $2;', [menu.variant-1, menu.id]
                    );
                }
                if(menu.variant===1 && menus.rows.length===2){
                    await this.#dbClient.query(
                        'UPDATE menus SET variant = null WHERE id = $1;', [menu.id]
                    );
                }
            }

             await this.#dbClient.query(
                'DELETE FROM menus WHERE id = $1;', [menuID]
            );

        } catch (error){
            console.error('Unable delete task, error: ', error);
             return Promise.reject({
                type: 'internal',
                error
            });
        }
    }

    /*async deleteTask({ dishID } = {dishID: null}) {
        if (!dishID) {
            const errMsg = `Delete task error: wrong params (dishID: ${dishID})`;
            console.error(errMsg);
            return Promise.reject({
                type: 'client',
                error: new Error(errMsg)
            });
        }
        try {
            const queryResult = await this.#dbClient.query(
            'SELECT menus_id FROM dishes WHERE id = $1;', [dishID]);

            const {menu_id: menuID} = queryResult.rows[0];
            
            await this.#dbClient.query(
                'DELETE FROM dishes WHERE id = $1;', [dishID]
            );
            await this.#dbClient.query(
                'UPDATE menus SET dishes = array_remove(dishes, $1) WHERE id = $2;', [dishID, menuID]
            );
        } catch (error){
            console.error('Unable delete task, error: ', error);
             return Promise.reject({
                type: 'internal',
                error
            });
        }
    }*/
    async getTasks(){
        try {
            let tasks = [];
            let query = null;
            /*const tasks = await this.#dbClient.query(
                'SELECT * FROM dishes ORDER BY menus_id;'
            );*/
            query = await this.#dbClient.query("SELECT * FROM dishes WHERE type = 'Salad';");
            for(let q of query.rows){
                tasks.push(q);
            }
           
            query = await this.#dbClient.query("SELECT * FROM dishes WHERE type = 'Soup';");
            for(let q of query.rows){
                tasks.push(q);
            }

            query = await this.#dbClient.query("SELECT * FROM dishes WHERE type = 'Main dish';");
            for(let q of query.rows){
                tasks.push(q);
            }

            query = await this.#dbClient.query("SELECT * FROM dishes WHERE type = 'Dessert';");
            for(let q of query.rows){
                tasks.push(q);
            }

            query = await this.#dbClient.query("SELECT * FROM dishes WHERE type = 'Drink';");
            for(let q of query.rows){
                tasks.push(q);
            }
            
            return tasks;
        } catch(error) {
            console.error('Unable get tasks, error: ', error);
             return Promise.reject({
                type: 'internal',
                error
            });
        }
    }
    async addTask({
        dishID, name, type, menuID
    } = {
        dishID:null, name:'', type:'', menuID:null
    }) {
        if (!dishID || !name || !type || !menuID) {
            const errMsg = `Add dish error: wrong params (dishID: ${dishID}, name: ${name}, type: ${type}, menuID: ${menuID})`;
            console.error(errMsg);
             return Promise.reject({
                type: 'client',
                error: new Error(errMsg)
            });
        } 
        try {

            let dish = await this.#dbClient.query(
                'SELECT * FROM dishes WHERE type=$1 and menus_id=$2;',
                    [type, menuID]
            );
            if(dish.rows.length===0){
                await this.#dbClient.query(
                'INSERT INTO dishes (id,name,type, menus_id) VALUES ($1,$2,$3,$4);',
                [dishID, name, type, menuID]
                );
                await this.#dbClient.query(
                'UPDATE menus SET dishes = array_append(dishes, $1) WHERE id = $2;',
                [dishID, menuID]
                );
            }
            if (dish.rows.length!==0){
                //console.error('Unable add dish, error: ', 'This type of dish already has been added.');
                const typeErrMsg = 'This type of dish already has been added.';
                throw new Error(typeErrMsg);
            
            }
            
        } catch(error) {
            console.error('Unable add tasks, error: ', error);
             return Promise.reject({
                type: 'internal',
                error
            });
        }
    }
    async deleteTask({ dishID } = {dishID: null}) {
        if (!dishID) {
            const errMsg = `Delete dish error: wrong params (dishID: ${dishID})`;
            console.error(errMsg);
            return Promise.reject({
                type: 'client',
                error: new Error(errMsg)
            });
        }
        try {
            const queryResult = await this.#dbClient.query(
            'SELECT menus_id FROM dishes WHERE id = $1;', [dishID]);

            const {menus_id: menuID} = queryResult.rows[0];
            
            await this.#dbClient.query(
                'DELETE FROM dishes WHERE id = $1;', [dishID]
            );
            await this.#dbClient.query(
                'UPDATE menus SET dishes = array_remove(dishes, $1) WHERE id = $2;', [dishID, menuID]
            );
        } catch (error){
            console.error('Unable delete dish, error: ', error);
             return Promise.reject({
                type: 'internal',
                error
            });
        }
    }
    async updateTask({
        dishID,
        name = '',
        newType = ''
    } = {
        dishID: null,
        name: '',
        newType: ''
    }) {
        if (!dishID || (!name && !newType)){
            const errMsg = `Update task error: wrong params (dishID: ${dishID}, name: ${name}, newType: ${newType})`;
            console.error(errMsg);
            return Promise.reject({
                type: 'client',
                error: new Error(errMsg)
            });
        }
        
        let query = null;
        const queryParams = [];


        if(name && newType){
            query = 'UPDATE dishes SET name = $1, type = $2 WHERE id = $3;';
            queryParams.push(name, newType, dishID);
        }else if(name){
            query = 'UPDATE dishes SET name = $1 WHERE id = $2;';
            queryParams.push(name, dishID);
        }else{
            query = 'UPDATE dishes SET type = $1 WHERE id = $2;';
            queryParams.push(newType, dishID);
        }
        try {
            await this.#dbClient.query(query, queryParams);
        }catch (error){
            console.error('Unable update tasks, error: ', error);
             return Promise.reject({
                type: 'internal',
                error
            });
        }
    }
    async moveTask(
    {
        dishID, 
        srcTasklistID, 
        destTasklistID } = 
        { 
            dishID: null, 
            srcTasklistID: null, 
            destTasklistID: null
    }) {
        if (!dishID || !srcTasklistID || !destTasklistID){
            const errMsg = `Move task error: wrong params (dishID: ${dishID}, srcTasklistID : ${srcTasklistID}, destTasklistID: ${destTasklistID})`;
            console.error(errMsg);
            return Promise.reject({
                type: 'client',
                error: new Error(errMsg)
            });
        }
        
        try{
            await this.#dbClient.query(
                'UPDATE dishes SET menus_id = $1 WHERE id = $2;', [destTasklistID, dishID]
            );
            await this.#dbClient.query(
                'UPDATE menus SET dishes = array_append(dishes, $1) WHERE id = $2;', [dishID, destTasklistID]
            );
            await this.#dbClient.query(
                'UPDATE menus SET dishes = array_remove(dishes, $1) WHERE id = $2;', [dishID, srcTasklistID]
            );
        } catch (error){
            console.error('Unable move task, error: ', error);
             return Promise.reject({
                type: 'internal',
                error
            });
        }
    }

}