import "dotenv/config";
import { PrismaClient } from '../prisma/generated/client';
import { PrismaBetterSqlite3 } from '@prisma/adapter-better-sqlite3';
import bcrypt from 'bcryptjs';

const adapter = new PrismaBetterSqlite3({
  url: process.env.DATABASE_URL || 'file:./data/wiki.db',
});

const prisma = new PrismaClient({ adapter });

const SEED_CATEGORIES = [
  { id: 'technique', label: 'Техника' },
  { id: 'method', label: 'Методика' },
  { id: 'concept', label: 'Анатомия' },
];

const SEED_TERMS = [
  { id: 'evt', title: 'Estill Voice Training – EVT', category: 'method', description: 'Усовершенствованная система обучения вокалу, разработанная американским педагогом и голосовым экспертом Джо Эстилл. Этот метод основан на глубоких знаниях анатомии и физиологии голосообразования, что позволяет каждому ученику понять, как правильно управлять своим голосом. EVT помогает раскрыть истинный потенциал вашего вокала, научиться управлять им с максимальной эффективностью и при этом сохранять здоровье голосовых складок.' },
];

async function main() {
  console.log('🌱 Starting database seeding...');

  // Check if database already has data
  const existingCategories = await prisma.wikiCategory.count();
  const existingTerms = await prisma.wikiTerm.count();

  if (existingCategories > 0 && existingTerms > 0) {
    console.log('⏭️  Database already contains data. Skipping seed to preserve existing data.');
    console.log(`   Found ${existingCategories} categories and ${existingTerms} terms.`);
  } else {
    // Seed categories only if empty
    if (existingCategories === 0) {
      console.log('📚 Seeding wiki categories...');
      for (const category of SEED_CATEGORIES) {
        await prisma.wikiCategory.upsert({
          where: { id: category.id },
          update: {},
          create: category,
        });
      }
      console.log('✅ Wiki categories seeded');
    } else {
      console.log('⏭️  Wiki categories already exist. Skipping...');
    }

    // Seed terms only if empty
    if (existingTerms === 0) {
      console.log('📖 Seeding wiki terms...');
      for (const term of SEED_TERMS) {
        await prisma.wikiTerm.upsert({
          where: { id: term.id },
          update: {},
          create: {
            ...term,
            author: '',
            coverUrl: '',
          },
        });
      }
      console.log('✅ Wiki terms seeded');
    } else {
      console.log('⏭️  Wiki terms already exist. Skipping...');
    }
  }

  console.log('✨ Database seeding completed!');
}

main()
  .catch((e) => {
    console.error('❌ Seeding failed:', e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
