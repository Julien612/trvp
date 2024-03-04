export default class AppModel {
	static async getTasklists() {
		try {
			const tasklistsResponse = await fetch('http://localhost:5173/tasklists');
			const tasklistsBody = await tasklistsResponse.json();
			//console.log(tasklistsBody);
			if (tasklistsResponse.status !== 200) {
				return Promise.reject(tasklistsBody);
			}
			return tasklistsBody.menus;
		} catch(err) {
			return Promise.reject({
			timestamp: new Date().toISOString(),
			statusCode: 0, 
			message: err.message
			});
		}
	}
	static async addTasklist({ menuID, week_day, variant=null, position =-1 } = {menuID:null, week_day:'', variant:null,position:-1}) {
		//console.log(menuID, week_day, variant, position);
		try {
			const addTasklistResponse = await fetch(
				'http://localhost:5173/tasklists',
				{
					method: 'POST',
					body: JSON.stringify({menuID, week_day, variant, position}),
					headers: {
						'Content-Type': 'application/json'
					}
				}
			);
			const addTasklistBody = await addTasklistResponse.json();
			if  (addTasklistResponse.status !== 200){
				
				return Promise.reject(addTasklistBody);
			}
			//console.log(addTasklistBody.menus_rows[0]);
			return addTasklistBody.menus_rows;
				/*timestamp: new Date().toISOString(),
				message:`Список задач был успешно добавлен в перчень списков`*/
			
		} catch(err) {
			return Promise.reject({
				timestamp: new Date().toISOString(),
				statusCode:0,
				message:err.message
			});
		}
	}
	static async updateTasklist({menuID,week_day,prev_week_day,variant=null,prev_variant=null,type_of_update } = {menuID:null,week_day:'',prev_week_day:'',variant:null,prev_variant:null,type_of_update }) {
		try {
			const updateTasklistResponse = await fetch(
				`http://localhost:5173/tasklists/${menuID}`,
				{
					method: 'PATCH',
					body: JSON.stringify({ week_day,prev_week_day, variant, prev_variant, type_of_update }),
					headers: {
						'Content-Type': 'application/json'
					}
				}
			);
			const updateTasklistBody = await updateTasklistResponse.json();
				
			if  (updateTasklistResponse.status !== 200){
				return Promise.reject(updateTasklistBody);
			}
			//console.log(updateTasklistBody.menus_rows_length);
			return updateTasklistBody.menus_rows_length;

		} catch(err) {
			return Promise.reject({
				timestamp: new Date().toISOString(),
				statusCode:0,
				message:err.message
			});
		}
	}
	static async deleteTasklist({ menuID } = { menuID:null }){
		try {
			const deleteTasklistResponse = await fetch(
				`http://localhost:5173/tasklists/${menuID}`,
				{
					method: 'DELETE',
	
				}
			);
			if  (deleteTasklistResponse.status !== 200){
				const deleteTasklistBody = await deleteTasklistResponse.json();
				return Promise.reject(deleteTasklistBody);
			}
			return{
				timestamp: new Date().toISOString()
				
			};
		} catch(err) {
			return Promise.reject({
				timestamp: new Date().toISOString(),
				statusCode:0,
				message:err.message
			});
		}
	}
	static async deleteTask({ dishID } = { dishID:null }){
		try {
			const deleteTaskResponse = await fetch(
				`http://localhost:5173/tasks/${dishID}`,
				{
					method: 'DELETE',
	
				}
			);
			if  (deleteTaskResponse.status !== 200){
				const deleteTaskBody = await deleteTaskResponse.json();
				return Promise.reject(deleteTaskBody);
			}
			return{
				timestamp: new Date().toISOString(),
				message:`'${dishID}' было успешно удалено`
			};
		} catch(err) {
			return Promise.reject({
				timestamp: new Date().toISOString(),
				statusCode:0,
				message:err.message
			});
		}
	}
	static async addTask({ dishID, name, type, menuID } = {dishID:null, name:'', type:'', menuID:null}) 
	{
		try {
			const addTaskResponse = await fetch(
				'http://localhost:5173/tasks',
				{
					method: 'POST',
					body: JSON.stringify({dishID, name, type, menuID}),
					headers: {
						'Content-Type': 'application/json'
					}
				}
			);
			
			if  (addTaskResponse.status !== 200){
				const addTaskBody = await addTaskResponse.json();
				return Promise.reject(addTaskBody);
			}
			
			//return addTaskBody.add_result;
			return{
				timestamp: new Date().toISOString(),
				message:`позиция '${dishID}' была успешно изменена`
			};
		} catch(err) {
			return Promise.reject({
				timestamp: new Date().toISOString(),
				statusCode:0,
				message:err.message
			});
		}
	}
	static async deleteTask({ dishID } = { dishID:null }){
		try {
			const deleteTaskResponse = await fetch(
				`http://localhost:5173/tasks/${dishID}`,
				{
					method: 'DELETE',
	
				}
			);
			if  (deleteTaskResponse.status !== 200){
				const deleteTaskBody = await deleteTaskResponse.json();
				return Promise.reject(deleteTaskBody);
			}
			return{
				timestamp: new Date().toISOString(),
				message:`позиция '${dishID}' была успешно изменена`
			};
		} catch(err) {
			return Promise.reject({
				timestamp: new Date().toISOString(),
				statusCode:0,
				message:err.message
			});
		}
	}
	static async updateTask({ dishID, name='', newType=''} = {dishID:null, name:'', newType:''}) {
		try {
			const updateTaskResponse = await fetch(
				`http://localhost:5173/tasks/${dishID}`,
				{
					method: 'PATCH',
					body: JSON.stringify({ name, newType }), //taskID, 
					headers: {
						'Content-Type': 'application/json'
					}
				}
			);
			if  (updateTaskResponse.status !== 200){
				const updateTaskBody = await updateTaskResponse.json();
				return Promise.reject(updateTaskBody);
			}
			return{
				timestamp: new Date().toISOString(),
				message:`Параметры блюда '${name}' были успешно изменены`
			};
		} catch(err) {
			return Promise.reject({
				timestamp: new Date().toISOString(),
				statusCode:0,
				message:err.message
			});
		}
	}
	static async moveTask({dishID, srcTasklistID, destTasklistID}={dishID:null, srcTasklistID:null, destTasklistID:null}){
		try {
			const moveTaskResponse = await fetch(
				'http://localhost:5173/tasklists',
				{
					method: 'PATCH',
					body: JSON.stringify({dishID, srcTasklistID, destTasklistID}),
					headers: {
						'Content-Type': 'application/json'
					}
				}
			);
			if  (moveTaskResponse.status !== 200){
				const moveTaskBody = await moveTaskResponse.json();
				return Promise.reject(moveTaskBody);
			}
			return{
				timestamp: new Date().toISOString(),
				message:'Параметры задачи были успешно изменены'
			};
		} catch(err) {
			return Promise.reject({
				timestamp: new Date().toISOString(),
				statusCode:0,
				message:err.message
			});
		}
	}
};



