import { notFound } from 'next/navigation';
import Link from 'next/link';
import { ChevronLeft } from 'lucide-react';
import { Header } from '@/components/layout/header';
import { Footer } from '@/components/layout/footer';
import { getInstructorBySlug, getTermById } from '@/lib/db';
import { auth } from '@/auth';
import { canEdit } from '@/lib/roles';
import { InstructorProfile } from '@/components/sections/instructor-profile';

interface InstructorPageProps {
    params: Promise<{ slug: string }>;
}

export async function generateMetadata({ params }: InstructorPageProps) {
    const { slug } = await params;
    const instructor = getInstructorBySlug(decodeURIComponent(slug));

    if (!instructor) {
        return {
            title: 'Педагог не найден | Звучи',
            description: 'Запрашиваемый педагог не найден',
        };
    }

    const description = [instructor.feature, instructor.experience, instructor.bio]
        .filter(Boolean)
        .join(' — ')
        .slice(0, 160);

    return {
        title: `${instructor.name} — преподаватель вокала | Звучи`,
        description,
        openGraph: {
            title: `${instructor.name} — преподаватель вокала | Звучи`,
            description,
            type: 'profile',
            images: instructor.image ? [{ url: instructor.image }] : [],
        },
        twitter: {
            card: 'summary_large_image',
            title: `${instructor.name} — преподаватель вокала | Звучи`,
            description,
            images: instructor.image ? [instructor.image] : [],
        },
    };
}

export default async function InstructorPage({ params }: InstructorPageProps) {
    const { slug } = await params;
    const instructor = getInstructorBySlug(decodeURIComponent(slug));

    if (!instructor) {
        notFound();
    }

    const session = await auth();
    const isAuthorized = canEdit(session?.user?.role);

    const techniqueTerms = instructor.techniques
        .map((id) => getTermById(id))
        .filter((t): t is NonNullable<typeof t> => t !== undefined);

    return (
        <div className="relative min-h-screen font-exo2">
            <Header />
            <main className="w-full flex-1 primary-bg overflow-x-hidden">
                <section className="relative min-h-screen py-12 text-white">
                    <div className="container mx-auto px-4">
                        <Link
                            href="/instructors"
                            className="mb-8 inline-flex items-center gap-2 text-white/60 transition-colors hover:text-white"
                        >
                            <ChevronLeft className="h-5 w-5" />
                            Все педагоги
                        </Link>

                        <div className="mx-auto max-w-5xl">
                            <InstructorProfile
                                instructor={instructor}
                                techniqueTerms={techniqueTerms}
                                isAuthorized={isAuthorized}
                            />
                        </div>
                    </div>
                </section>
            </main>
            <Footer />
        </div>
    );
}
