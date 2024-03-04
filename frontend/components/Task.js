export default class Task{

    #dishID = null;
    #dishName = '';
    #dishType = '';
    
    constructor({
        dishID = null,
        name,
        type,
        onEditTask,
        onDeleteTask,

    }) {
        this.#dishID = dishID || crypto.randomUUID();
        this.#dishName = name;
        this.#dishType = type;
        this.onEditTask = onEditTask;
        this.onDeleteTask = onDeleteTask;
    }
    
    get dishID() {return this.#dishID;}
    
    get dishName() {return this.#dishName;}
    
    set dishName(value) {
        if (typeof value === 'string') {
            this.#dishName = value;
        }
    }
    
    get dishType() { return this.#dishType; }

    set dishType(value){
        if (typeof value === 'string'){
            this.#dishType = value;
        }
    }

    render(){

        const liElement = document.createElement('li');
        liElement.classList.add('tasklist_tasks-list-item', 'task');
        liElement.setAttribute('id', this.#dishID);

        
        liElement.setAttribute('draggable', true);
        liElement.addEventListener('dragstart', (evt) => {
            evt.target.classList.add('task_selected');
            localStorage.setItem('movedTaskID', this.#dishID);
            
        });
        liElement.addEventListener('dragend', (evt) => evt.target.classList.remove('task_selected'));
        
            
        const span_name = document.createElement('span');
        span_name.classList.add('task_text');
        span_name.innerHTML = this.#dishName;
        liElement.appendChild(span_name);

        const span_type = document.createElement('span');
        span_type.classList.add('task_text');
        span_type.classList.add('task_type');
        span_type.innerHTML = this.#dishType;
        liElement.appendChild(span_type);
        
        const controlsDiv = document.createElement('div');
        controlsDiv.classList.add('task_controls');
        

        const lowerRowDiv = document.createElement('div');
        lowerRowDiv.classList.add('task_controls-row');

            
        const editBtn = document.createElement('button');
        editBtn.setAttribute('type', 'button');
        editBtn.classList.add('task_control-btn', 'edit-icon');
        editBtn.addEventListener('click', 
            event=>{
                const dropdown = document.getElementById(this.#dishID).getElementsByClassName('dropdown_task')[0];//document.querySelector('.dropdown');
                
                let elems = event.target.parentElement.parentElement.parentElement.children;
                for(let elem of elems){
                    elem.style.display = 'none';
                }
                
                dropdown.style.display = 'block';
                dropdown.focus();

            }   
            //()=> this.onEditTask({dishID: this.#dishID}) 

            
            /*{localStorage.setItem('editTaskID', this.#taskID);
            document.getElementById('modal-edit-task').showModal();}*/
            
        );
        lowerRowDiv.appendChild(editBtn);
        
        const deleteBtn = document.createElement('button');
        deleteBtn.setAttribute('type', 'button');
        deleteBtn.classList.add('task_control-btn', 'delete-icon');
        deleteBtn.addEventListener('click', ()=> this.onDeleteTask({dishID: this.#dishID})
            /*{localStorage.setItem('deleteTaskID', this.#taskID);
            const deleteTaskModal = document.getElementById('modal-delete-task');
            deleteTaskModal.querySelector('.app-modal_question')
                .innerHTML = `Задача '${this.#taskText}' будет удалена. Продолжить?`;
                
            deleteTaskModal.showModal();}*/
            
        );


        lowerRowDiv.appendChild(deleteBtn);
        controlsDiv.appendChild(lowerRowDiv);
        liElement.appendChild(controlsDiv);

    
            const dropdown_div = document.createElement('div');
            dropdown_div.classList.add('dropdown_task');
            dropdown_div.id = this.dishID;

            const dropdown_button = document.createElement('button');
            dropdown_button.classList.add('dropbtn');
            dropdown_button.innerHTML = 'Choose new meal type';

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
                    const dropdown = document.getElementById(this.#dishID).getElementsByClassName('dropdown_task')[0];//document.querySelector('.dropdown');
                    this.onEditTask({dishID:this.#dishID, newType:event.target.innerHTML});
                   
                    let elems = event.target.parentElement.parentElement.parentElement.children
                    for(let elem of elems){
                        elem.style.display = 'inherit';
                    }
                    dropdown.style.display = 'none';
                }   
            );
            soupType_a.addEventListener('click', event => {
                    const dropdown = document.getElementById(this.#dishID).getElementsByClassName('dropdown_task')[0];//document.querySelector('.dropdown');
                    this.onEditTask({dishID:this.#dishID, newType:event.target.innerHTML});
                   
                    let elems = event.target.parentElement.parentElement.parentElement.children
                    for(let elem of elems){
                        elem.style.display = 'inherit';
                    }
                    dropdown.style.display = 'none';
                }   
            );
            mainType_a.addEventListener('click', event => {
                    const dropdown = document.getElementById(this.#dishID).getElementsByClassName('dropdown_task')[0];//document.querySelector('.dropdown');
                    this.onEditTask({dishID:this.#dishID, newType:event.target.innerHTML});
                   
                    let elems = event.target.parentElement.parentElement.parentElement.children
                    for(let elem of elems){
                        elem.style.display = 'inherit';
                    }
                    dropdown.style.display = 'none';
                }   
            );
            dessertType_a.addEventListener('click', event => {
                    const dropdown = document.getElementById(this.#dishID).getElementsByClassName('dropdown_task')[0];//document.querySelector('.dropdown');
                    this.onEditTask({dishID:this.#dishID, newType:event.target.innerHTML});
                   
                    let elems = event.target.parentElement.parentElement.parentElement.children
                    for(let elem of elems){
                        elem.style.display = 'inherit';
                    }
                    dropdown.style.display = 'none';
                }   
            );
            saladType_a.addEventListener('click', event => {
                    const dropdown = document.getElementById(this.#dishID).getElementsByClassName('dropdown_task')[0];//document.querySelector('.dropdown');
                    this.onEditTask({dishID:this.#dishID, newType:event.target.innerHTML});
                   
                    let elems = event.target.parentElement.parentElement.parentElement.children
                    for(let elem of elems){
                        elem.style.display = 'inherit';
                    }
                    dropdown.style.display = 'none';
                }   
            );

            //const containerDiv = document.createElement('div');

            //containerDiv.appendChild(liElement);
            //containerDiv.appendChild(dropdown_div)
            liElement.appendChild(dropdown_div);
    

        return liElement;
            
    }
};