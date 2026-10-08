import { NextResponse } from "next/server";
import { db } from "@/db";
import { providerProfiles, users, services, reviews, portfolioItems, availability, categories } from "@/db/schema";
import { eq, or } from "drizzle-orm";
import { getSessionUser } from "@/lib/auth";
import { MOCK_PROVIDERS, MOCK_SERVICES } from "@/lib/mockData";

export async function GET(
  req: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  const { id } = await params;

  try {
    const [row] = await db
      .select({
        profile: providerProfiles,
        user: users,
      })
      .from(providerProfiles)
      .innerJoin(users, eq(providerProfiles.userId, users.id))
      .where(or(eq(providerProfiles.id, id), eq(providerProfiles.userId, id)))
      .limit(1);

    if (row) {
      const providerServices = await db
        .select({
          service: services,
          category: categories,
        })
        .from(services)
        .innerJoin(categories, eq(services.categoryId, categories.id))
        .where(eq(services.providerId, row.profile.id));

      const providerReviews = await db
        .select({
          review: reviews,
          customer: users,
        })
        .from(reviews)
        .innerJoin(users, eq(reviews.customerId, users.id))
        .where(eq(reviews.providerId, row.profile.id));

      const portfolio = await db
        .select()
        .from(portfolioItems)
        .where(eq(portfolioItems.providerId, row.profile.id));

      const schedule = await db
        .select()
        .from(availability)
        .where(eq(availability.providerId, row.profile.id));

      return NextResponse.json({
        success: true,
        data: {
          ...row.profile,
          user: {
            id: row.user.id,
            name: row.user.name,
            email: row.user.email,
            phone: row.user.phone,
            avatar: row.user.avatar,
            location: row.user.location,
            role: row.user.role,
          },
          services: providerServices.map((s) => ({
            ...s.service,
            category: s.category,
          })),
          reviews: providerReviews.map((r) => ({
            ...r.review,
            customer: {
              id: r.customer.id,
              name: r.customer.name,
              avatar: r.customer.avatar,
            },
          })),
          portfolio,
          availability: schedule,
        },
      });
    }
  } catch (error) {
    // Fallback to mock providers
  }

  // Fallback to mock data
  const mockPro = MOCK_PROVIDERS.find((p) => p.id === id || p.userId === id) || MOCK_PROVIDERS[0];
  const mockServs = MOCK_SERVICES.filter((s) => s.providerId === mockPro.id);

  const defaultReviews = [
    {
      id: "rev_gen_1",
      rating: 5,
      comment: "Zabardast kaam kiya! Waqt par pohanchay aur bohat safai aur imandari se kaam mukammal kiya.",
      createdAt: new Date(Date.now() - 86400000 * 3).toISOString(),
      customer: {
        id: "cust_1",
        name: "Usman Tariq",
        avatar: "https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=100&auto=format&fit=crop&q=80",
      },
    },
    {
      id: "rev_gen_2",
      rating: 5,
      comment: "Bohat munasib charges hain aur behaviour bohat achha tha. Kaamhub ki best service!",
      createdAt: new Date(Date.now() - 86400000 * 7).toISOString(),
      customer: {
        id: "cust_2",
        name: "Fatima Ali",
        avatar: "https://images.unsplash.com/photo-1494790108377-be9c29b29330?w=100&auto=format&fit=crop&q=80",
      },
    },
  ];

  const defaultPortfolio = [
    {
      id: "port_gen_1",
      title: `${mockPro.profession} - Quality On-Site Job`,
      description: "Standard professional tools and guaranteed craftsmanship delivered on site.",
      image: mockPro.coverImage || "https://images.unsplash.com/photo-1581092160607-ee22621dd758?w=800&auto=format&fit=crop&q=80",
    },
  ];

  const defaultAvailability = [
    { dayOfWeek: "Monday - Saturday", startTime: "09:00 AM", endTime: "08:00 PM", isAvailable: true },
    { dayOfWeek: "Sunday (Emergency)", startTime: "10:00 AM", endTime: "04:00 PM", isAvailable: true },
  ];

  return NextResponse.json({
    success: true,
    data: {
      ...mockPro,
      services: mockServs,
      reviews: mockPro.reviews && mockPro.reviews.length > 0 ? mockPro.reviews : defaultReviews,
      portfolio: mockPro.portfolio && mockPro.portfolio.length > 0 ? mockPro.portfolio : defaultPortfolio,
      availability: mockPro.availability && mockPro.availability.length > 0 ? mockPro.availability : defaultAvailability,
    },
  });
}

export async function PUT(
  req: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    const user = await getSessionUser();
    if (!user) {
      return NextResponse.json({ success: false, message: "Unauthorized" }, { status: 401 });
    }

    const [profile] = await db
      .select()
      .from(providerProfiles)
      .where(or(eq(providerProfiles.id, id), eq(providerProfiles.userId, id)))
      .limit(1);

    if (!profile) {
      return NextResponse.json({ success: false, message: "Provider profile not found" }, { status: 404 });
    }

    if (user.role !== "ADMIN" && profile.userId !== user.id) {
      return NextResponse.json({ success: false, message: "Forbidden" }, { status: 403 });
    }

    const body = await req.json();
    const { profession, bio, experience, startingPrice, serviceAreas, coverImage, name, phone, location, avatar } = body;

    const [updatedProfile] = await db
      .update(providerProfiles)
      .set({
        profession: profession !== undefined ? profession : profile.profession,
        bio: bio !== undefined ? bio : profile.bio,
        experience: experience !== undefined ? experience : profile.experience,
        startingPrice: startingPrice !== undefined ? Number(startingPrice) : profile.startingPrice,
        serviceAreas: serviceAreas !== undefined ? serviceAreas : profile.serviceAreas,
        coverImage: coverImage !== undefined ? coverImage : profile.coverImage,
        updatedAt: new Date(),
      })
      .where(eq(providerProfiles.id, profile.id))
      .returning();

    if (name || phone || location || avatar) {
      await db
        .update(users)
        .set({
          name: name || undefined,
          phone: phone || undefined,
          location: location || undefined,
          avatar: avatar || undefined,
          updatedAt: new Date(),
        })
        .where(eq(users.id, profile.userId));
    }

    return NextResponse.json({
      success: true,
      message: "Provider profile updated successfully",
      data: updatedProfile,
    });
  } catch (error) {
    console.error("PUT provider error:", error);
    return NextResponse.json({ success: false, message: "Failed to update provider profile" }, { status: 500 });
  }
}
