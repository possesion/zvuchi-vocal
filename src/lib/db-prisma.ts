import { PrismaClient } from '../../prisma/generated/client';
import { PrismaBetterSqlite3 } from '@prisma/adapter-better-sqlite3';
import { createSlug } from '@/app/api/v1/utils';
import path from 'path';

import {
  WikiCategoryRow,
  WikiTermRow,
  NewsArticle,
  Instructor,
  AppUser,
  UserUpdateData,
  UserRole,
  Program,
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

  return terms.map((term) => ({
    id: term.id,
    title: term.title,
    description: term.description,
    category: term.category,
    author: term.author,
    coverUrl: term.coverUrl,
    updatedAt: term.updatedAt.toISOString(),
  }));
}

export async function getTermById(id: string): Promise<WikiTermRow | undefined> {
  const prisma = getPrisma();
  const term = await prisma.wikiTerm.findUnique({
    where: { id },
  });

  if (!term) return undefined;
  return {
    id: term.id,
    title: term.title,
    description: term.description,
    category: term.category,
    author: term.author,
    coverUrl: term.coverUrl,
    updatedAt: term.updatedAt.toISOString(),
  };
}

export async function upsertTerm(
  term: Omit<WikiTermRow, 'updatedAt'>
): Promise<WikiTermRow> {
  const prisma = getPrisma();
  const upserted = await prisma.wikiTerm.upsert({
    where: { id: term.id },
    update: {
      title: term.title,
      description: term.description,
      category: term.category,
      author: term.author,
      coverUrl: term.coverUrl,
      updatedAt: new Date(),
    },
    create: {
      id: term.id,
      title: term.title,
      description: term.description,
      category: term.category,
      author: term.author,
      coverUrl: term.coverUrl,
      updatedAt: new Date(),
    },
  });

  return {
    id: upserted.id,
    title: upserted.title,
    description: upserted.description,
    category: upserted.category,
    author: upserted.author,
    coverUrl: upserted.coverUrl,
    updatedAt: upserted.updatedAt.toISOString(),
  };
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

  return shorts.map((s) => s.url);
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

export async function getLatestNews(limit = 5): Promise<NewsArticle[]> {
  const prisma = getPrisma();
  const news = await prisma.news.findMany({
    orderBy: { publishedAt: 'desc' },
    take: limit,
  });

  return news.map(({ id, title, summary, content, coverUrl, views, publishedAt }) => ({
    id,
    title,
    summary,
    content,
    coverUrl,
    views,
    publishedAt: publishedAt.toISOString(),
  }));
}

export async function getNewsById(id: number): Promise<NewsArticle | undefined> {
  const prisma = getPrisma();
  const news = await prisma.news.findUnique({
    where: { id },
  });

  if (!news) return undefined;
  return {
    id: news.id,
    title: news.title,
    summary: news.summary,
    content: news.content,
    coverUrl: news.coverUrl,
    views: news.views,
    publishedAt: news.publishedAt.toISOString(),
  };
}

export async function createNews(
  { title, summary, content, coverUrl, publishedAt }: Omit<NewsArticle, 'id' | 'views'>
): Promise<NewsArticle> {
  const prisma = getPrisma();
  const created = await prisma.news.create({
    data: {
      title,
      summary,
      content,
      coverUrl,
      views: 0,
      publishedAt: new Date(publishedAt),
    },
  });

  return {
    id: created.id,
    title: created.title,
    summary: created.summary,
    content: created.content,
    coverUrl: created.coverUrl,
    views: created.views,
    publishedAt: created.publishedAt.toISOString(),
  };
}

export async function updateNews({ id, title, summary, content, coverUrl, publishedAt }: NewsArticle): Promise<NewsArticle> {
  const prisma = getPrisma();
  const updated = await prisma.news.update({
    where: { id },
    data: {
      title,
      summary,
      content,
      coverUrl,
      publishedAt: new Date(publishedAt),
    },
  });

  return {
    id: updated.id,
    title: updated.title,
    summary: updated.summary,
    content: updated.content,
    coverUrl: updated.coverUrl,
    views: updated.views,
    publishedAt: updated.publishedAt.toISOString(),
  };
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

export async function getAllInstructors(): Promise<Instructor[]> {
  const prisma = getPrisma();
  const instructors = await prisma.instructor.findMany({
    orderBy: [{ sortOrder: 'asc' }, { id: 'asc' }],
  });

  return instructors.map((inst) => {
    let performanceVideos: string[] = [];
    let techniques: string[] = [];

    try {
      performanceVideos = JSON.parse(inst.performanceVideos);
    } catch {
      performanceVideos = [];
    }

    try {
      techniques = JSON.parse(inst.techniques);
    } catch {
      techniques = [];
    }

    return {
      id: inst.id,
      name: inst.name,
      specialty: inst.specialty,
      feature: inst.feature,
      experience: inst.experience,
      bio: inst.bio,
      image: inst.image,
      video: inst.video,
      sortOrder: inst.sortOrder,
      slug: inst.slug,
      presentationVideo: inst.presentationVideo,
      performanceVideos,
      techniques,
    };
  });
}

export async function getInstructorById(id: number): Promise<Instructor | undefined> {
  const prisma = getPrisma();
  const inst = await prisma.instructor.findUnique({
    where: { id },
  });

  if (!inst) return undefined;

  let performanceVideos: string[] = [];
  let techniques: string[] = [];

  try {
    performanceVideos = JSON.parse(inst.performanceVideos);
  } catch {
    performanceVideos = [];
  }

  try {
    techniques = JSON.parse(inst.techniques);
  } catch {
    techniques = [];
  }

  return {
    id: inst.id,
    name: inst.name,
    specialty: inst.specialty,
    feature: inst.feature,
    experience: inst.experience,
    bio: inst.bio,
    image: inst.image,
    video: inst.video,
    sortOrder: inst.sortOrder,
    slug: inst.slug,
    presentationVideo: inst.presentationVideo,
    performanceVideos,
    techniques,
  };
}

export async function getInstructorBySlug(slug: string): Promise<Instructor | undefined> {
  const prisma = getPrisma();
  const inst = await prisma.instructor.findUnique({
    where: { slug },
  });

  if (!inst) return undefined;

  let performanceVideos: string[] = [];
  let techniques: string[] = [];

  try {
    performanceVideos = JSON.parse(inst.performanceVideos);
  } catch {
    performanceVideos = [];
  }

  try {
    techniques = JSON.parse(inst.techniques);
  } catch {
    techniques = [];
  }

  return {
    id: inst.id,
    name: inst.name,
    specialty: inst.specialty,
    feature: inst.feature,
    experience: inst.experience,
    bio: inst.bio,
    image: inst.image,
    video: inst.video,
    sortOrder: inst.sortOrder,
    slug: inst.slug,
    presentationVideo: inst.presentationVideo,
    performanceVideos,
    techniques,
  };
}

export async function getInstructorByName(name: string): Promise<Instructor | undefined> {
  const prisma = getPrisma();
  const inst = await prisma.instructor.findFirst({
    where: { name },
  });

  if (!inst) return undefined;

  let performanceVideos: string[] = [];
  let techniques: string[] = [];

  try {
    performanceVideos = JSON.parse(inst.performanceVideos);
  } catch {
    performanceVideos = [];
  }

  try {
    techniques = JSON.parse(inst.techniques);
  } catch {
    techniques = [];
  }

  return {
    id: inst.id,
    name: inst.name,
    specialty: inst.specialty,
    feature: inst.feature,
    experience: inst.experience,
    bio: inst.bio,
    image: inst.image,
    video: inst.video,
    sortOrder: inst.sortOrder,
    slug: inst.slug,
    presentationVideo: inst.presentationVideo,
    performanceVideos,
    techniques,
  };
}

export async function createInstructor(
  data: Omit<Instructor, 'id'>
): Promise<Instructor> {
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
      sortOrder: data.sortOrder,
      slug,
      presentationVideo: data.presentationVideo ?? '',
      performanceVideos: JSON.stringify(data.performanceVideos ?? []),
      techniques: JSON.stringify(data.techniques ?? []),
    },
  });

  let performanceVideos: string[] = [];
  let techniques: string[] = [];

  try {
    performanceVideos = JSON.parse(created.performanceVideos);
  } catch {
    performanceVideos = [];
  }

  try {
    techniques = JSON.parse(created.techniques);
  } catch {
    techniques = [];
  }

  return {
    id: created.id,
    name: created.name,
    specialty: created.specialty,
    feature: created.feature,
    experience: created.experience,
    bio: created.bio,
    image: created.image,
    video: created.video,
    sortOrder: created.sortOrder,
    slug: created.slug,
    presentationVideo: created.presentationVideo,
    performanceVideos,
    techniques,
  };
}

export async function updateInstructor(data: Instructor): Promise<Instructor> {
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
      sortOrder: data.sortOrder,
      slug: data.slug,
      presentationVideo: data.presentationVideo,
      performanceVideos: JSON.stringify(data.performanceVideos ?? []),
      techniques: JSON.stringify(data.techniques ?? []),
    },
  });

  let performanceVideos: string[] = [];
  let techniques: string[] = [];

  try {
    performanceVideos = JSON.parse(updated.performanceVideos);
  } catch {
    performanceVideos = [];
  }

  try {
    techniques = JSON.parse(updated.techniques);
  } catch {
    techniques = [];
  }

  return {
    id: updated.id,
    name: updated.name,
    specialty: updated.specialty,
    feature: updated.feature,
    experience: updated.experience,
    bio: updated.bio,
    image: updated.image,
    video: updated.video,
    sortOrder: updated.sortOrder,
    slug: updated.slug,
    presentationVideo: updated.presentationVideo,
    performanceVideos,
    techniques,
  };
}

export async function deleteInstructor(id: number): Promise<void> {
  const prisma = getPrisma();
  await prisma.instructor.delete({
    where: { id },
  });
}

// ─── Users ────────────────────────────────────────────────────────────────────

export async function getUserByEmail(email: string): Promise<AppUser | undefined> {
  const prisma = getPrisma();
  const user = await prisma.user.findUnique({
    where: { email },
  });

  if (!user) return undefined;
  return {
    id: user.id,
    email: user.email,
    passwordHash: user.passwordHash,
    name: user.name,
    phone: user.phone,
    phoneVerified: user.phoneVerified,
    phoneVerifyCode: user.phoneVerifyCode,
    phoneCodeExpires: user.phoneCodeExpires ? user.phoneCodeExpires.toISOString() : null,
    role: user.role as UserRole,
    emailVerified: user.emailVerified,
    verificationToken: user.verificationToken,
    tokenExpiresAt: user.tokenExpiresAt ? user.tokenExpiresAt.toISOString() : null,
    resetToken: user.resetToken,
    resetTokenExpires: user.resetTokenExpires ? user.resetTokenExpires.toISOString() : null,
    createdAt: user.createdAt.toISOString(),
  };
}

export async function getUserById(id: number): Promise<AppUser | undefined> {
  const prisma = getPrisma();
  const user = await prisma.user.findUnique({
    where: { id },
  });

  if (!user) return undefined;
  return {
    id: user.id,
    email: user.email,
    passwordHash: user.passwordHash,
    name: user.name,
    phone: user.phone,
    phoneVerified: user.phoneVerified,
    phoneVerifyCode: user.phoneVerifyCode,
    phoneCodeExpires: user.phoneCodeExpires ? user.phoneCodeExpires.toISOString() : null,
    role: user.role as UserRole,
    emailVerified: user.emailVerified,
    verificationToken: user.verificationToken,
    tokenExpiresAt: user.tokenExpiresAt ? user.tokenExpiresAt.toISOString() : null,
    resetToken: user.resetToken,
    resetTokenExpires: user.resetTokenExpires ? user.resetTokenExpires.toISOString() : null,
    createdAt: user.createdAt.toISOString(),
  };
}

export async function createUser(data: {
  email: string;
  passwordHash: string;
  role?: UserRole;
  verificationToken?: string;
  tokenExpiresAt?: string;
}): Promise<AppUser> {
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

  return {
    id: created.id,
    email: created.email,
    passwordHash: created.passwordHash,
    name: created.name,
    phone: created.phone,
    phoneVerified: created.phoneVerified,
    phoneVerifyCode: created.phoneVerifyCode,
    phoneCodeExpires: created.phoneCodeExpires ? created.phoneCodeExpires.toISOString() : null,
    role: created.role as UserRole,
    emailVerified: created.emailVerified,
    verificationToken: created.verificationToken,
    tokenExpiresAt: created.tokenExpiresAt ? created.tokenExpiresAt.toISOString() : null,
    resetToken: created.resetToken,
    resetTokenExpires: created.resetTokenExpires ? created.resetTokenExpires.toISOString() : null,
    createdAt: created.createdAt.toISOString(),
  };
}

export async function updateUser(
  id: number,
  data: UserUpdateData
): Promise<void> {
  const prisma = getPrisma();

  if (Object.keys(data).length === 0) return;

  await prisma.user.update({
    where: { id },
    data: {
      ...(data.emailVerified !== undefined && { emailVerified: data.emailVerified }),
      ...(data.verificationToken !== undefined && { verificationToken: data.verificationToken }),
      ...(data.tokenExpiresAt !== undefined && {
        tokenExpiresAt: data.tokenExpiresAt ? new Date(data.tokenExpiresAt) : null,
      }),
      ...(data.role !== undefined && { role: data.role }),
      ...(data.passwordHash !== undefined && { passwordHash: data.passwordHash }),
      ...(data.name !== undefined && { name: data.name }),
      ...(data.phone !== undefined && { phone: data.phone }),
      ...(data.phoneVerified !== undefined && { phoneVerified: data.phoneVerified }),
      ...(data.phoneVerifyCode !== undefined && { phoneVerifyCode: data.phoneVerifyCode }),
      ...(data.phoneCodeExpires !== undefined && {
        phoneCodeExpires: data.phoneCodeExpires ? new Date(data.phoneCodeExpires) : null,
      }),
    },
  });
}

export async function deleteUser(id: number): Promise<void> {
  const prisma = getPrisma();
  await prisma.user.delete({
    where: { id },
  });
}

export async function getAllUsers(): Promise<AppUser[]> {
  const prisma = getPrisma();
  const users = await prisma.user.findMany({
    orderBy: { createdAt: 'desc' },
  });

  return users.map((user) => ({
    id: user.id,
    email: user.email,
    passwordHash: user.passwordHash,
    name: user.name,
    phone: user.phone,
    phoneVerified: user.phoneVerified,
    phoneVerifyCode: user.phoneVerifyCode,
    phoneCodeExpires: user.phoneCodeExpires ? user.phoneCodeExpires.toISOString() : null,
    role: user.role as UserRole,
    emailVerified: user.emailVerified,
    verificationToken: user.verificationToken,
    tokenExpiresAt: user.tokenExpiresAt ? user.tokenExpiresAt.toISOString() : null,
    resetToken: user.resetToken,
    resetTokenExpires: user.resetTokenExpires ? user.resetTokenExpires.toISOString() : null,
    createdAt: user.createdAt.toISOString(),
  }));
}

export async function getUserByVerificationToken(token: string): Promise<AppUser | undefined> {
  const prisma = getPrisma();
  const user = await prisma.user.findUnique({
    where: { verificationToken: token },
  });

  if (!user) return undefined;
  return {
    id: user.id,
    email: user.email,
    passwordHash: user.passwordHash,
    name: user.name,
    phone: user.phone,
    phoneVerified: user.phoneVerified,
    phoneVerifyCode: user.phoneVerifyCode,
    phoneCodeExpires: user.phoneCodeExpires ? user.phoneCodeExpires.toISOString() : null,
    role: user.role as UserRole,
    emailVerified: user.emailVerified,
    verificationToken: user.verificationToken,
    tokenExpiresAt: user.tokenExpiresAt ? user.tokenExpiresAt.toISOString() : null,
    resetToken: user.resetToken,
    resetTokenExpires: user.resetTokenExpires ? user.resetTokenExpires.toISOString() : null,
    createdAt: user.createdAt.toISOString(),
  };
}

export async function getUserByResetToken(token: string): Promise<AppUser | undefined> {
  const prisma = getPrisma();
  const user = await prisma.user.findUnique({
    where: { resetToken: token },
  });

  if (!user) return undefined;
  return {
    id: user.id,
    email: user.email,
    passwordHash: user.passwordHash,
    name: user.name,
    phone: user.phone,
    phoneVerified: user.phoneVerified,
    phoneVerifyCode: user.phoneVerifyCode,
    phoneCodeExpires: user.phoneCodeExpires ? user.phoneCodeExpires.toISOString() : null,
    role: user.role as UserRole,
    emailVerified: user.emailVerified,
    verificationToken: user.verificationToken,
    tokenExpiresAt: user.tokenExpiresAt ? user.tokenExpiresAt.toISOString() : null,
    resetToken: user.resetToken,
    resetTokenExpires: user.resetTokenExpires ? user.resetTokenExpires.toISOString() : null,
    createdAt: user.createdAt.toISOString(),
  };
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

export async function getAllPrograms(): Promise<Program[]> {
  const prisma = getPrisma();
  const programs = await prisma.program.findMany({
    orderBy: [{ sortOrder: 'asc' }, { id: 'asc' }],
  });

  return programs.map((p) => {
    let packages: Program['packages'] = [];
    let features: string[] = [];

    try {
      packages = JSON.parse(p.packages);
    } catch {
      packages = [];
    }

    try {
      features = JSON.parse(p.features);
    } catch {
      features = [];
    }

    return {
      id: p.id,
      slug: p.slug,
      title: p.title,
      shortDescription: p.shortDescription,
      fullDescription: p.fullDescription,
      packages,
      lessonDuration: p.lessonDuration,
      programDuration: p.programDuration,
      features,
      isPopular: p.isPopular,
      sortOrder: p.sortOrder,
      createdAt: p.createdAt.toISOString(),
      updatedAt: p.updatedAt.toISOString(),
    };
  });
}

export async function getProgramBySlug(slug: string): Promise<Program | undefined> {
  const prisma = getPrisma();
  const p = await prisma.program.findUnique({
    where: { slug },
  });

  if (!p) return undefined;

  let packages: Program['packages'] = [];
  let features: string[] = [];

  try {
    packages = JSON.parse(p.packages);
  } catch {
    packages = [];
  }

  try {
    features = JSON.parse(p.features);
  } catch {
    features = [];
  }

  return {
    id: p.id,
    slug: p.slug,
    title: p.title,
    shortDescription: p.shortDescription,
    fullDescription: p.fullDescription,
    packages,
    lessonDuration: p.lessonDuration,
    programDuration: p.programDuration,
    features,
    isPopular: p.isPopular,
    sortOrder: p.sortOrder,
    createdAt: p.createdAt.toISOString(),
    updatedAt: p.updatedAt.toISOString(),
  };
}

export async function getProgramById(id: number): Promise<Program | undefined> {
  const prisma = getPrisma();
  const p = await prisma.program.findUnique({
    where: { id },
  });

  if (!p) return undefined;

  let packages: Program['packages'] = [];
  let features: string[] = [];

  try {
    packages = JSON.parse(p.packages);
  } catch {
    packages = [];
  }

  try {
    features = JSON.parse(p.features);
  } catch {
    features = [];
  }

  return {
    id: p.id,
    slug: p.slug,
    title: p.title,
    shortDescription: p.shortDescription,
    fullDescription: p.fullDescription,
    packages,
    lessonDuration: p.lessonDuration,
    programDuration: p.programDuration,
    features,
    isPopular: p.isPopular,
    sortOrder: p.sortOrder,
    createdAt: p.createdAt.toISOString(),
    updatedAt: p.updatedAt.toISOString(),
  };
}

export async function createProgram(
  data: Omit<Program, 'id' | 'createdAt' | 'updatedAt'>
): Promise<Program> {
  const prisma = getPrisma();
  const created = await prisma.program.create({
    data: {
      slug: data.slug,
      title: data.title,
      shortDescription: data.shortDescription,
      fullDescription: data.fullDescription,
      packages: JSON.stringify(data.packages ?? []),
      lessonDuration: data.lessonDuration,
      programDuration: data.programDuration,
      features: JSON.stringify(data.features ?? []),
      isPopular: data.isPopular,
      sortOrder: data.sortOrder,
    },
  });

  let packages: Program['packages'] = [];
  let features: string[] = [];

  try {
    packages = JSON.parse(created.packages);
  } catch {
    packages = [];
  }

  try {
    features = JSON.parse(created.features);
  } catch {
    features = [];
  }

  return {
    id: created.id,
    slug: created.slug,
    title: created.title,
    shortDescription: created.shortDescription,
    fullDescription: created.fullDescription,
    packages,
    lessonDuration: created.lessonDuration,
    programDuration: created.programDuration,
    features,
    isPopular: created.isPopular,
    sortOrder: created.sortOrder,
    createdAt: created.createdAt.toISOString(),
    updatedAt: created.updatedAt.toISOString(),
  };
}

export async function updateProgram(data: Program): Promise<Program> {
  const prisma = getPrisma();
  const updated = await prisma.program.update({
    where: { id: data.id },
    data: {
      slug: data.slug,
      title: data.title,
      shortDescription: data.shortDescription,
      fullDescription: data.fullDescription,
      packages: JSON.stringify(data.packages ?? []),
      lessonDuration: data.lessonDuration,
      programDuration: data.programDuration,
      features: JSON.stringify(data.features ?? []),
      isPopular: data.isPopular,
      sortOrder: data.sortOrder,
    },
  });

  let packages: Program['packages'] = [];
  let features: string[] = [];

  try {
    packages = JSON.parse(updated.packages);
  } catch {
    packages = [];
  }

  try {
    features = JSON.parse(updated.features);
  } catch {
    features = [];
  }

  return {
    id: updated.id,
    slug: updated.slug,
    title: updated.title,
    shortDescription: updated.shortDescription,
    fullDescription: updated.fullDescription,
    packages,
    lessonDuration: updated.lessonDuration,
    programDuration: updated.programDuration,
    features,
    isPopular: updated.isPopular,
    sortOrder: updated.sortOrder,
    createdAt: updated.createdAt.toISOString(),
    updatedAt: updated.updatedAt.toISOString(),
  };
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
