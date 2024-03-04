import AppModel from '../model/AppModel';
import Task from './Task';

	
export default class Tasklist {
	
	#dishes = [];
	#menuID = null;
    #menuWeekDay='';
    #menuVariant;
    #menuPosition =-1;
    
    constructor({
    	menuID = null,
       	week_day, 
       	variant,
        position,
        onEditTasklist,
        onDeleteTasklist, 
        onDeleteTask,
        onEditTask,
        onDropTaskInTasklist,
        addNotification
    }) {
    	this.#menuWeekDay = week_day;
        this.#menuID = menuID || crypto.randomUUID();
        this.#menuPosition = position;
        this.#menuVariant = variant;
        this.onEditTasklist = onEditTasklist;
        this.onDeleteTasklist = onDeleteTasklist;
        this.onDeleteTask = onDeleteTask;
        this.onEditTask=onEditTask;
        this.onDropTaskInTasklist = onDropTaskInTasklist;
        this.addNotification = addNotification;
    }

	get menuID() { return this.#menuID; }

	get menuWeekDay() {return this.#menuWeekDay;}

	set menuWeekDay(value) {
        if (typeof value === 'string') {
            this.#menuWeekDay = value;
        }
    }

    get dishes(){
    	return this.#dishes;
    }

    get menuVariant() {return this.#menuVariant;}

    set menuVariant(value) {
        
          this.#menuVariant = value;
        
    }

	pushTask = ({ dish }) => this.#dishes.push(dish);

	get tasklistPosition() { return this.#menuPosition; } 

	getTaskById = ({ dishID }) => this.#dishes.find(dish => dish.dishID === dishID);

	deleteTask = ({ dishID }) => {
			const deleteTaskIndex = this.#dishes.findIndex(dish => dish.dishID === dishID);
			if (deleteTaskIndex === -1) return;
			const [deletedTask] = this.#dishes.splice(deleteTaskIndex, 1);
			return deletedTask;
	};	


	reorderTasks = async () => {
		
		const orderedTasksIDs = Array.from(
			document.querySelector(`[id="${this.#menuID}"] .tasklist_tasks-list`).children,
			elem => elem.getAttribute('id')
		);

		const reorderedTasksInfo = [];

		orderedTasksIDs.forEach((dishID, position) => {
			const dish = this.#dishes.find(dish => dish.dishID === dishID);
			if (dish.taskPosition !== position) {
				dish.taskPosition = position; 
				reorderedTasksInfo.push({ dishID, position });
			}
		});

		if (reorderedTasksInfo.length > 0) {
			try{
			 	await AppModel.updateTasks({ reorderedTasks: reorderedTasksInfo });
			} catch(err) {
				//this.addNotification({ text: err.message, type: 'error' }):
				console.error(err);
			}
		}
		
	};

	onAddNewTask = async (type) => {
        //берем тип и название 
        const newDishName = prompt('Введите название блюда:');
        if (!newDishName) return;
        try {
            const _dishID = crypto.randomUUID();

            const addTaskResult = await AppModel.addTask({
                dishID: _dishID, 
                name: newDishName, 
                type: type,
                menuID: this.#menuID
            });
            
           	
                this.addNewTaskLocal({
                dishID: _dishID,
                name: newDishName,
                type: type,
                });
            
            
            console.log(addTaskResult);
            //this.addNotification({ text: addTaskResult.message, type: 'success' });
        } catch(err) {
            this.addNotification({ text: err.message, type: 'error' });
            console.error(err);
        }
        
    };
	
	addNewTaskLocal = ({ dishID = null, name, type }) => {
		const newTask = new Task({
			dishID,
			name,
			type, 
			onEditTask: this.onEditTask, 
			onDeleteTask: this.onDeleteTask
		});
		this.#dishes.push(newTask);

		const newTaskElement = newTask.render();

		let elems = document.querySelectorAll(`[id="${this.#menuID}"] .task_type`);

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
		
		document.querySelector(`[id="${this.#menuID}"] .tasklist_tasks-list`)
			.insertBefore(newTaskElement, referencedElement);
			
	};
	
	render() {
		const liElement = document.createElement('li'); 
		liElement.classList.add(
		'tasklists-list_item',
		'tasklist'
		);
		liElement.setAttribute('id', this.#menuID);
		
		liElement.addEventListener('dragstart', (evt) => {
				localStorage.setItem('srcTasklistID', this.#menuID);
			}
		);
		
		liElement.addEventListener('dragend', (evt)=>{
			evt.target.classList.remove('task_selected');
		});

		liElement.addEventListener('drop', this.onDropTaskInTasklist);

		
		const controlsDiv = document.createElement('div');
        controlsDiv.classList.add('task_controls');

        const upperRowDiv = document.createElement('div');
        upperRowDiv.classList.add('task_controls-row');

		const h2Element = document.createElement('h2');
		h2Element.classList.add('tasklist_name');
		h2Element.innerHTML = this.#menuWeekDay;
		upperRowDiv.appendChild(h2Element);

		const editBtn = document.createElement('button');
        editBtn.setAttribute('type', 'button');
        editBtn.classList.add('task_control-btn', 'edit-icon');
        editBtn.addEventListener('click', event => {
                const dropdown = document.querySelector(`[id="${this.#menuID}"] .dropdown-edit`);//document.querySelector('.dropdown');
                dropdown.style.display = 'inherit';
            } 
        );

        upperRowDiv.appendChild(editBtn);
        
		
        
        const dropdown_edit = document.createElement('div');
		dropdown_edit.classList.add('dropdown-edit');
		dropdown_edit.id = this.menuID;

		const dropdown_button_edit = document.createElement('button');
		dropdown_button_edit.classList.add('dropbtn');
		dropdown_button_edit.innerHTML = 'Choose new week day';

		const dropdownContent_edit = document.createElement('div');
		dropdownContent_edit.classList.add('dropdown-content');

		const aMonday = document.createElement('a');
		aMonday.innerHTML = 'Monday';
		const aTuesday = document.createElement('a');
		aTuesday.innerHTML = 'Tuesday';
		const aWednesday = document.createElement('a');
		aWednesday.innerHTML = 'Wednesday';
		const aThursday = document.createElement('a');
		aThursday.innerHTML = 'Thursday';
		const aFriday = document.createElement('a');
		aFriday.innerHTML = 'Friday';
		const aSaturday = document.createElement('a');
		aSaturday.innerHTML = 'Saturday';
		const aSunday = document.createElement('a');
		aSunday.innerHTML = 'Sunday';


		dropdownContent_edit.appendChild(aMonday);
		dropdownContent_edit.appendChild(aTuesday);
		dropdownContent_edit.appendChild(aFriday);
		dropdownContent_edit.appendChild(aWednesday);
		dropdownContent_edit.appendChild(aThursday);
		dropdownContent_edit.appendChild(aSaturday);
		dropdownContent_edit.appendChild(aSunday);

		dropdown_edit.appendChild(dropdownContent_edit);
		dropdown_edit.appendChild(dropdown_button_edit);
		//upperRowDiv.appendChild(dropdown_edit);


		aMonday.addEventListener('click', event => {
				const dropdown = document.querySelector(`[id="${this.#menuID}"] .dropdown-edit`);

                //const dropdown = document.getElementsByClassName('dropdown-edit')[0];//document.querySelector('.dropdown');
                dropdown.style.display = 'none';
                this.onEditTasklist({menuID: this.#menuID, newWeekDay:event.target.innerHTML, type_of_update:0});

			} 	
		);
		aTuesday.addEventListener('click', event => {
                const dropdown = document.querySelector(`[id="${this.#menuID}"] .dropdown-edit`);
                dropdown.style.display = 'none';
                this.onEditTasklist({menuID: this.#menuID, newWeekDay:event.target.innerHTML, type_of_update:0});
			} 	
		);
		aWednesday.addEventListener('click', event => {
                const dropdown = document.querySelector(`[id="${this.#menuID}"] .dropdown-edit`);
                dropdown.style.display = 'none';
                this.onEditTasklist({menuID: this.#menuID, newWeekDay:event.target.innerHTML, type_of_update:0});
			} 	
		);
		aThursday.addEventListener('click', event => {
                const dropdown = document.querySelector(`[id="${this.#menuID}"] .dropdown-edit`);
                dropdown.style.display = 'none';
                this.onEditTasklist({menuID: this.#menuID, newWeekDay:event.target.innerHTML, type_of_update:0});
			} 	
		);
		aFriday.addEventListener('click', event => {
                const dropdown = document.querySelector(`[id="${this.#menuID}"] .dropdown-edit`);
                dropdown.style.display = 'none';
                this.onEditTasklist({menuID: this.#menuID, newWeekDay:event.target.innerHTML, type_of_update:0});
			} 	
		);
		aSunday.addEventListener('click', event => {
                const dropdown = document.querySelector(`[id="${this.#menuID}"] .dropdown-edit`);
                dropdown.style.display = 'none';
                this.onEditTasklist({menuID: this.#menuID, newWeekDay:event.target.innerHTML, type_of_update:0});
			} 	
		);
		aSaturday.addEventListener('click', event => {
                const dropdown = document.querySelector(`[id="${this.#menuID}"] .dropdown-edit`);
                dropdown.style.display = 'none';
                this.onEditTasklist({menuID: this.#menuID, newWeekDay:event.target.innerHTML, type_of_update:0});
			} 	
		);



		const h1Element = document.createElement('h1');
		h1Element.classList.add('tasklist_name');
		if (this.#menuVariant !== null){
			h1Element.innerHTML =  this.#menuVariant;
		};
		upperRowDiv.appendChild(h1Element);

        const editBtnV = document.createElement('button');
        editBtnV.setAttribute('type', 'button');
        editBtnV.classList.add('task_control-btn', 'edit-icon');
        editBtnV.addEventListener('click', ()=> this.onEditTasklist({menuID: this.#menuID, type_of_update:1}) );
        upperRowDiv.appendChild(editBtnV);

        const deleteBtn = document.createElement('button');
        deleteBtn.setAttribute('type', 'button');
        deleteBtn.classList.add('task_control-btn', 'delete-icon');
        deleteBtn.addEventListener('click', ()=> this.onDeleteTasklist({menuID: this.#menuID}));
        controlsDiv.appendChild(deleteBtn);
        controlsDiv.appendChild(upperRowDiv);
        
        liElement.appendChild(controlsDiv);
        liElement.appendChild(dropdown_edit);

		const innerUlElement = document.createElement('ul');
		innerUlElement.classList.add('tasklist_tasks-list');
		liElement.appendChild(innerUlElement);

		const button = document.createElement('button');
		button.setAttribute( 'type', 'button'); 
		button.classList.add('tasklist_add-task-btn');
		button.innerHTML = '&#10010 Add dish';
		button.addEventListener('click', event => {
                const dropdown = document.getElementById(this.#menuID).getElementsByClassName('dropdown')[0];
                dropdown.style.display = 'inherit';
                dropdown.focus();
			} 	
		);


		const dropdown_div = document.createElement('div');
		dropdown_div.classList.add('dropdown');
		dropdown_div.id = this.menuID;

		const dropdown_button = document.createElement('button');
		dropdown_button.classList.add('dropbtn');
		dropdown_button.innerHTML = 'Choose meal type';

		const dropdownContent_div = document.createElement('div');
		dropdownContent_div.classList.add('dropdown-content');

		const saladType_a = document.createElement('a');
		saladType_a.innerHTML = 'Salad';
		const soupType_a = document.createElement('a');
		soupType_a.innerHTML = 'Soup';
		const mainType_a = document.createElement('a');
		mainType_a.innerHTML = 'Main dish';
		const drinkType_a = document.createElement('a');
		drinkType_a.innerHTML = 'Drink';
		const dessertType_a = document.createElement('a');
		dessertType_a.innerHTML = 'Dessert';


		dropdownContent_div.appendChild(saladType_a);
		dropdownContent_div.appendChild(soupType_a);
		dropdownContent_div.appendChild(mainType_a);
		dropdownContent_div.appendChild(drinkType_a);
		dropdownContent_div.appendChild(dessertType_a);

		dropdown_div.appendChild(dropdownContent_div);
		dropdown_div.appendChild(dropdown_button);


		drinkType_a.addEventListener('click', event => {
                const dropdown = document.getElementById(this.#menuID).getElementsByClassName('dropdown')[0];//document.querySelector('.dropdown');
                dropdown.style.display = 'none';
                this.onAddNewTask(event.target.innerHTML);

			} 	
		);
		soupType_a.addEventListener('click', event => {
                const dropdown = document.getElementById(this.#menuID).getElementsByClassName('dropdown')[0];//document.querySelector('.dropdown');
                dropdown.style.display = 'none';
                this.onAddNewTask( event.target.innerHTML);
			} 	
		);
		mainType_a.addEventListener('click', event => {
                const dropdown = document.getElementById(this.#menuID).getElementsByClassName('dropdown')[0];//document.querySelector('.dropdown');
                dropdown.style.display = 'none';
                this.onAddNewTask( event.target.innerHTML);
			} 	
		);
		dessertType_a.addEventListener('click', event => {
                const dropdown = document.getElementById(this.#menuID).getElementsByClassName('dropdown')[0];//document.querySelector('.dropdown');
                dropdown.style.display = 'none';
                this.onAddNewTask( event.target.innerHTML);
			} 	
		);
		saladType_a.addEventListener('click', event => {
                const dropdown = document.getElementById(this.#menuID).getElementsByClassName('dropdown')[0];//document.querySelector('.dropdown');
                dropdown.style.display = 'none';
                this.onAddNewTask( event.target.innerHTML);
			} 	
		);




		liElement.appendChild(dropdown_div);
		liElement.appendChild(button);

		const adderElement = document.querySelector('.tasklist-adder');
		adderElement.parentElement.insertBefore(liElement, adderElement);
	}
};