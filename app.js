// Gestor de Tareas Universitarias - Aplicación JavaScript

class TaskManager {
    constructor() {
        this.tasks = JSON.parse(localStorage.getItem('universityTasks')) || [];
        this.currentFilter = 'all';
        this.init();
    }

    init() {
        this.loadTasks();
        this.setupEventListeners();
        this.updateStats();
    }

    setupEventListeners() {
        // Formulario para añadir tareas
        document.getElementById('task-form').addEventListener('submit', (e) => {
            e.preventDefault();
            this.addTask();
        });

        // Filtros
        document.querySelectorAll('.filter-btn').forEach(btn => {
            btn.addEventListener('click', (e) => {
                this.setFilter(e.target.dataset.filter);
            });
        });

        // Delegación de eventos para los botones de la lista de tareas
        document.getElementById('tasks-list').addEventListener('click', (e) => {
            const taskElement = e.target.closest('.task-item');
            if (!taskElement) return;

            const taskId = taskElement.dataset.id;

            if (e.target.classList.contains('complete-btn')) {
                this.toggleComplete(taskId);
            } else if (e.target.classList.contains('edit-btn')) {
                this.editTask(taskId);
            } else if (e.target.classList.contains('delete-btn')) {
                this.deleteTask(taskId);
            }
        });
    }

    addTask() {
        const title = document.getElementById('task-title').value.trim();
        const subject = document.getElementById('task-subject').value.trim();
        const dueDate = document.getElementById('task-dueDate').value;
        const priority = document.getElementById('task-priority').value;
        const description = document.getElementById('task-description').value.trim();

        if (!title) {
            alert('Por favor, ingresa un título para la tarea');
            return;
        }

        const newTask = {
            id: Date.now().toString(),
            title,
            subject: subject || 'Sin asignatura',
            dueDate: dueDate || null,
            priority,
            description: description || 'Sin descripción',
            completed: false,
            createdAt: new Date().toISOString()
        };

        this.tasks.unshift(newTask);
        this.saveTasks();
        this.loadTasks();
        this.updateStats();
        this.resetForm();
    }

    editTask(taskId) {
        const task = this.tasks.find(t => t.id === taskId);
        if (!task) return;

        // Llenar el formulario con los datos de la tarea
        document.getElementById('task-title').value = task.title;
        document.getElementById('task-subject').value = task.subject;
        document.getElementById('task-dueDate').value = task.dueDate || '';
        document.getElementById('task-priority').value = task.priority;
        document.getElementById('task-description').value = task.description;

        // Eliminar la tarea actual para reemplazarla después
        this.tasks = this.tasks.filter(t => t.id !== taskId);
        this.saveTasks();
        this.loadTasks();
    }

    toggleComplete(taskId) {
        this.tasks = this.tasks.map(task => {
            if (task.id === taskId) {
                return { ...task, completed: !task.completed };
            }
            return task;
        });
        this.saveTasks();
        this.loadTasks();
        this.updateStats();
    }

    deleteTask(taskId) {
        if (confirm('¿Estás seguro de que quieres eliminar esta tarea?')) {
            this.tasks = this.tasks.filter(task => task.id !== taskId);
            this.saveTasks();
            this.loadTasks();
            this.updateStats();
        }
    }

    setFilter(filter) {
        this.currentFilter = filter;
        
        // Actualizar botones activos
        document.querySelectorAll('.filter-btn').forEach(btn => {
            btn.classList.remove('active');
            if (btn.dataset.filter === filter) {
                btn.classList.add('active');
            }
        });

        this.loadTasks();
    }

    loadTasks() {
        const tasksList = document.getElementById('tasks-list');
        const emptyState = document.getElementById('empty-state');
        
        // Filtrar tareas según el filtro actual
        let filteredTasks = this.tasks;
        if (this.currentFilter === 'completed') {
            filteredTasks = this.tasks.filter(task => task.completed);
        } else if (this.currentFilter === 'pending') {
            filteredTasks = this.tasks.filter(task => !task.completed);
        }

        // Mostrar u ocultar estado vacío
        if (filteredTasks.length === 0) {
            emptyState.style.display = 'flex';
            tasksList.innerHTML = '';
            tasksList.appendChild(emptyState);
            return;
        } else {
            emptyState.style.display = 'none';
        }

        // Generar HTML para las tareas
        tasksList.innerHTML = filteredTasks.map(task => this.createTaskHTML(task)).join('');
    }

    createTaskHTML(task) {
        const dueDate = task.dueDate ? new Date(task.dueDate).toLocaleDateString() : 'Sin fecha';
        const priorityText = {
            'high': 'Alta',
            'medium': 'Media',
            'low': 'Baja'
        }[task.priority];

        const priorityClass = `priority-${task.priority}`;
        
        return `
            <div class="task-item bg-white border border-gray-200 rounded-lg p-4 ${priorityClass} ${task.completed ? 'task-completed' : ''}" data-id="${task.id}">
                <div class="flex justify-between items-start mb-3">
                    <div class="flex-1">
                        <h3 class="task-title text-lg font-semibold text-gray-800 mb-1">${task.title}</h3>
                        <p class="text-sm text-gray-600 mb-2">${task.subject}</p>
                        <p class="text-sm text-gray-500">${task.description}</p>
                    </div>
                    <div class="flex flex-col items-end">
                        <span class="px-2 py-1 text-xs font-medium rounded-full ${task.priority === 'high' ? 'bg-red-100 text-red-800' : task.priority === 'medium' ? 'bg-yellow-100 text-yellow-800' : 'bg-green-100 text-green-800'}">
                            ${priorityText}
                        </span>
                        <span class="text-sm text-gray-500 mt-2">Vence: ${dueDate}</span>
                    </div>
                </div>
                <div class="flex justify-between items-center">
                    <div class="flex items-center">
                        <span class="text-sm ${task.completed ? 'text-green-600' : 'text-orange-600'}">
                            <i class="fas ${task.completed ? 'fa-check-circle' : 'fa-clock'} mr-1"></i>
                            ${task.completed ? 'Completada' : 'Pendiente'}
                        </span>
                    </div>
                    <div class="task-actions flex gap-2">
                        <button class="complete-btn px-3 py-1 text-sm rounded-md btn-hover ${task.completed ? 'bg-gray-100 text-gray-700' : 'bg-green-100 text-green-700'}">
                            <i class="fas ${task.completed ? 'fa-undo' : 'fa-check'} mr-1"></i>
                            ${task.completed ? 'Reabrir' : 'Completar'}
                        </button>
                        <button class="edit-btn px-3 py-1 text-sm bg-blue-100 text-blue-700 rounded-md btn-hover">
                            <i class="fas fa-edit mr-1"></i>Editar
                        </button>
                        <button class="delete-btn px-3 py-1 text-sm bg-red-100 text-red-700 rounded-md btn-hover">
                            <i class="fas fa-trash mr-1"></i>Eliminar
                        </button>
                    </div>
                </div>
            </div>
        `;
    }

    updateStats() {
        const total = this.tasks.length;
        const completed = this.tasks.filter(task => task.completed).length;
        const pending = total - completed;

        document.getElementById('total-tasks').textContent = total;
        document.getElementById('completed-tasks').textContent = completed;
        document.getElementById('pending-tasks').textContent = pending;
    }

    resetForm() {
        document.getElementById('task-form').reset();
    }

    saveTasks() {
        localStorage.setItem('universityTasks', JSON.stringify(this.tasks));
    }
}

// Inicializar la aplicación cuando el DOM esté cargado
document.addEventListener('DOMContentLoaded', () => {
    new TaskManager();
});