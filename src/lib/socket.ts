import { Server } from 'socket.io';

// Store connected users with their roles and IDs
const connectedUsers = new Map<string, { userId: string; role: string }>();

export const setupSocket = (io: Server) => {
  io.on('connection', (socket) => {
    console.log('Client connected:', socket.id);
    
    // Handle user authentication and role assignment
    socket.on('authenticate', (userData: { userId: string; role: string }) => {
      connectedUsers.set(socket.id, userData);
      console.log(`User ${userData.userId} authenticated as ${userData.role}`);
      
      // Join role-specific rooms
      socket.join(userData.role);
      socket.join(`user_${userData.userId}`);
    });

    // Handle alumni verification request
    socket.on('alumni_verification_request', (data: { alumniId: string; alumniName: string; alumniEmail: string }) => {
      // Notify all admins about new alumni verification request
      io.to('admin').emit('new_alumni_verification', {
        alumniId: data.alumniId,
        alumniName: data.alumniName,
        alumniEmail: data.alumniEmail,
        timestamp: new Date().toISOString(),
      });
      console.log(`New alumni verification request from ${data.alumniName}`);
    });

    // Handle alumni verification decision
    socket.on('alumni_verification_decision', (data: { alumniId: string; approved: boolean; adminId: string }) => {
      // Notify the specific alumni about verification decision
      io.to(`user_${data.alumniId}`).emit('verification_decision', {
        approved: data.approved,
        message: data.approved ? 'Your alumni account has been verified!' : 'Your alumni verification was rejected.',
        timestamp: new Date().toISOString(),
      });
      console.log(`Alumni ${data.alumniId} verification ${data.approved ? 'approved' : 'rejected'} by admin ${data.adminId}`);
    });

    // Handle mentorship request
    socket.on('mentorship_request', (data: { 
      studentId: string; 
      studentName: string; 
      alumniId: string; 
      message: string;
    }) => {
      // Notify the specific alumni about new mentorship request
      io.to(`user_${data.alumniId}`).emit('new_mentorship_request', {
        studentId: data.studentId,
        studentName: data.studentName,
        message: data.message,
        timestamp: new Date().toISOString(),
      });
      console.log(`New mentorship request from ${data.studentName} to alumni ${data.alumniId}`);
    });

    // Handle mentorship decision
    socket.on('mentorship_decision', (data: { 
      studentId: string; 
      alumniId: string; 
      accepted: boolean; 
      message?: string;
    }) => {
      // Notify the student about mentorship decision
      io.to(`user_${data.studentId}`).emit('mentorship_decision', {
        alumniId: data.alumniId,
        accepted: data.accepted,
        message: data.message || (data.accepted ? 'Your mentorship request was accepted!' : 'Your mentorship request was declined.'),
        timestamp: new Date().toISOString(),
      });
      console.log(`Mentorship request from student ${data.studentId} ${data.accepted ? 'accepted' : 'rejected'} by alumni ${data.alumniId}`);
    });

    // Handle messages (legacy support)
    socket.on('message', (msg: { text: string; senderId: string }) => {
      // Echo: broadcast message only the client who send the message
      socket.emit('message', {
        text: `Echo: ${msg.text}`,
        senderId: 'system',
        timestamp: new Date().toISOString(),
      });
    });

    // Handle disconnect
    socket.on('disconnect', () => {
      const user = connectedUsers.get(socket.id);
      if (user) {
        console.log(`User ${user.userId} (${user.role}) disconnected`);
        connectedUsers.delete(socket.id);
      } else {
        console.log('Client disconnected:', socket.id);
      }
    });

    // Send welcome message
    socket.emit('message', {
      text: 'Welcome to AlumniConnect Real-time Server!',
      senderId: 'system',
      timestamp: new Date().toISOString(),
    });
  });
};