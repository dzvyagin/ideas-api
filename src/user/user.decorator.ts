import { createParamDecorator } from '@nestjs/common';

export const User = createParamDecorator((data, req) => {
  return data ? req.args[0].user[data] : req.args[0].user;
});
