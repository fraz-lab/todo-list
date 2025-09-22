import React from 'react';
import {
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  Paper,
  Typography,
} from '@mui/material';

function AuditLog() {
  const auditLogs = JSON.parse(localStorage.getItem('auditLogs') || '[]');

  return (
    <div className="mb-8">
      <Typography variant="h6" className="mb-4 text-gray-800">
        Audit Logs
      </Typography>
      <TableContainer component={Paper} className="shadow-md">
        <Table data-testid="audit-log-table">
          <TableHead>
            <TableRow>
              <TableCell className="font-bold">Timestamp</TableCell>
              <TableCell className="font-bold">Username</TableCell>
              <TableCell className="font-bold">Action</TableCell>
              <TableCell className="font-bold">Details</TableCell>
            </TableRow>
          </TableHead>
          <TableBody>
            {auditLogs.sort((a, b) => new Date(b.timestamp) - new Date(a.timestamp)).map((log) => (
              <TableRow key={log.id}>
                <TableCell>{new Date(log.timestamp).toLocaleString()}</TableCell>
                <TableCell>{log.username}</TableCell>
                <TableCell>{log.action}</TableCell>
                <TableCell>{log.details}</TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </TableContainer>
    </div>
  );
}

export default AuditLog;

//              inputProps={{ 'data-testid': 'login-password' }}