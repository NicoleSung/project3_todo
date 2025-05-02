**Purpose:**
This web application is a personal task management tool designed to help users organize, prioritize, and schedule their responsibilities efficiently. Users can create tasks with descriptions, priority levels, estimated durations, and due dates. For those who wish to integrate tasks into their calendar, the app features an intelligent suggestion system that recommends the earliest available time slot or allows users to specify a custom time. By offering a clean and intuitive interface for managing and scheduling tasks, the application addresses the common problem of scattered to-do lists and ineffective time allocation.

---
Pre-AWS Cloud Hosting. (NO LONGER APPLICABLE).
```bash
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
```

---

On AWS EC2, in the CLI, these commands run the front and backend respectively, after the nginx and pm2 are set up. However, the nginx script and duckdns directory, required for domain hosting, are not shared in this repository for security reasons. (THESE RESULTS ARE NOT REPRODUCIBLE LOCALLY AS A RESULT).
```bash
# FRONTEND ./client
npm install
npm run build
sudo systemctl start nginx

# For debugging
sudo systemctl stop nginx
sudo systemctl status nginx
sudo systemctl reload nginx

# Testing nginx
sudo nginx -t



# BACKEND -- ./server
npm install
pm2 start app.js --name todo_website
pm2 save
pm2 startup systemd -u ubuntu --hp /home/ubuntu | bash

# For server information
pm2 status
pm2 logs todo_website
```