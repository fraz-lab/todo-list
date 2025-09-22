import React, { useState } from 'react';
import { Container, Box, TextField, Button, Typography, Stack } from '@mui/material';
import { Login as LoginIcon } from '@mui/icons-material';

function Login({ onLogin }) {
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');

  const handleLogin = (e) => {
    e.preventDefault();
    if (!username.trim() || !password.trim()) {
      setError('Username and password cannot be empty');
      return;
    }

    const adminCredentials = { username: 'admin', password: 'admin123', role: 'admin' };
    const users = JSON.parse(localStorage.getItem('users') || '{}');

    if (username === adminCredentials.username && password === adminCredentials.password) {
      onLogin(adminCredentials);
      setError('');
    } else if (users[username] && users[username].password === password) {
      onLogin({ username, role: users[username].role });
      setError('');
    } else {
      setError('Invalid username or password');
    }
  };

  return (
    <Container maxWidth="sm" className="py-8">
      <Box className="bg-white p-8 rounded-lg shadow-md">
        <Typography variant="h4" className="text-center text-blue-600 mb-6 font-bold">
          Login
        </Typography>
        {error && (
          <div className="bg-red-100 text-red-700 p-4 rounded mb-4">
            {error}
          </div>
        )}
        <form onSubmit={handleLogin}>
          <Stack spacing={2}>
            <TextField
              label="Username"
              value={username}
              onChange={(e) => setUsername(e.target.value)}
              placeholder="Enter username"
              fullWidth
              className="bg-white rounded"
              inputProps={{ 'data-testid': 'login-username' }}
            />
            <TextField
              label="Password"
              type="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              placeholder="Enter password"
              fullWidth
              className="bg-white rounded"
              inputProps={{ 'data-testid': 'login-password' }}
            />
            <Button
              type="submit"
              variant="contained"
              className="bg-blue-500 hover:bg-blue-600 text-white"
              startIcon={<LoginIcon />}
              data-testid="login-button"
            >
              Login
            </Button>
          </Stack>
        </form>
      </Box>
    </Container>
  );
}

export default Login;