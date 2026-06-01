import { PrismaClient } from '../../prisma/generated/client';
import { PrismaBetterSqlite3 } from '@prisma/adapter-better-sqlite3';
import { createSlug } from '@/app/api/v1/utils';
import path from 'path';

import {
  WikiCategoryRow,
  WikiTermRow,
  NewsRow,
  InstructorRow,
  UserRow,
  UserRole,
  ProgramRow,
} from './types';

// ─── Singleton Prisma Client ──────────────────────────────────────────────────

let prismaInstance: PrismaClient | null = null;

function getPrisma(): PrismaClient {
  if (!prismaInstance) {
    let dbUrl = process.env.DATABASE_URL || 'file:./data/wiki.db';

    // Convert relative paths to absolute paths for SQLite
    // This ensures the database works in all environments (local, Docker, production)
    if (dbUrl.startsWith('file:./')) {
      const relativePath = dbUrl.replace('file:', '');
      const absolutePath = path.resolve(process.cwd(), relativePath);
      dbUrl = `file:${absolutePath}`;
    }    
    const adapter = new PrismaBetterSqlite3({
      url: dbUrl,
    });
    
    prismaInstance = new PrismaClient({ adapter });
  }
  return prismaInstance;
}

// ─── Type Conversion Helpers ──────────────────────────────────────────────────

/**
 * Convert Prisma WikiTerm (camelCase) to WikiTermRow (snake_case)
 */
function convertPrismaWikiTermToRow(term: {
  id: string;
  title: string;
  description: string;
  category: string;
  author: string;
  coverUrl: string;
  updatedAt: Date;
}): WikiTermRow {
  return {
    id: term.id,
    title: term.title,
    description: term.description,
    category: term.category,
    author: term.author,
    cover_url: term.coverUrl,
    updated_at: term.updatedAt.toISOString(),
  };
}

/**
 * Convert Prisma News (camelCase) to NewsRow (snake_case)
 */
function convertPrismaNewsToRow(news: {
  id: number;
  title: string;
  summary: string;
  content: string;
  coverUrl: string;
  views: number;
  publishedAt: Date;
}): NewsRow {
  return {
    id: news.id,
    title: news.title,
    summary: news.summary,
    content: news.content,
    cover_url: news.coverUrl,
    views: news.views,
    published_at: news.publishedAt.toISOString(),
  };
}

/**
 * Convert Prisma Instructor (camelCase) to InstructorRow (snake_case)
 */
function convertPrismaInstructorToRow(instructor: {
  id: number;
  name: string;
  specialty: string;
  feature: string;
  experience: string;
  bio: string;
  image: string;
  video: string;
  sortOrder: number;
  slug: string;
  presentationVideo: string;
  performanceVideos: string;
  techniques: string;
}): InstructorRow {
  let performance_videos: string[] = [];
  let techniques: string[] = [];

  try {
    performance_videos = JSON.parse(instructor.performanceVideos);
  } catch {
    performance_videos = [];
  }

  try {
    techniques = JSON.parse(instructor.techniques);
  } catch {
    techniques = [];
  }

  return {
    id: instructor.id,
    name: instructor.name,
    specialty: instructor.specialty,
    feature: instructor.feature,
    experience: instructor.experience,
    bio: instructor.bio,
    image: instructor.image,
    video: instructor.video,
    sort_order: instructor.sortOrder,
    slug: instructor.slug,
    presentation_video: instructor.presentationVideo,
    performance_videos,
    techniques,
  };
}

/**
 * Convert Prisma User (camelCase) to UserRow (snake_case)
 */
function convertPrismaUserToRow(user: {
  id: number;
  email: string;
  passwordHash: string;
  role: string;
  emailVerified: boolean;
  verificationToken: string | null;
  tokenExpiresAt: Date | null;
  resetToken: string | null;
  resetTokenExpires: Date | null;
  createdAt: Date;
}): UserRow {
  return {
    id: user.id,
    email: user.email,
    password_hash: user.passwordHash,
    role: user.role as UserRole,
    email_verified: user.emailVerified ? 1 : 0,
    verification_token: user.verificationToken,
    token_expires_at: user.tokenExpiresAt ? user.tokenExpiresAt.toISOString() : null,
    reset_token: user.resetToken,
    reset_token_expires: user.resetTokenExpires ? user.resetTokenExpires.toISOString() : null,
    created_at: user.createdAt.toISOString(),
  };
}

/**
 * Convert Prisma Program (camelCase) to ProgramRow (snake_case)
 */
function convertPrismaProgramToRow(program: {
  id: number;
  slug: string;
  title: string;
  shortDescription: string;
  fullDescription: string;
  packages: string;
  lessonDuration: number;
  programDuration: number;
  features: string;
  isPopular: boolean;
  sortOrder: number;
  createdAt: Date;
  updatedAt: Date;
}): ProgramRow {
  let packages: Array<{
    lessons_count: number
    price: number
  }> = [];
  let features: string[] = [];

  try {
    packages = JSON.parse(program.packages);
  } catch {
    packages = [];
  }

  try {
    features = JSON.parse(program.features);
  } catch {
    features = [];
  }

  return {
    id: program.id,
    slug: program.slug,
    title: program.title,
    short_description: program.shortDescription,
    full_description: program.fullDescription,
    packages,
    lesson_duration: program.lessonDuration,
    program_duration: program.programDuration,
    features,
    is_popular: program.isPopular,
    sort_order: program.sortOrder,
    created_at: program.createdAt.toISOString(),
    updated_at: program.updatedAt.toISOString(),
  };
}

/**
 * Convert Prisma Short (camelCase) to short URL string
 */
function convertPrismaShortToUrl(short: { url: string }): string {
  return short.url;
}

// ─── Wiki Categories ──────────────────────────────────────────────────────────

export async function getCategories(): Promise<WikiCategoryRow[]> {
  const prisma = getPrisma();
  const categories = await prisma.wikiCategory.findMany({
    orderBy: { id: 'asc' },
  });

  return categories.map((cat) => ({
    id: cat.id,
    label: cat.label,
  }));
}

export async function getCategoryLabel(id: string): Promise<string> {
  const prisma = getPrisma();
  const category = await prisma.wikiCategory.findUnique({
    where: { id },
  });

  return category?.label ?? id;
}

// ─── Wiki Terms ────────────────────────────────────────────────────────────────

export async function getAllTerms(): Promise<WikiTermRow[]> {
  const prisma = getPrisma();
  const terms = await prisma.wikiTerm.findMany({
    orderBy: { updatedAt: 'desc' },
  });

  return terms.map(convertPrismaWikiTermToRow);
}

export async function getTermById(id: string): Promise<WikiTermRow | undefined> {
  const prisma = getPrisma();
  const term = await prisma.wikiTerm.findUnique({
    where: { id },
  });

  return term ? convertPrismaWikiTermToRow(term) : undefined;
}

export async function upsertTerm(
  term: Omit<WikiTermRow, 'updated_at'>
): Promise<WikiTermRow> {
  const prisma = getPrisma();
  const upserted = await prisma.wikiTerm.upsert({
    where: { id: term.id },
    update: {
      title: term.title,
      description: term.description,
      category: term.category,
      author: term.author,
      coverUrl: term.cover_url,
      updatedAt: new Date(),
    },
    create: {
      id: term.id,
      title: term.title,
      description: term.description,
      category: term.category,
      author: term.author,
      coverUrl: term.cover_url,
      updatedAt: new Date(),
    },
  });

  return convertPrismaWikiTermToRow(upserted);
}

export async function deleteTermById(id: string): Promise<void> {
  const prisma = getPrisma();
  await prisma.wikiTerm.delete({
    where: { id },
  });
}

// ─── Shorts ────────────────────────────────────────────────────────────────────

export async function getShortsFromDb(): Promise<string[]> {
  const prisma = getPrisma();
  const shorts = await prisma.short.findMany({
    orderBy: { createdAt: 'desc' },
    select: { url: true },
  });

  return shorts.map(convertPrismaShortToUrl);
}

export async function addShortToDb(url: string): Promise<void> {
  const prisma = getPrisma();
  await prisma.short.create({
    data: { url },
  });
}

export async function deleteShortFromDb(url: string): Promise<void> {
  const prisma = getPrisma();
  await prisma.short.delete({
    where: { url },
  });
}

// ─── News ──────────────────────────────────────────────────────────────────────

export async function getLatestNews(limit = 5): Promise<NewsRow[]> {
  const prisma = getPrisma();
  const news = await prisma.news.findMany({
    orderBy: { publishedAt: 'desc' },
    take: limit,
  });

  return news.map(convertPrismaNewsToRow);
}

export async function getNewsById(id: number): Promise<NewsRow | undefined> {
  const prisma = getPrisma();
  const news = await prisma.news.findUnique({
    where: { id },
  });

  return news ? convertPrismaNewsToRow(news) : undefined;
}

export async function createNews(
  news: Omit<NewsRow, 'id' | 'views'>
): Promise<NewsRow> {
  const prisma = getPrisma();
  const created = await prisma.news.create({
    data: {
      title: news.title,
      summary: news.summary,
      content: news.content,
      coverUrl: news.cover_url,
      views: 0,
      publishedAt: new Date(news.published_at),
    },
  });

  return convertPrismaNewsToRow(created);
}

export async function updateNews(news: NewsRow): Promise<NewsRow> {
  const prisma = getPrisma();
  const updated = await prisma.news.update({
    where: { id: news.id },
    data: {
      title: news.title,
      summary: news.summary,
      content: news.content,
      coverUrl: news.cover_url,
      publishedAt: new Date(news.published_at),
    },
  });

  return convertPrismaNewsToRow(updated);
}

export async function deleteNews(id: number): Promise<void> {
  const prisma = getPrisma();
  await prisma.news.delete({
    where: { id },
  });
}

export async function incrementNewsViews(id: number): Promise<void> {
  const prisma = getPrisma();
  await prisma.news.update({
    where: { id },
    data: { views: { increment: 1 } },
  });
}

// ─── Instructors ──────────────────────────────────────────────────────────────

export async function getAllInstructors(): Promise<InstructorRow[]> {
  const prisma = getPrisma();
  const instructors = await prisma.instructor.findMany({
    orderBy: [{ sortOrder: 'asc' }, { id: 'asc' }],
  });

  return instructors.map(convertPrismaInstructorToRow);
}

export async function getInstructorById(id: number): Promise<InstructorRow | undefined> {
  const prisma = getPrisma();
  const instructor = await prisma.instructor.findUnique({
    where: { id },
  });

  return instructor ? convertPrismaInstructorToRow(instructor) : undefined;
}

export async function getInstructorBySlug(slug: string): Promise<InstructorRow | undefined> {
  const prisma = getPrisma();
  const instructor = await prisma.instructor.findUnique({
    where: { slug },
  });

  return instructor ? convertPrismaInstructorToRow(instructor) : undefined;
}

export async function createInstructor(
  data: Omit<InstructorRow, 'id'>
): Promise<InstructorRow> {
  const prisma = getPrisma();
  const slug = data.slug || createSlug(data.name);

  const created = await prisma.instructor.create({
    data: {
      name: data.name,
      specialty: data.specialty,
      feature: data.feature,
      experience: data.experience,
      bio: data.bio,
      image: data.image,
      video: data.video,
      sortOrder: data.sort_order,
      slug,
      presentationVideo: data.presentation_video ?? '',
      performanceVideos: JSON.stringify(data.performance_videos ?? []),
      techniques: JSON.stringify(data.techniques ?? []),
    },
  });

  return convertPrismaInstructorToRow(created);
}

export async function updateInstructor(data: InstructorRow): Promise<InstructorRow> {
  const prisma = getPrisma();
  const updated = await prisma.instructor.update({
    where: { id: data.id },
    data: {
      name: data.name,
      specialty: data.specialty,
      feature: data.feature,
      experience: data.experience,
      bio: data.bio,
      image: data.image,
      video: data.video,
      sortOrder: data.sort_order,
      slug: data.slug,
      presentationVideo: data.presentation_video,
      performanceVideos: JSON.stringify(data.performance_videos ?? []),
      techniques: JSON.stringify(data.techniques ?? []),
    },
  });

  return convertPrismaInstructorToRow(updated);
}

export async function deleteInstructor(id: number): Promise<void> {
  const prisma = getPrisma();
  await prisma.instructor.delete({
    where: { id },
  });
}

// ─── Users ────────────────────────────────────────────────────────────────────

export async function getUserByEmail(email: string): Promise<UserRow | undefined> {
  const prisma = getPrisma();
  const user = await prisma.user.findUnique({
    where: { email },
  });

  return user ? convertPrismaUserToRow(user) : undefined;
}

export async function getUserById(id: number): Promise<UserRow | undefined> {
  const prisma = getPrisma();
  const user = await prisma.user.findUnique({
    where: { id },
  });

  return user ? convertPrismaUserToRow(user) : undefined;
}

export async function createUser(data: {
  email: string;
  passwordHash: string;
  role?: UserRole;
  verificationToken?: string;
  tokenExpiresAt?: string;
}): Promise<UserRow> {
  const prisma = getPrisma();
  const created = await prisma.user.create({
    data: {
      email: data.email,
      passwordHash: data.passwordHash,
      role: data.role ?? 'client',
      emailVerified: false,
      verificationToken: data.verificationToken ?? null,
      tokenExpiresAt: data.tokenExpiresAt ? new Date(data.tokenExpiresAt) : null,
    },
  });

  return convertPrismaUserToRow(created);
}

export async function updateUser(
  id: number,
  data: Partial<
    Pick<
      UserRow,
      'email_verified' | 'verification_token' | 'token_expires_at' | 'role' | 'password_hash'
    >
  >
): Promise<void> {
  const prisma = getPrisma();
  const updateData: Record<string, unknown> = {};

  if (data.email_verified !== undefined) {
    updateData.emailVerified = data.email_verified === 1;
  }
  if (data.verification_token !== undefined) {
    updateData.verificationToken = data.verification_token;
  }
  if (data.token_expires_at !== undefined) {
    updateData.tokenExpiresAt = data.token_expires_at ? new Date(data.token_expires_at) : null;
  }
  if (data.role !== undefined) {
    updateData.role = data.role;
  }
  if (data.password_hash !== undefined) {
    updateData.passwordHash = data.password_hash;
  }

  if (Object.keys(updateData).length === 0) return;

  await prisma.user.update({
    where: { id },
    data: updateData,
  });
}

export async function deleteUser(id: number): Promise<void> {
  const prisma = getPrisma();
  await prisma.user.delete({
    where: { id },
  });
}

export async function getAllUsers(): Promise<UserRow[]> {
  const prisma = getPrisma();
  const users = await prisma.user.findMany({
    orderBy: { createdAt: 'desc' },
  });

  return users.map(convertPrismaUserToRow);
}

export async function getUserByVerificationToken(token: string): Promise<UserRow | undefined> {
  const prisma = getPrisma();
  const user = await prisma.user.findUnique({
    where: { verificationToken: token },
  });

  return user ? convertPrismaUserToRow(user) : undefined;
}

export async function getUserByResetToken(token: string): Promise<UserRow | undefined> {
  const prisma = getPrisma();
  const user = await prisma.user.findUnique({
    where: { resetToken: token },
  });

  return user ? convertPrismaUserToRow(user) : undefined;
}

export async function setPasswordResetToken(
  userId: number,
  token: string,
  expiresAt: string
): Promise<void> {
  const prisma = getPrisma();
  await prisma.user.update({
    where: { id: userId },
    data: {
      resetToken: token,
      resetTokenExpires: new Date(expiresAt),
    },
  });
}

export async function clearPasswordResetToken(userId: number): Promise<void> {
  const prisma = getPrisma();
  await prisma.user.update({
    where: { id: userId },
    data: {
      resetToken: null,
      resetTokenExpires: null,
    },
  });
}

export async function updateUserPassword(userId: number, passwordHash: string): Promise<void> {
  const prisma = getPrisma();
  await prisma.user.update({
    where: { id: userId },
    data: {
      passwordHash,
      resetToken: null,
      resetTokenExpires: null,
    },
  });
}

// ─── Programs ──────────────────────────────────────────────────────────────────

export async function getAllPrograms(): Promise<ProgramRow[]> {
  const prisma = getPrisma();
  const programs = await prisma.program.findMany({
    orderBy: [{ sortOrder: 'asc' }, { id: 'asc' }],
  });

  return programs.map(convertPrismaProgramToRow);
}

export async function getProgramBySlug(slug: string): Promise<ProgramRow | undefined> {
  const prisma = getPrisma();
  const program = await prisma.program.findUnique({
    where: { slug },
  });

  return program ? convertPrismaProgramToRow(program) : undefined;
}

export async function getProgramById(id: number): Promise<ProgramRow | undefined> {
  const prisma = getPrisma();
  const program = await prisma.program.findUnique({
    where: { id },
  });

  return program ? convertPrismaProgramToRow(program) : undefined;
}

export async function createProgram(
  data: Omit<ProgramRow, 'id' | 'created_at' | 'updated_at'>
): Promise<ProgramRow> {
  const prisma = getPrisma();
  const created = await prisma.program.create({
    data: {
      slug: data.slug,
      title: data.title,
      shortDescription: data.short_description,
      fullDescription: data.full_description,
      packages: JSON.stringify(data.packages ?? []),
      lessonDuration: data.lesson_duration,
      programDuration: data.program_duration,
      features: JSON.stringify(data.features ?? []),
      isPopular: data.is_popular,
      sortOrder: data.sort_order,
    },
  });

  return convertPrismaProgramToRow(created);
}

export async function updateProgram(data: ProgramRow): Promise<ProgramRow> {
  const prisma = getPrisma();
  const updated = await prisma.program.update({
    where: { id: data.id },
    data: {
      slug: data.slug,
      title: data.title,
      shortDescription: data.short_description,
      fullDescription: data.full_description,
      packages: JSON.stringify(data.packages ?? []),
      lessonDuration: data.lesson_duration,
      programDuration: data.program_duration,
      features: JSON.stringify(data.features ?? []),
      isPopular: data.is_popular,
      sortOrder: data.sort_order,
    },
  });

  return convertPrismaProgramToRow(updated);
}

export async function deleteProgram(id: number): Promise<void> {
  const prisma = getPrisma();
  await prisma.program.delete({
    where: { id },
  });
}

// ─── Cleanup ───────────────────────────────────────────────────────────────────

export async function closePrisma(): Promise<void> {
  if (prismaInstance) {
    await prismaInstance.$disconnect();
    prismaInstance = null;
  }
}
