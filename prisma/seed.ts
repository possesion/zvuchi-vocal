import { PrismaClient } from '@prisma/client';
import bcrypt from 'bcryptjs';

const prisma = new PrismaClient();

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

  // Seed admin user if ADMIN_EMAIL and ADMIN_PASSWORD are set
  if (process.env.ADMIN_EMAIL && process.env.ADMIN_PASSWORD) {
    console.log('👤 Seeding admin user...');
    const existingAdmin = await prisma.user.findUnique({
      where: { email: process.env.ADMIN_EMAIL },
    });

    if (!existingAdmin) {
      const passwordHash = bcrypt.hashSync(process.env.ADMIN_PASSWORD, 12);
      await prisma.user.create({
        data: {
          email: process.env.ADMIN_EMAIL,
          passwordHash,
          role: 'admin',
          emailVerified: true,
        },
      });
      console.log(`✅ Admin user created: ${process.env.ADMIN_EMAIL}`);
    } else {
      console.log(`⏭️  Admin user already exists: ${process.env.ADMIN_EMAIL}`);
    }
  } else {
    console.log('⏭️  Skipping admin user seeding (ADMIN_EMAIL or ADMIN_PASSWORD not set)');
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
