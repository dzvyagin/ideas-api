import { CommentService } from './../comment/comment.service';
import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';

import { IdeaController } from './idea.controller';
import { IdeaService } from './idea.service';
import { IdeaEntity } from './idea.entity';
import { UserEntity } from 'src/user/user.entity';
import { IdeaResolver } from './idea.resolver';
import { CommentEntity } from 'src/comment/comment.entity';

@Module({
  imports: [TypeOrmModule.forFeature([IdeaEntity, UserEntity, CommentEntity])],
  controllers: [IdeaController],
  providers: [IdeaService, IdeaResolver, CommentService],
})
export class IdeaModule {}
