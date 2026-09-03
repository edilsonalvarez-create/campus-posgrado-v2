import { Module } from '@nestjs/common';
import { ConfigModule, ConfigService } from '@nestjs/config';
import { TypeOrmModule } from '@nestjs/typeorm';
import { JwtModule } from '@nestjs/jwt';

// Modules
import { AuthModule } from './modules/auth/auth.module';
import { UsersModule } from './modules/users/users.module';
import { CoursesModule } from './modules/courses/courses.module';
import { ResourcesModule } from './modules/resources/resources.module';
import { SubmissionsModule } from './modules/submissions/submissions.module';
import { GradesModule } from './modules/grades/grades.module';
import { ProgressModule } from './modules/progress/progress.module';

// Database entities
import { User } from './modules/users/entities/user.entity';
import { Course } from './modules/courses/entities/course.entity';
import { Module as CourseModule } from './modules/courses/entities/module.entity';
import { Resource } from './modules/resources/entities/resource.entity';
import { Submission } from './modules/submissions/entities/submission.entity';
import { Grade } from './modules/grades/entities/grade.entity';
import { Progress } from './modules/progress/entities/progress.entity';
import { Enrollment } from './modules/courses/entities/enrollment.entity';

@Module({
  imports: [
    // Configuration
    ConfigModule.forRoot({
      isGlobal: true,
      envFilePath: '.env',
    }),

    // Database
    TypeOrmModule.forRootAsync({
      inject: [ConfigService],
      useFactory: (configService: ConfigService) => ({
        type: 'postgres',
        host: configService.get('DB_HOST', 'localhost'),
        port: configService.get('DB_PORT', 5432),
        username: configService.get('DB_USERNAME', 'postgres'),
        password: configService.get('DB_PASSWORD', 'postgres'),
        database: configService.get('DB_DATABASE', 'campus_posgrado'),
        entities: [
          User,
          Course,
          CourseModule,
          Resource,
          Submission,
          Grade,
          Progress,
          Enrollment,
        ],
        synchronize: process.env.NODE_ENV === 'development',
        logging: process.env.NODE_ENV === 'development',
      }),
    }),

    // JWT
    JwtModule.registerAsync({
      global: true,
      inject: [ConfigService],
      useFactory: (configService: ConfigService) => ({
        secret: configService.get('JWT_SECRET', 'dev-secret-key'),
        signOptions: {
          expiresIn: configService.get('JWT_EXPIRATION', '3600s'),
        },
      }),
    }),

    // Feature modules
    AuthModule,
    UsersModule,
    CoursesModule,
    ResourcesModule,
    SubmissionsModule,
    GradesModule,
    ProgressModule,
  ],
})
export class AppModule {}
