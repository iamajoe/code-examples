import { IRoute, IRouterContext } from 'toolbox-api/dist/router';
import { service as chatService } from './services/chat/chat.api';
import { service as userService } from './services/users/users.api';
import { service as statusService } from './services/status/status.api';

// -------------------------------------------------------------------------
// variables

export const routes: IRoute<IRouterContext>[] = [
  { path: '/chat/get-room-messages/:roomId', method: 'get', fn: chatService.getRoomMessages },
  { path: '/chat/get-user-rooms-one-on-one', method: 'get', fn: chatService.getUserRoomsOneOnOne },
  { path: '/chat/get-user-rooms-groups', method: 'get', fn: chatService.getUserRoomsGroups },
  { path: '/chat/room', method: 'post', fn: chatService.createRoom },
  { path: '/chat/room/:id', method: 'get', fn: chatService.getRoom },
  { path: '/chat/room/:id', method: 'patch', fn: chatService.patchRoom },
  { path: '/chat/room/:id', method: 'delete', fn: chatService.delRoom },

  { path: '/status', method: 'get', fn: statusService.getStatus },

  { path: '/users/login', method: 'post', fn: userService.login },
  { path: '/users/verify-user', method: 'post', fn: userService.verifyUser },
  { path: '/users/resend-verify-code', method: 'post', fn: userService.resendVerifyCode },
  { path: '/users/send-reset-password', method: 'post', fn: userService.sendResetPassword },
  { path: '/users/reset-password', method: 'post', fn: userService.resetPassword },
  { path: '/users/user', method: 'post', fn: userService.create },
  { path: '/users/user/:id', method: 'get', fn: userService.get },
  { path: '/users/user/:id', method: 'patch', fn: userService.patch },
  { path: '/users/users', method: 'post', fn: userService.getUsers },
  { path: '/users/get-user-by-email', method: 'get', fn: userService.getUserByEmail },
  { path: '/users/is-email-registered', method: 'get', fn: userService.isEmailRegistered },
];
