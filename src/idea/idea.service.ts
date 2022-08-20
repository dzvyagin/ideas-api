import { HttpException, HttpStatus, Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';

import { IdeaDTO, IdeaRO } from './idea.dto';
import { IdeaEntity } from './idea.entity';
import { UserEntity } from 'src/user/user.entity';
import { Votes } from 'src/shared/votes.enum';

@Injectable()
export class IdeaService {
  constructor(
    @InjectRepository(IdeaEntity)
    private ideaRepository: Repository<IdeaEntity>,
    @InjectRepository(UserEntity)
    private userRepository: Repository<UserEntity>,
  ) {}

  private async vote(idea: IdeaEntity, user: UserEntity, vote: Votes) {
    const opposite = vote === Votes.UP ? Votes.DOWN : Votes.UP;

    if (
      idea[opposite].find((voter) => voter.id === user.id) ||
      idea[vote].find((voter) => voter.id === user.id)
    ) {
      idea[opposite] = idea[opposite].filter((voter) => voter.id !== user.id);
      idea[vote] = idea[vote].filter((voter) => voter.id !== user.id);
      await this.ideaRepository.save(idea);
    } else if (idea[vote].filter((voter) => voter.id === user.id).length < 1) {
      idea[vote].push(user);
      await this.ideaRepository.save(idea);
    } else {
      throw new HttpException('Unable to cast vote', HttpStatus.BAD_REQUEST);
    }

    return idea;
  }

  async showAll(page = 1, newest = false): Promise<IdeaRO[]> {
    const ideas = await this.ideaRepository.find({
      relations: ['author', 'upvotes', 'downvotes', 'comments'],
      take: 25,
      skip: 25 * (page - 1),
      order: newest ? {} : { created: 'DESC' },
    });

    return ideas.map((idea) => this.toResponseObject(idea));
  }

  private toResponseObject(idea: IdeaEntity): IdeaRO {
    const responseObject: any = {
      ...idea,
      author: idea.author?.toResponseObject(false),
    };

    if (responseObject.upvotes) {
      responseObject.upvotes = responseObject.upvotes.length;
    }

    if (responseObject.downvotes) {
      responseObject.downvotes = responseObject.downvotes.length;
    }

    return responseObject;
  }

  private ensureOwnership(idea: IdeaEntity, userId: string) {
    if (idea.author.id !== userId) {
      throw new HttpException('Incorrect user', HttpStatus.UNAUTHORIZED);
    }
  }

  async create(userId: string, data: IdeaDTO): Promise<IdeaRO> {
    const user = await this.userRepository.findOne({ where: { id: userId } });
    const idea = this.ideaRepository.create({ ...data, author: user });
    await this.ideaRepository.save(idea);
    return this.toResponseObject(idea);
  }

  async read(id: string): Promise<IdeaRO> {
    const idea = await this.ideaRepository.findOne({
      where: { id },
      relations: ['author', 'upvotes', 'downvotes', 'comments'],
    });
    if (!idea) {
      throw new HttpException('Not Found', HttpStatus.NOT_FOUND);
    }

    return this.toResponseObject(idea);
  }

  async update(
    id: string,
    userId: string,
    data: Partial<IdeaDTO>,
  ): Promise<IdeaRO> {
    let idea = await this.ideaRepository.findOne({
      where: { id },
      relations: ['author', 'comments'],
    });
    if (!idea) {
      throw new HttpException('Not Found', HttpStatus.NOT_FOUND);
    }
    this.ensureOwnership(idea, userId);
    await this.ideaRepository.update({ id }, data);
    idea = await this.ideaRepository.findOne({
      where: { id },
      relations: ['author'],
    });
    return this.toResponseObject(idea);
  }

  async delete(id: string, userId: string) {
    const idea = await this.ideaRepository.findOne({
      where: { id },
      relations: ['author', 'comments'],
    });
    if (!idea) {
      throw new HttpException('Not Found', HttpStatus.NOT_FOUND);
    }
    this.ensureOwnership(idea, userId);
    await this.ideaRepository.delete({ id });
    return this.toResponseObject(idea);
  }

  async bookmark(id: string, userId: string) {
    const idea = await this.ideaRepository.findOne({ where: { id } });
    const user = await this.userRepository.findOne({
      where: { id: userId },
      relations: ['bookmarks'],
    });

    if (!user.bookmarks.find((bookmark) => bookmark.id === idea.id)) {
      user.bookmarks.push(idea);
      await this.userRepository.save(user);
    } else {
      throw new HttpException('Idea alredy bookmarked', HttpStatus.BAD_REQUEST);
    }

    return user.toResponseObject();
  }

  async upvote(id: string, userId: string) {
    let idea = await this.ideaRepository.findOne({
      where: { id },
      relations: ['author', 'upvotes', 'downvotes', 'comments'],
    });
    const user = await this.userRepository.findOne({ where: { id: userId } });

    idea = await this.vote(idea, user, Votes.UP);

    return this.toResponseObject(idea);
  }

  async downvote(id: string, userId: string) {
    let idea = await this.ideaRepository.findOne({
      where: { id },
      relations: ['author', 'upvotes', 'downvotes', 'comments'],
    });
    const user = await this.userRepository.findOne({ where: { id: userId } });

    idea = await this.vote(idea, user, Votes.DOWN);

    return this.toResponseObject(idea);
  }

  async unbookmark(id: string, userId: string) {
    const idea = await this.ideaRepository.findOne({ where: { id } });
    const user = await this.userRepository.findOne({
      where: { id: userId },
      relations: ['bookmarks'],
    });

    if (user.bookmarks.find((bookmark) => bookmark.id === idea.id)) {
      user.bookmarks = user.bookmarks.filter(
        (bookmark) => bookmark.id !== idea.id,
      );
      await this.userRepository.save(user);
    } else {
      throw new HttpException(
        'Idea alredy unbookmarked',
        HttpStatus.BAD_REQUEST,
      );
    }

    return user.toResponseObject();
  }
}
