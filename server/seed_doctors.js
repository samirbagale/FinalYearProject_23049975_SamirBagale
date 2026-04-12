const mongoose = require('mongoose');
const User = require('./models/User');

const MONGO_URI = 'mongodb://127.0.0.1:27017/mindcare';

const doctors = [
    {
        username: "Dr. Sameer Bhatta",
        email: "sameer@mindcare.com",
        password: "password123",
        role: "psychiatrist",
        credentials: "MD, Psychiatry (T.U.)",
        experience: 12,
        bio: "Specializing in adult mental health and cognitive behavioral therapy with over a decade of experience in clinical practice.",
        specialties: ["Anxiety", "Depression", "OCD"],
        languages: ["English", "Nepali", "Hindi"],
        profilePhoto: "https://images.unsplash.com/photo-1612349317150-e413f6a5b16d?auto=format&fit=crop&q=80&w=400",
        stats: { sessions: "2.5k+", rating: 4.9, reviews: 480 },
        approaches: ["CBT", "Humanistic", "Integrative"],
        reviews: [
            { text: "Very understanding and patient.", time: "2 days ago" },
            { text: "Helped me manage my anxiety much better.", time: "1 week ago" }
        ]
    },
    {
        username: "Dr. Anjali Sharma",
        email: "anjali@mindcare.com",
        password: "password123",
        role: "psychiatrist",
        credentials: "M.Phil. in Clinical Psychology",
        experience: 8,
        bio: "Dedicated to helping young adults navigate life transitions and emotional challenges through empathetic counseling.",
        specialties: ["Young Adult Care", "Stress Management"],
        languages: ["English", "Nepali"],
        profilePhoto: "https://images.unsplash.com/photo-1594824476967-48c8b964273f?auto=format&fit=crop&q=80&w=400",
        stats: { sessions: "1.8k+", rating: 4.8, reviews: 320 },
        approaches: ["Dialectical Behavior Therapy", "Person-Centered"],
        reviews: [
            { text: "Anjali is wonderful with student stress.", time: "3 days ago" }
        ]
    },
    {
        username: "Dr. Rajesh Hamal",
        email: "rajesh@mindcare.com",
        password: "password123",
        role: "psychiatrist",
        credentials: "MBBS, MD (Psychiatry)",
        experience: 15,
        bio: "Extensive background in treating complex trauma and mood disorders using evidence-based approaches.",
        specialties: ["Trauma", "PTSD", "Bipolar Disorder"],
        languages: ["Nepali", "English"],
        profilePhoto: "https://images.unsplash.com/photo-1537368910025-700350fe46c7?auto=format&fit=crop&q=80&w=400",
        stats: { sessions: "3.2k+", rating: 5.0, reviews: 600 },
        approaches: ["Trauma-Informed Care", "Psychodynamic"],
        reviews: [
            { text: "The best in Nepal.", time: "A month ago" }
        ]
    },
    {
        username: "Dr. Priya Karki",
        email: "priya@mindcare.com",
        password: "password123",
        role: "psychiatrist",
        credentials: "Ph.D. in Psychotherapy",
        experience: 10,
        bio: "Focuses on holistic mental wellness and mindfulness-based stress reduction techniques.",
        specialties: ["Mindfulness", "Wellness", "Anxiety"],
        languages: ["English", "Nepali"],
        profilePhoto: "https://images.unsplash.com/photo-1559839734-2b71ea197ec2?auto=format&fit=crop&q=80&w=400",
        stats: { sessions: "2.1k+", rating: 4.9, reviews: 290 },
        approaches: ["Mindfulness-Based CBT", "Yoga Therapy"],
        reviews: [
            { text: "Helped me find peace.", time: "4 days ago" }
        ]
    },
    {
        username: "Dr. Binay Shah",
        email: "binay@mindcare.com",
        password: "password123",
        role: "psychiatrist",
        credentials: "MD, Psychiatry",
        experience: 7,
        bio: "Expert in child and adolescent psychiatry, focusing on developmental challenges and family therapy.",
        specialties: ["Child Care", "Family Therapy"],
        languages: ["Nepali", "Hindi", "English"],
        profilePhoto: "https://images.unsplash.com/photo-1622253692010-333f2da6031d?auto=format&fit=crop&q=80&w=400",
        stats: { sessions: "1.2k+", rating: 4.7, reviews: 150 },
        approaches: ["Play Therapy", "Structural Family Therapy"]
    },
    {
        username: "Dr. Sunita Thapa",
        email: "sunita@mindcare.com",
        password: "password123",
        role: "psychiatrist",
        credentials: "Masters in Psychology",
        experience: 9,
        bio: "Passionate about empowering women's mental health and addressing postpartum challenges.",
        specialties: ["Women's Health", "Depression", "Anxiety"],
        languages: ["English", "Nepali"],
        profilePhoto: "https://images.unsplash.com/photo-1594824476967-48c8b964273f?auto=format&fit=crop&q=80&w=400",
        stats: { sessions: "2k+", rating: 4.9, reviews: 410 },
        approaches: ["Interpersonal Therapy", "Feminist Therapy"]
    },
    {
        username: "Dr. Kiran Rai",
        email: "kiran@mindcare.com",
        password: "password123",
        role: "psychiatrist",
        credentials: "MD, Psychiatry",
        experience: 11,
        bio: "Specializes in geriatric psychiatry and neurological mental health concerns.",
        specialties: ["Memory Care", "Depression"],
        languages: ["Nepali", "English"],
        profilePhoto: "https://images.unsplash.com/photo-1551601651-2a8555f1a136?auto=format&fit=crop&q=80&w=400",
        stats: { sessions: "2.4k+", rating: 4.8, reviews: 340 },
        approaches: ["Reminiscence Therapy", "CBT for TBI"]
    },
    {
        username: "Dr. Maya Adhikari",
        email: "maya@mindcare.com",
        password: "password123",
        role: "psychiatrist",
        credentials: "Ph.D. in Behavioral Science",
        experience: 6,
        bio: "Innovative approach to behavioral addictions and habit formation using AI-assisted tools.",
        specialties: ["Addiction", "CBT"],
        languages: ["English", "Nepali"],
        profilePhoto: "https://images.unsplash.com/photo-1623854767648-e7bb8009f0ad?auto=format&fit=crop&q=80&w=400",
        stats: { sessions: "900+", rating: 4.6, reviews: 110 },
        approaches: ["Motivational Interviewing", "Cue-Exposure Therapy"]
    },
    {
        username: "Dr. Dipendra Oli",
        email: "dipendra@mindcare.com",
        password: "password123",
        role: "psychiatrist",
        credentials: "MD, Psychiatry",
        experience: 14,
        bio: "Veteran psychiatrist with expertise in forensic psychiatry and diagnostic assessments.",
        specialties: ["Diagnosis", "Legal Psychiatry"],
        languages: ["Nepali", "Hindi", "English"],
        profilePhoto: "https://images.unsplash.com/photo-1612349317150-e413f6a5b16d?auto=format&fit=crop&q=80&w=400",
        stats: { sessions: "3.5k+", rating: 4.9, reviews: 520 },
        approaches: ["Clinical Interviewing", "Evidence-Based Diagnosis"]
    },
    {
        username: "Dr. Sabina Gurung",
        email: "sabina@mindcare.com",
        password: "password123",
        role: "psychiatrist",
        credentials: "Masters in Counseling",
        experience: 5,
        bio: "Youth-focused counselor emphasizing mental health accessibility and digital wellness.",
        specialties: ["Stress", "Relationship Advice"],
        languages: ["English", "Nepali"],
        profilePhoto: "https://images.unsplash.com/photo-1559839734-2b71ea197ec2?auto=format&fit=crop&q=80&w=400",
        stats: { sessions: "800+", rating: 4.5, reviews: 90 },
        approaches: ["Solution-Focused Brief Therapy", "Narrative Therapy"]
    }
];

const seed = async () => {
    try {
        await mongoose.connect(MONGO_URI);
        console.log('Connected to MongoDB for seeding...');

        for (const doc of doctors) {
            const preparedDoc = {
                ...doc,
                languages: doc.languages.join(', '),
                stats: Object.entries(doc.stats).map(([k, v]) => ({ label: k.charAt(0).toUpperCase() + k.slice(1), value: v.toString() }))
            };

            await User.findOneAndUpdate(
                { email: doc.email },
                preparedDoc,
                { upsert: true, new: true }
            );
            console.log(`Synced/Created: ${doc.username}`);
        }

        console.log('Seeding completed successfully!');
        process.exit(0);
    } catch (err) {
        console.error('Seeding error:', err);
        process.exit(1);
    }
};

seed();
