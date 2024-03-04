import Tasklist from './Tasklist';
//
import AppModel from '../model/AppModel';

export default class App{

    #menus = [];
    

    onAddNewMenu = async ( weekday ) => {
        const menuID = crypto.randomUUID();
            
        try{
                const addTasklistResult = await AppModel.addTasklist({
                    menuID,
                    week_day: weekday,//event.target.value , 
                    position: this.#menus.length
                });
                

                var variant_;

                if(addTasklistResult.length+1 > 1){
                    variant_ = addTasklistResult.length+1;

                    if(addTasklistResult.length+1 === 2){
                        document.querySelector(`[id="${addTasklistResult[0].id}"] h1.tasklist_name`).innerHTML = '1';
                    }
                }else{
                    variant_=null;
                }
                const newTasklist = new Tasklist({
                    menuID,
                    week_day:  weekday,//event.target.value,
                    variant: variant_,
                    position: this.#menus.length,
                    onDropTaskInTasklist: this.onDropTaskInTasklist,
                    addNotification: this.addNotification,
                    onEditTasklist: this.onEditTasklist,
                    onDeleteTasklist: this.onDeleteTasklist,
                    onDeleteTask: this.onDeleteTask,
                    onEditTask: this.onEditTask,
                });
                this.#menus.push(newTasklist);
                newTasklist.render();
                
                

                //console.log(addTasklistResult);
                //this.addNotification({ text: addTasklisResult.message, type:'success'});
        } catch(err){
                //this.addNotification({text.err.message, type:'error'});
                console.error(err);
        }
        const dropdown = document.querySelector('.dropdown-add-menu');
        dropdown.style.display = 'none';
        document.querySelector ('.tasklist-adder_btn')
            .style.display = 'inherit';
        
    };
    onEditTasklist = async ({ menuID, newWeekDay, type_of_update }) => {
        
        let fMenu = null;
        for (let menu of this.#menus) {
            fMenu=menu;
            if(menuID===fMenu.menuID)
                break; 
        }

        const curWeekDay = fMenu.menuWeekDay;

        const curVariant = fMenu.menuVariant;

        //console.log(menuID);

        let newVariant = null;
        let prevWeekDay = null;
        try{
            //меняется день недели
            if(type_of_update===0){

                //const newWeekDay = prompt('Введите другой день недели');
                if (!curWeekDay || newWeekDay === curWeekDay) 
                    return;
                fMenu.menuWeekDay = newWeekDay;
                document.querySelector(`[id="${menuID}"]  h2.tasklist_name`).innerHTML = newWeekDay;

                //если остались меню в прошлом д/н по варианту большие чем ушедшее меню то их № вар уменьшить, если остался одно мню с этим днем недеели то его вариант занулитб
                if(curVariant>0){
                    let nMenu = null;
                    let n=0;
                    for (let menu of this.#menus) {
                        
                        if(curWeekDay===menu.menuWeekDay){
                            n++; 
                            if(menu.menuVariant>curVariant ){
                                document.querySelector(`[id="${menu.menuID}"]  h1.tasklist_name`).innerHTML = menu.menuVariant-1;
                                menu.menuVariant = menu.menuVariant-1;
                            }
                            if(menu.menuVariant<curVariant){
                                nMenu=menu;
                            }
                        } 
                    }
                    if(n===1){
                        document.querySelector(`[id="${nMenu.menuID}"]  h1.tasklist_name`).innerHTML = null;
                        nMenu.menuVariant = null;
                        
                    }
                    if(n>0){
                        prevWeekDay=curWeekDay;
                    }
                }


                newVariant = await AppModel.updateTasklist({ menuID, week_day: newWeekDay, prev_week_day: prevWeekDay, variant:curVariant, prev_variant: null, type_of_update });

                if(newVariant===1){
                    newVariant=null;
                }else if(newVariant===2){
                    let nMenu = null;
                    for (let menu of this.#menus) {
                        nMenu=menu
                        if(newWeekDay===nMenu.menuWeekDay && nMenu.menuID!==menuID)
                            break; 
                    }
                    nMenu.menuVariant=1;
                    document.querySelector(`[id="${nMenu.menuID}"]  h1.tasklist_name`).innerHTML = '1';
                }
                

            }else{
                newVariant = parseInt(prompt('Введите новый вариант'));
           
                if (!curVariant || newVariant === curVariant) return;
                let prevVariant = curVariant;

                
                let menu_id=0;
                for (let menu of this.#menus) {
                    if(newVariant===menu.menuVariant && curWeekDay === menu.menuWeekDay){
                        menu.menuVariant = curVariant;
                        menu_id=menu.menuID;                     
                    }
                }
                if(menu_id===0){
                    return;
                }

                fMenu.menuVariant = newVariant;


                document.querySelector(`[id="${menu_id}"]  h1.tasklist_name`).innerHTML = curVariant;
                
                console.log(newVariant, curVariant);



                await AppModel.updateTasklist({ menuID, week_day: curWeekDay, prev_week_day:null, variant:newVariant, prev_variant:prevVariant,type_of_update });
            }
            
            document.querySelector(`[id="${menuID}"]  h1.tasklist_name`).innerHTML = newVariant;

        
        } catch (err) {
            
            console.error(err);
        }
        
    };
    onEditTask = async ({ dishID, newType }) => {

        let fTask = null;
        let fTasklist =null;
        for (let tasklist of this.#menus) {
            fTask = tasklist.getTaskById({ dishID });
            if (fTask) { 
                fTasklist = tasklist; 
                break; 
            }
        }
        let dishes = fTasklist.dishes;
        for(let dish of dishes){
            if(fTask!==dish){
                if(dish.dishType === newType){
                    alert("Такой тип блюда уже есть");
                    return;
                }
            }
        }
        
        const curTaskText = fTask.dishName;
        const newTaskText = prompt('Введите новое название блюда');
       
        if (!newTaskText || newTaskText === curTaskText) return;


        try{
            fTask.dishName = newTaskText;
            document.querySelector(`[id="${dishID}"] span.task_text`).innerHTML = newTaskText;

            fTask.dishType = newType;
            document.querySelector(`[id="${dishID}"] span.task_type`).innerHTML = newType;

            const updateTaskResult = await AppModel.updateTask({ dishID, name: newTaskText, newType });
            console.log(updateTaskResult);

            let TaskElement = document.getElementById(dishID);
            console.log(TaskElement);

            let elems = document.querySelectorAll(`[id="${fTasklist.menuID}"] .task_type`);//все позиции
            let salad=null, soup=null, main=null, dessert=null, drink=null;
            for(let elem of elems){
                if (elem.innerHTML==='Salad') salad=elem.parentElement; //elem - span, elem.parent - li
                else if (elem.innerHTML==='Soup') soup=elem.parentElement;
                else if (elem.innerHTML==='Main dish') main=elem.parentElement;
                else if (elem.innerHTML==='Dessert') dessert=elem.parentElement;
                else if (elem.innerHTML==='Drink') drink=elem.parentElement;
            }
            let referencedElement=null;
            if(newType==='Salad'){
                if(soup) referencedElement = soup;
                else if(main) referencedElement = main;
                else if(dessert) referencedElement = dessert;
                else if(drink) referencedElement = drink;
            }else if(newType==='Soup'){
                if(main) referencedElement = main;
                else if(dessert) referencedElement = dessert;
                else if(drink) referencedElement = drink;
            }else if(newType==='Main dish'){
                if(dessert) referencedElement = dessert;
                else if(drink) referencedElement = drink;
            }
            else if(newType==='Dessert'){
                if(drink) referencedElement = drink;
            }
            document.querySelector(`[id="${fTasklist.menuID}"] .tasklist_tasks-list`).removeChild(TaskElement);
            document.querySelector(`[id="${fTasklist.menuID}"] .tasklist_tasks-list`)
                .insertBefore(TaskElement, referencedElement);
        } catch (err) {
            //this.addNotification({text:err.message, type:'error'});
            console.error(err);
        }
        
    };
    onDeleteTasklist = async ({ menuID }) => {
        let fMenu = null;
        for (let menu of this.#menus) {
            if(menuID === menu.menuID) fMenu = menu;
            if (fMenu) break;
        }
        let n=0;
        let tMenu = null;
        for (let menu of this.#menus) {
            if(fMenu.menuWeekDay === menu.menuWeekDay && fMenu.menuVariant<menu.menuVariant) 
                document.querySelector(`[id="${menu.menuID}"]  h1.tasklist_name`).innerHTML = menu.menuVariant-1;
            if (fMenu.menuWeekDay === menu.menuWeekDay){
                n++;
                if(fMenu!==menu)
                    tMenu = menu;

            }
        }
        if(n===2){
            document.querySelector(`[id="${tMenu.menuID}"]  h1.tasklist_name`).innerHTML = null;
        }
        const taskShouldBeDeleted = confirm(`Меню будет удалено. Продолжить?`);
        if (!taskShouldBeDeleted) return; 
        try {
            const deleteTasklistResult = await AppModel.deleteTasklist({ menuID });
            this.#menus.splice(fMenu, 1);
            document.getElementById(menuID).remove();
            console.log(deleteTasklistResult)
        } catch(err) {
            console.error(err);
        }
 
    };
    onDeleteTask = async ({ dishID }) => {
        let fTask = null;
        let fTasklist = null;
        for (let tasklist of this.#menus) {
            fTasklist = tasklist;
            fTask = tasklist.getTaskById({ dishID });
            if (fTask) break;
        }
        const taskShouldBeDeleted = confirm(`Позиция будет удалена. Продолжить?`);
        if (!taskShouldBeDeleted) return; 

        try {
            const deleteTaskResult = await AppModel.deleteTask({ dishID });
            fTasklist.deleteTask({ dishID });
            document.getElementById(dishID).remove();
            
            //this.addNotification({text: deleteTaskResult.message, type:'success'});
            console.log(deleteTaskResult)
        } catch(err) {
            //this.addNotification({ text:err.message, type:'error'});
            console.error(err);
            //console.log(deleteTaskResult)
        }

    };
    onDropTaskInTasklist = async (evt) => {
        
        evt.stopPropagation();

        const destTasklistElement = evt.currentTarget; 
        destTasklistElement.classList.remove('tasklist_droppable');
        
        const movedTaskID = localStorage.getItem('movedTaskID');
        const srcTasklistID = localStorage.getItem('srcTasklistID');
        const destTasklistID = destTasklistElement.getAttribute('id');

        localStorage.setItem('movedTaskID', '');
        localStorage.setItem('srcTasklistID', '');

        if(!destTasklistElement.querySelector(`[id="${movedTaskID}"]`)) return;

        const srcTasklist = this.#menus.find(menu => menu.menuID === srcTasklistID);
        const destTasklist = this.#menus.find(menu => menu.menuID === destTasklistID);

        try{
            if (srcTasklistID !== destTasklistID) {
                await AppModel.moveTask({ dishID: movedTaskID, srcTasklistID, destTasklistID });
                
                const movedTask = srcTasklist.deleteTask({ dishID: movedTaskID });
                
                destTasklist.pushTask({ dish: movedTask });
    
            }
            console.log('блюдо перемещено')
        } catch (err) {
            console.error(err);
        }
        
        /*const destTasksIDs = Array.from(
            destTasklistElement.querySelector('.tasklist_tasks-list').children,
            elem=>elem.getAttribute('id')
        );

        destTasksIDs.forEach((taskID, position)=>{
            destTasklist.getTaskById({taskID}).taskPosition = position;
        });
        console.log(this.#tasklists);*/
        

    };

    initNotifications(){
        let notifications = document.getElementById('app-notifications');
        notifications.show();
    };

    addNotification = ({text, type}) => {
        let notifications = document.getElementById('app-notifications');

        const notificationID = crypto.randomUUID();
        const notification = document.createElement('div');
        notification.classList.add('notification', type==='success' ? 'notification-success' : 'notification-error');
        notification.setAttribute('id', notificationID);
        notification.innerHTML = text;
        notifications.appendChild(notification);
        setTimeout(()=>{document.getElementById(notificationID).remove();}, 5000);
    };

    
    async init(){
        document.querySelector('.tasklist-adder_btn')
            .addEventListener(
                'click',
                (event) => {
                    event.target.style.display = 'none';
                    const dropdown = document.querySelector('.dropdown-add-menu');
                    dropdown.style.display = 'inherit';
                    dropdown.focus();
                }
            );

        const aMonday = document.querySelector('.mon-weekday');
        const aTuesday = document.querySelector('.tue-weekday');
        const aWednesday = document.querySelector('.wed-weekday');
        const aThursday = document.querySelector('.thu-weekday');
        const aFriday = document.querySelector('.fri-weekday');
        const aSaturday = document.querySelector('.sat-weekday');
        const aSunday = document.querySelector('.sun-weekday');

        aMonday.addEventListener('click', event => {
                const dropdown = document.getElementsByClassName('dropdown-add-menu')[0];//document.querySelector('.dropdown');
                dropdown.style.display = 'none';
                this.onAddNewMenu(event.target.innerHTML);
            }   
        );
        aTuesday.addEventListener('click', event => {
                const dropdown = document.getElementsByClassName('dropdown-add-menu')[0];//document.querySelector('.dropdown');
                dropdown.style.display = 'none';
                this.onAddNewMenu( event.target.innerHTML);
            }   
        );
        aWednesday.addEventListener('click', event => {
                const dropdown = document.getElementsByClassName('dropdown-add-menu')[0];//document.querySelector('.dropdown');
                dropdown.style.display = 'none';
                this.onAddNewMenu( event.target.innerHTML);
            }   
        );
        aThursday.addEventListener('click', event => {
                const dropdown = document.getElementsByClassName('dropdown-add-menu')[0];//document.querySelector('.dropdown');
                dropdown.style.display = 'none';
                this.onAddNewMenu( event.target.innerHTML);
            }   
        );
        aFriday.addEventListener('click', event => {
                const dropdown = document.getElementsByClassName('dropdown-add-menu')[0];//document.querySelector('.dropdown');
                dropdown.style.display = 'none';
                this.onAddNewMenu( event.target.innerHTML);
            }   
        );
        aSaturday.addEventListener('click', event => {
                const dropdown = document.getElementsByClassName('dropdown')[0];//document.querySelector('.dropdown');
                dropdown.style.display = 'none';
                this.onAddNewMenu( event.target.innerHTML);
            }   
        );
        aSunday.addEventListener('click', event => {
                const dropdown = document.getElementsByClassName('dropdown')[0];//document.querySelector('.dropdown');
                dropdown.style.display = 'none';
                this.onAddNewMenu(event.target.innerHTML);
            }   
        );

       

        document.getElementById('theme-switch')
            .addEventListener('change', (evt)=>{
            (evt.target.checked
                ? document.body.classList.add('dark-theme')
                : document.body.classList.remove('dark-theme'));
            });

        this.initNotifications();

        document.addEventListener('dragover', (evt) => {
            evt.preventDefault();
            
            const draggedElement = document.querySelector('.task.task_selected');
            const draggedElementPrevList = draggedElement.closest('.tasklist');
            
            const currentElement=evt.target;
            const prevDroppable = document.querySelector('.tasklist_droppable');
            let curDroppable = evt.target;
            while(!curDroppable.matches('.tasklist') && curDroppable !== document.body){
                curDroppable = curDroppable.parentElement;
            }

            if (curDroppable !== prevDroppable) {
                if (prevDroppable) prevDroppable.classList.remove('tasklist_droppable');
                
                if(curDroppable.matches('.tasklist')){
                    curDroppable.classList.add('tasklist_droppable');
                }
                
            }

            if (!curDroppable.matches('.tasklist') || draggedElement === currentElement) return;
            
            if(curDroppable === draggedElementPrevList){
                return;
            }
            if (currentElement.matches('.task')){
                
                let elems = curDroppable.querySelectorAll('.task_type');
                let type = draggedElement.querySelector('.task_type').innerHTML;
                let salad=null, soup = null, main=null, dessert=null, drink=null;
                for(let elem of elems){
                    if (elem.innerHTML==='Salad') salad=elem.parentElement; //elem - span, elem.parent - li
                    else if (elem.innerHTML==='Soup') soup=elem.parentElement;
                    else if (elem.innerHTML==='Main dish') main=elem.parentElement;
                    else if (elem.innerHTML==='Dessert') dessert=elem.parentElement;
                    else if (elem.innerHTML==='Drink') drink=elem.parentElement;
                }
                let referencedElement=null;
                if(type==='Salad'){
                    if(soup) referencedElement = soup;
                    else if(main) referencedElement = main;
                    else if(dessert) referencedElement = dessert;
                    else if(drink) referencedElement = drink;
                }else if(type==='Soup'){
                    if(main) referencedElement = main;
                    else if(dessert) referencedElement = dessert;
                    else if(drink) referencedElement = drink;
                }else if(type==='Main dish'){
                    if(dessert) referencedElement = dessert;
                    else if(drink) referencedElement = drink;
                }
                else if(type==='Dessert'){
                    if(drink) referencedElement = drink;
                }
                
                curDroppable.querySelector('.tasklist_tasks-list')
                    .insertBefore(draggedElement, referencedElement);
                
                return;
                
            }
            
            if(!curDroppable.querySelector('.tasklist_tasks-list').children.length){
                curDroppable.querySelector('.tasklist_tasks-list')
                    .appendChild(draggedElement);
            }
        });

        try{
            const menus = await AppModel.getTasklists();
            for (const menu of menus){
                const menuObj = new Tasklist({
                    menuID: menu.menuID,
                    week_day: menu.week_day,
                    variant: menu.variant,
                    position: menu.position,
                    onEditTasklist: this.onEditTasklist,
                    onDeleteTasklist:this.onDeleteTasklist,
                    onDeleteTask:this.onDeleteTask,
                    onEditTask: this.onEditTask,
                    onDropTaskInTasklist: this.onDropTaskInTasklist,
                    addNotification: this.addNotification
                });
                this.#menus.push(menuObj);
                menuObj.render();
                
                for(const dish of menu.dishes){
                    menuObj.addNewTaskLocal({
                        dishID: dish.dishID,
                        name: dish.name,
                        type: dish.type
                    });
                    

                }
            }
        } catch(err){
            console.error(err);
        }
    }
};
