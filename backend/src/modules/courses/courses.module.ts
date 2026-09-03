import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { Course } from './entities/course.entity';
import { Module as CourseModule } from './entities/module.entity';
import { Enrollment } from './entities/enrollment.entity';

@Module({
  imports: [TypeOrmModule.forFeature([Course, CourseModule, Enrollment])],
  providers: [],
  controllers: [],
})
export class CoursesModule {}
