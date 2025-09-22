import React, { useState, useEffect } from 'react';
import {
  Container,
  Card,
  CardContent,
  TextField,
  Button,
  Typography,
  Box,
  Checkbox,
  LinearProgress,
  List,
  ListItem,
  ListItemText,
  Stack,
  Divider,
} from '@mui/material';
import { Add as AddIcon, ExitToApp as LogoutIcon } from '@mui/icons-material';
import Cookies from 'js-cookie';
import Login from './Login';
import AuditLog from './AuditLog';

function App() {
  const [user, setUser] = useState(null); // { username, role }
  const [tasks, setTasks] = useState([]);
  const [newTask, setNewTask] = useState('');
  const [selectedTask, setSelectedTask] = useState(null);
  const [newSubTask, setNewSubTask] = useState('');
  const [error, setError] = useState('');
  const [newUser, setNewUser] = useState({ username: '', password: '', role: 'user' });

  // Load user and tasks from storage on mount
  useEffect(() => {
    const savedUser = Cookies.get('user');
    if (savedUser) {
      const parsedUser = JSON.parse(savedUser);
      setUser(parsedUser);
      // Load tasks for the user
      const userTasks = JSON.parse(localStorage.getItem(`tasks_${parsedUser.username}`) || '[]');
      setTasks(userTasks);
      // Log login action
      addAuditLog(parsedUser.username, 'login', `User ${parsedUser.username} logged in`);
    }
  }, []);

  // Save tasks to localStorage whenever tasks change
  useEffect(() => {
    if (user) {
      localStorage.setItem(`tasks_${user.username}`, JSON.stringify(tasks));
    }
  }, [tasks, user]);

  // Add audit log entry
  const addAuditLog = (username, action, details) => {
    const auditLogs = JSON.parse(localStorage.getItem('auditLogs') || '[]');
    auditLogs.push({
      id: Date.now(),
      timestamp: new Date().toISOString(),
      username,
      action,
      details,
    });
    localStorage.setItem('auditLogs', JSON.stringify(auditLogs));
  };

  // Admin creates a new user
  const createUser = (e) => {
    e.preventDefault();
    if (!newUser.username.trim() || !newUser.password.trim()) {
      setError('Username and password cannot be empty');
      return;
    }
    const users = JSON.parse(localStorage.getItem('users') || '{}');
    if (users[newUser.username]) {
      setError('Username already exists');
      return;
    }
    users[newUser.username] = { password: newUser.password, role: newUser.role };
    localStorage.setItem('users', JSON.stringify(users));
    setNewUser({ username: '', password: '', role: 'user' });
    setError('');
    addAuditLog(user.username, 'create_user', `Created user ${newUser.username} with role ${newUser.role}`);
    alert('User created successfully');
  };

  // Logout
  const handleLogout = () => {
    addAuditLog(user.username, 'logout', `User ${user.username} logged out`);
    Cookies.remove('user');
    setUser(null);
    setTasks([]);
    setError('');
  };

  // Handle login
  const handleLogin = (loggedInUser) => {
    setUser(loggedInUser);
    Cookies.set('user', JSON.stringify(loggedInUser), { expires: 7 });
    // Load user tasks
    const userTasks = JSON.parse(localStorage.getItem(`tasks_${loggedInUser.username}`) || '[]');
    setTasks(userTasks);
  };

  // Todo list functions
  const addPrimaryTask = (e) => {
    e.preventDefault();
    if (!newTask.trim()) {
      setError('Primary task cannot be empty');
      return;
    }
    const newTaskData = {
      id: Date.now(),
      title: newTask,
      subTasks: [],
    };
    setTasks([...tasks, newTaskData]);
    setNewTask('');
    setError('');
    addAuditLog(user.username, 'add_task', `Added primary task: ${newTask}`);
  };

  const addSubTask = (e, parentId) => {
    e.preventDefault();
    if (!newSubTask.trim()) {
      setError('Subtask cannot be empty');
      return;
    }
    const updatedTasks = tasks.map((task) => {
      if (task.id === parentId) {
        return {
          ...task,
          subTasks: [
            ...task.subTasks,
            {
              id: Date.now(),
              title: newSubTask,
              completed: false,
            },
          ],
        };
      }
      return task;
    });
    setTasks(updatedTasks);
    setNewSubTask('');
    setSelectedTask(null);
    setError('');
    addAuditLog(user.username, 'add_subtask', `Added subtask: ${newSubTask} to task ID ${parentId}`);
  };

  const toggleSubTask = (taskId, subTaskId) => {
    const updatedTasks = tasks.map((task) => {
      if (task.id === taskId) {
        return {
          ...task,
          subTasks: task.subTasks.map((subTask) => {
            if (subTask.id === subTaskId) {
              return { ...subTask, completed: !subTask.completed };
            }
            return subTask;
          }),
        };
      }
      return task;
    });
    setTasks(updatedTasks);
    addAuditLog(user.username, 'toggle_subtask', `Toggled subtask ID ${subTaskId} in task ID ${taskId}`);
  };

  const calculateProgress = (task) => {
    if (task.subTasks.length === 0) return 0;
    const completedTasks = task.subTasks.filter((st) => st.completed).length;
    return (completedTasks / task.subTasks.length) * 100;
  };

  const getProgressBarColor = (progress) => {
    if (progress === 100) return '#22c55e'; // Green for 100%
    if (progress < 30) return '#ef4444'; // Red for below 30%
    if (progress > 50) return '#3b82f6'; // Blue for above 50%
    return '#6b7280'; // Gray for 30% to 50%
  };

  if (!user) {
    return <Login onLogin={handleLogin} />;
  }

  return (
    <Container maxWidth="md" className="py-8">
      <Box className="flex justify-between items-center mb-8">
        <Typography variant="h3" className="text-center text-blue-600 font-bold">
          Todo List
        </Typography>
        <Box className="flex items-center">
          <Typography variant="body1" className="mr-4 text-gray-600">
            Welcome, {user.username} ({user.role})
          </Typography>
          <Button
            variant="outlined"
            className="border-blue-500 text-blue-500 hover:bg-blue-50"
            startIcon={<LogoutIcon />}
            onClick={handleLogout}
            data-testid="logout-button"
          >
            Logout
          </Button>
        </Box>
      </Box>

      {error && (
        <div className="bg-red-100 text-red-700 p-4 rounded mb-4">
          {error}
        </div>
      )}

      {user.role === 'admin' && (
        <>
          <Box component="form" onSubmit={createUser} className="mb-8 bg-gray-100 p-4 rounded-lg">
            <Typography variant="h6" className="mb-4 text-gray-800">
              Create New User
            </Typography>
            <Stack direction="row" spacing={2}>
              <TextField
                label="Username"
                value={newUser.username}
                onChange={(e) => setNewUser({ ...newUser, username: e.target.value })}
                placeholder="Enter username"
                className="bg-white rounded"
                inputProps={{ 'data-testid': 'new-user-username' }}
              />
              <TextField
                label="Password"
                type="password"
                value={newUser.password}
                onChange={(e) => setNewUser({ ...newUser, password: e.target.value })}
                placeholder="Enter password"
                className="bg-white rounded"
                inputProps={{ 'data-testid': 'new-user-password' }}
              />
              <TextField
                select
                label="Role"
                value={newUser.role}
                onChange={(e) => setNewUser({ ...newUser, role: e.target.value })}
                SelectProps={{ native: true }}
                className="bg-white rounded"
                inputProps={{ 'data-testid': 'new-user-role' }}
              >
                <option value="user">User</option>
                <option value="admin">Admin</option>
              </TextField>
              <Button
                type="submit"
                variant="contained"
                className="bg-blue-500 hover:bg-blue-600 text-white"
                startIcon={<AddIcon />}
                data-testid="create-user-button"
              >
                Create User
              </Button>
            </Stack>
          </Box>
          <AuditLog />
          <Divider className="mb-8 mt-4" />
        </>
      )}

      <Stack component="form" onSubmit={addPrimaryTask} direction="row" spacing={2} className="mb-8">
        <TextField
          fullWidth
          variant="outlined"
          value={newTask}
          onChange={(e) => setNewTask(e.target.value)}
          placeholder="Add a primary task"
          className="bg-white rounded"
          inputProps={{ 'data-testid': 'primary-task-input' }}
        />
        <Button
          type="submit"
          variant="contained"
          className="bg-blue-500 hover:bg-blue-600 text-white"
          startIcon={<AddIcon />}
        >
          Add Task
        </Button>
      </Stack>

      <List>
        {tasks.map((task) => (
          <Card key={task.id} className="mb-4 bg-white rounded-lg shadow-md">
            <CardContent>
              <Typography variant="h6" className="font-semibold text-gray-800">
                {task.title}
              </Typography>

              <Box className="flex items-center my-4">
                <LinearProgress
                  variant="determinate"
                  value={calculateProgress(task)}
                  className="h-2 rounded flex-grow"
                  sx={{
                    '& .MuiLinearProgress-bar': {
                      backgroundColor: getProgressBarColor(calculateProgress(task)),
                    },
                    backgroundColor: '#e5e7eb',
                  }}
                />
                <Typography
                  variant="body2"
                  className="ml-4 text-gray-600 font-medium"
                  data-testid={`progress-percentage-${task.id}`}
                >
                  {Math.round(calculateProgress(task))}%
                </Typography>
              </Box>

              <List dense>
                {task.subTasks.map((subTask) => (
                  <ListItem key={subTask.id} className="py-1">
                    <Checkbox
                      checked={subTask.completed}
                      onChange={() => toggleSubTask(task.id, subTask.id)}
                      className="text-blue-500"
                      inputProps={{ 'data-testid': `subtask-checkbox-${subTask.id}` }}
                    />
                    <ListItemText
                      primary={subTask.title}
                      className={subTask.completed ? 'line-through text-gray-500' : 'text-gray-800'}
                    />
                  </ListItem>
                ))}
              </List>

              {selectedTask === task.id ? (
                <Box component="form" onSubmit={(e) => addSubTask(e, task.id)} className="mt-4">
                  <TextField
                    fullWidth
                    size="small"
                    value={newSubTask}
                    onChange={(e) => setNewSubTask(e.target.value)}
                    placeholder="Add a subtask"
                    className="bg-white rounded mr-2"
                    inputProps={{ 'data-testid': `subtask-input-${task.id}` }}
                    InputProps={{
                      endAdornment: (
                        <Button
                          type="submit"
                          variant="contained"
                          className="bg-blue-500 hover:bg-blue-600 text-white"
                          size="small"
                          startIcon={<AddIcon />}
                        >
                          Add
                        </Button>
                      ),
                    }}
                  />
                </Box>
              ) : (
                <Button
                  onClick={() => setSelectedTask(task.id)}
                  variant="outlined"
                  className="mt-4 border-blue-500 text-blue-500 hover:bg-blue-50"
                  size="small"
                  startIcon={<AddIcon />}
                >
                  Add Subtask
                </Button>
              )}
            </CardContent>
          </Card>
        ))}
      </List>
    </Container>
  );
}

export default App;