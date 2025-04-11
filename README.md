**Purpose:**
This web application is a personal task management tool designed to help users organize, prioritize, and schedule their responsibilities efficiently. Users can create tasks with descriptions, priority levels, estimated durations, and due dates. For those who wish to integrate tasks into their calendar, the app features an intelligent suggestion system that recommends the earliest available time slot or allows users to specify a custom time. By offering a clean and intuitive interface for managing and scheduling tasks, the application addresses the common problem of scattered to-do lists and ineffective time allocation.

**Set Up: From root directory...**
1. cd ./client
2. npm install
3. cd ../server
4. npm install

**To Run: From root directory...**
1. cd ./server
2. node ./app.js
3. open another terminal to root directory
4. cd ./client
5. npm run dev

project3_todo/
├── client/             # Frontend (React + Vite)
│   ├── node_modules/
│   ├── src/
│   │   ├── components/
│   │   	│	├── auth/
│   │   	│	│	├── auth.module.css
│   │   	│	│	├── Login.tsx
│   │   	│	│	├── PrivateRoute.tsx
│   │   	│	│	├── Register.tsx
│   │   	│	├── calendar/
│   │   	│	│	├── calendar.css
│   │   	│	│	├── CalendarView.tsx
│   │   	│	│	├── ScheduleTaskModal.tsx
│   │   	│	│	├── TaskDetailModal.tsx
│   │   	│	├── dashboard/
│   │   	│	│	├── TaskModal.module.css
│   │   	│	│	├── AddTaskButton.tsx // on the dashboard page, goto TaskModal
│   │   	│	│	├── EditTaskModal.tsx // like TaskModal, but performing updates
│   │   	│	│	├── ScheduleTaskModal.tsx // prompt schedule suggestion box
│   │   	│	│	├── TaskItem.tsx // on the dashboard page, shows basic tasks info, edit button and schedule button
│   │   	│	│	├── TaskModal.tsx //add in new task box
│   │   	│	├── settings
│   │   	│	│	├── settings.css
│   │   	│	│	├── SettingsPanel.tsx
│   │   	│	├── layout.css
│   │   	│	├── Layout.tsx
│   │   ├── pages/
│   │   	│	├── Calendar.tsx
│   │   	│	├── Dashboard.tsx
│   │   	│	├── NotFound.tsx
│   │   	│	├── Settings.tsx
│   │   ├── styles/
│   │   	│	├── global.css
│   │   ├── main.tsx
│   │   └── App.tsx
│   ├── index.html
│   ├── package.json
│   ├── package-lock.json
│   ├── tsconfig.json
│   └── vite.config
│
├── server/             # Backend
│   ├── node_modules/
│   ├── db/
│   │   ├── db.js
│   │   ├── schema.sql
│   ├── instance/
│   │   ├── todo.splite
│   ├── routes/
│   │   ├── auth.js
│   │   ├── settings.js
│   │   ├── suggestions.js
│   │   └── tasks.js
│   ├── app.js        # Main server file
│   ├── package-lock.json        
│   └── package.json
│
└── README.md
