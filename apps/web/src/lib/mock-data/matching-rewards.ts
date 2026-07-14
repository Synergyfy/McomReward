
export interface MatchingReward {
    id: string;
    title: string;
    description: string;
    image: string;
    matchingPointsRequired: number;
    originalValue: number;
    quantity: number;
    remainingQuantity: number;
    category: string;
    merchantName: string;
    merchantLogo?: string;
    isSuperBusiness: boolean;
    expiryDate: string;
    gallery?: string[];
}

export const MATCHING_REWARDS: MatchingReward[] = [
    {
        id: "r1",
        title: "5-Night Luxury Stay at The Grand Resort",
        description: "Experience the ultimate relaxation with a 5-night stay in our ocean view suite. Includes daily breakfast, spa access, and a complimentary dinner for two. Perfect for a romantic getaway or a rejuvenating break.",
        image: "https://images.unsplash.com/photo-1566073771259-6a8506099945?q=80&w=1000&auto=format&fit=crop",
        matchingPointsRequired: 5000,
        originalValue: 2500,
        quantity: 10,
        remainingQuantity: 3,
        category: "Travel",
        merchantName: "The Grand Resort",
        merchantLogo: "https://placehold.co/100x100?text=GR",
        isSuperBusiness: true,
        expiryDate: "2024-12-31T23:59:59Z",
        gallery: [
            "https://images.unsplash.com/photo-1566073771259-6a8506099945?q=80&w=1000&auto=format&fit=crop",
            "https://images.unsplash.com/photo-1520250497591-112f2f40a3f4?q=80&w=1000&auto=format&fit=crop",
            "https://images.unsplash.com/photo-1582719478250-c89cae4dc85b?q=80&w=1000&auto=format&fit=crop"
        ]
    },
    {
        id: "r2",
        title: "Latest Gen Smartphone Pro Max",
        description: "Upgrade to the latest technology with the Smartphone Pro Max. Features a stunning display, advanced camera system, and all-day battery life. Stay connected in style.",
        image: "https://images.unsplash.com/photo-1511707171634-5f897ff02aa9?q=80&w=1000&auto=format&fit=crop",
        matchingPointsRequired: 2500,
        originalValue: 1200,
        quantity: 50,
        remainingQuantity: 12,
        category: "Electronics",
        merchantName: "TechWorld",
        isSuperBusiness: true,
        expiryDate: "2024-06-30T23:59:59Z",
        gallery: [
            "https://images.unsplash.com/photo-1511707171634-5f897ff02aa9?q=80&w=1000&auto=format&fit=crop",
            "https://images.unsplash.com/photo-1616348436168-de43ad0db179?q=80&w=1000&auto=format&fit=crop"
        ]
    },
    {
        id: "r3",
        title: "Gourmet Dining Experience for Two",
        description: "Indulge in a 7-course tasting menu prepared by our award-winning chef. Includes wine pairing and a private tour of the kitchen.",
        image: "https://images.unsplash.com/photo-1517248135467-4c7edcad34c4?q=80&w=1000&auto=format&fit=crop",
        matchingPointsRequired: 800,
        originalValue: 300,
        quantity: 20,
        remainingQuantity: 18,
        category: "Dining",
        merchantName: "Le Petit Bistro",
        isSuperBusiness: false,
        expiryDate: "2024-09-15T23:59:59Z",
        gallery: [
            "https://images.unsplash.com/photo-1517248135467-4c7edcad34c4?q=80&w=1000&auto=format&fit=crop",
            "https://images.unsplash.com/photo-1559339352-11d035aa65de?q=80&w=1000&auto=format&fit=crop"
        ]
    },
    {
        id: "r4",
        title: "Designer Handbag Collection",
        description: "Choose from our exclusive collection of designer handbags. Crafted from premium leather and available in various colors.",
        image: "https://images.unsplash.com/photo-1584917865442-de89df76afd3?q=80&w=1000&auto=format&fit=crop",
        matchingPointsRequired: 1500,
        originalValue: 800,
        quantity: 15,
        remainingQuantity: 0,
        category: "Fashion",
        merchantName: "Vogue Boutique",
        isSuperBusiness: true,
        expiryDate: "2024-11-30T23:59:59Z"
    },
    {
        id: "r5",
        title: "Annual Gym Membership + Personal Training",
        description: "Get fit with a full year of access to our state-of-the-art gym facilities. Includes 10 sessions with a certified personal trainer.",
        image: "https://images.unsplash.com/photo-1534438327276-14e5300c3a48?q=80&w=1000&auto=format&fit=crop",
        matchingPointsRequired: 1200,
        originalValue: 600,
        quantity: 30,
        remainingQuantity: 25,
        category: "Health & Wellness",
        merchantName: "FitLife Gym",
        isSuperBusiness: false,
        expiryDate: "2025-01-01T23:59:59Z"
    },
    {
        id: "r6",
        title: "Exclusive Coffee & Pastry Bundle",
        description: "Enjoy a month of free coffee and pastries at our downtown cafe. The perfect way to start your mornings.",
        image: "https://images.unsplash.com/photo-1509042239860-f550ce710b93?q=80&w=1000&auto=format&fit=crop",
        matchingPointsRequired: 300,
        originalValue: 100,
        quantity: 100,
        remainingQuantity: 88,
        category: "Dining",
        merchantName: "Morning Brew",
        isSuperBusiness: false,
        expiryDate: "2024-05-31T23:59:59Z"
    }

];
