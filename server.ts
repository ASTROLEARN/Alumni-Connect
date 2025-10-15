// server.ts - Next.js Standalone + Socket.IO
import { setupSocket } from '@/lib/socket';
import { createServer } from 'http';
import { Server } from 'socket.io';
import next from 'next';

const dev = process.env.NODE_ENV !== 'production';
const currentPort = parseInt(process.env.PORT || '5000', 10);
const hostname = '0.0.0.0';

// Custom server with Socket.IO integration
async function createCustomServer() {
   try {
      // Create Next.js app
      const nextApp = next({
         dev,
         dir: process.cwd(),
         // In production, use the current directory where .next is located
         conf: dev ? undefined : { distDir: './.next' },
      });

      await nextApp.prepare();
      const handle = nextApp.getRequestHandler();

      // Create HTTP server that will handle both Next.js and Socket.IO
      const server = createServer((req, res) => {
         // Log incoming auth requests to help debug NextAuth client fetch errors
         if (req.url?.startsWith('/api/auth')) {
            console.log(`[server] ${req.method} ${req.url}`);
         }

         // Do not prematurely return for /api/socketio. Let Next.js handle HTTP
         // requests and Socket.IO handle upgrade requests on the same server.
         try {
            handle(req, res);
         } catch (handleErr) {
            console.error('Error in request handler:', handleErr);
            // Ensure response is ended to avoid hanging connections
            try {
               res.statusCode = 500;
               res.setHeader('content-type', 'application/json');
               res.end(JSON.stringify({ error: 'Internal server error' }));
            } catch (endErr) {
               console.error(
                  'Failed to end response after handler error:',
                  endErr
               );
            }
         }
      });

      // Setup Socket.IO
      const io = new Server(server, {
         path: '/api/socketio',
         cors: {
            origin: '*',
            methods: ['GET', 'POST'],
         },
      });

      setupSocket(io);

      // Start the server
      server.listen(currentPort, hostname, () => {
         console.log(`> Ready on http://${hostname}:${currentPort}`);
         console.log(
            `> Socket.IO server running at ws://${hostname}:${currentPort}/api/socketio`
         );
      });
   } catch (err) {
      console.error('Server startup error:', err);
      process.exit(1);
   }
}

// Start the server
createCustomServer();
