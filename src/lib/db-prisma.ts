import { PrismaClient } from '@prisma/client';
import { createSlug } from '@/app/api/v1/utils';
import {
  WikiCategoryRow,
  WikiTermRow,
  NewsRow,
  InstructorRow,
  UserRow,
  UserRole,
} from './types';

// ─── Singleton Prisma Client ──────────────────────────────────────────────────

let prisma: PrismaClient;

function getPrisma(): PrismaClient {
  if (!prisma) {
    // Use DATABASE_URL as-is from environment
    // Prisma handles relative paths correctly in both local and Docker contexts
    const dbUrl = process.env.DATABASE_URL || 'file:./data/wiki.db';

    prisma = new PrismaClient({
      datasources: {
        db: { url: dbUrl },
      },
    });
  }
  return prisma;
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
    created_at: user.createdAt.toISOString(),
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
  const categories = await getPrisma().wikiCategory.findMany({
    orderBy: { id: 'asc' },
  });

  return categories.map((cat) => ({
    id: cat.id,
    label: cat.label,
  }));
}

export async function getCategoryLabel(id: string): Promise<string> {
  const category = await getPrisma().wikiCategory.findUnique({
    where: { id },
  });

  return category?.label ?? id;
}

// ─── Wiki Terms ────────────────────────────────────────────────────────────────

export async function getAllTerms(): Promise<WikiTermRow[]> {
  const terms = await getPrisma().wikiTerm.findMany({
    orderBy: { updatedAt: 'desc' },
  });

  return terms.map(convertPrismaWikiTermToRow);
}

export async function getTermById(id: string): Promise<WikiTermRow | undefined> {
  const term = await getPrisma().wikiTerm.findUnique({
    where: { id },
  });

  return term ? convertPrismaWikiTermToRow(term) : undefined;
}

export async function upsertTerm(
  term: Omit<WikiTermRow, 'updated_at'>
): Promise<WikiTermRow> {
  const upserted = await getPrisma().wikiTerm.upsert({
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
  await getPrisma().wikiTerm.delete({
    where: { id },
  });
}

// ─── Shorts ────────────────────────────────────────────────────────────────────

export async function getShortsFromDb(): Promise<string[]> {
  const shorts = await getPrisma().short.findMany({
    orderBy: { createdAt: 'desc' },
    select: { url: true },
  });

  return shorts.map(convertPrismaShortToUrl);
}

export async function addShortToDb(url: string): Promise<void> {
  await getPrisma().short.create({
    data: { url },
  });
}

export async function deleteShortFromDb(url: string): Promise<void> {
  await getPrisma().short.delete({
    where: { url },
  });
}

// ─── News ──────────────────────────────────────────────────────────────────────

export async function getLatestNews(limit = 5): Promise<NewsRow[]> {
  const news = await getPrisma().news.findMany({
    orderBy: { publishedAt: 'desc' },
    take: limit,
  });

  return news.map(convertPrismaNewsToRow);
}

export async function getNewsById(id: number): Promise<NewsRow | undefined> {
  const news = await getPrisma().news.findUnique({
    where: { id },
  });

  return news ? convertPrismaNewsToRow(news) : undefined;
}

export async function createNews(
  news: Omit<NewsRow, 'id' | 'views'>
): Promise<NewsRow> {
  const created = await getPrisma().news.create({
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
  const updated = await getPrisma().news.update({
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
  await getPrisma().news.delete({
    where: { id },
  });
}

export async function incrementNewsViews(id: number): Promise<void> {
  await getPrisma().news.update({
    where: { id },
    data: { views: { increment: 1 } },
  });
}

// ─── Instructors ──────────────────────────────────────────────────────────────

export async function getAllInstructors(): Promise<InstructorRow[]> {
  const instructors = await getPrisma().instructor.findMany({
    orderBy: [{ sortOrder: 'asc' }, { id: 'asc' }],
  });

  return instructors.map(convertPrismaInstructorToRow);
}

export async function getInstructorById(id: number): Promise<InstructorRow | undefined> {
  const instructor = await getPrisma().instructor.findUnique({
    where: { id },
  });

  return instructor ? convertPrismaInstructorToRow(instructor) : undefined;
}

export async function getInstructorBySlug(slug: string): Promise<InstructorRow | undefined> {
  const instructor = await getPrisma().instructor.findUnique({
    where: { slug },
  });

  return instructor ? convertPrismaInstructorToRow(instructor) : undefined;
}

export async function createInstructor(
  data: Omit<InstructorRow, 'id'>
): Promise<InstructorRow> {
  const slug = data.slug || createSlug(data.name);

  const created = await getPrisma().instructor.create({
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
  const updated = await getPrisma().instructor.update({
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
  await getPrisma().instructor.delete({
    where: { id },
  });
}

// ─── Users ────────────────────────────────────────────────────────────────────

export async function getUserByEmail(email: string): Promise<UserRow | undefined> {
  const user = await getPrisma().user.findUnique({
    where: { email },
  });

  return user ? convertPrismaUserToRow(user) : undefined;
}

export async function getUserById(id: number): Promise<UserRow | undefined> {
  const user = await getPrisma().user.findUnique({
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
  const created = await getPrisma().user.create({
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

  await getPrisma().user.update({
    where: { id },
    data: updateData,
  });
}

export async function deleteUser(id: number): Promise<void> {
  await getPrisma().user.delete({
    where: { id },
  });
}

export async function getAllUsers(): Promise<UserRow[]> {
  const users = await getPrisma().user.findMany({
    orderBy: { createdAt: 'desc' },
  });

  return users.map(convertPrismaUserToRow);
}

export async function getUserByVerificationToken(token: string): Promise<UserRow | undefined> {
  const user = await getPrisma().user.findUnique({
    where: { verificationToken: token },
  });

  return user ? convertPrismaUserToRow(user) : undefined;
}

// ─── Cleanup ───────────────────────────────────────────────────────────────────

export async function closePrisma(): Promise<void> {
  if (prisma) {
    await prisma.$disconnect();
  }
}
