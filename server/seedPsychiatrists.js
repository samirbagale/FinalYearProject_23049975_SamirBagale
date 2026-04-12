const mongoose = require('mongoose');
const dotenv = require('dotenv');
const User = require('./models/User');

dotenv.config();

const DOCTOR_PROFILES = [
  {
    username: "Dr. Aisha Khan",
    email: "aisha@mindcare.com",
    role: "psychiatrist",
    password: "password123",
    credentials: "MBBS, MRCPsych",
    experience: 11,
    sessions: 203,
    rating: 5.0,
    languages: "English, Hindi, Nepali",
    specialties: ["Anxiety","Depression","Trauma","Grief & Loss","Self-Esteem"],
    bio: "Dr. Aisha Khan is a compassionate psychiatrist with over 11 years of experience helping individuals navigate life's most challenging moments. Trained at the Royal College of Psychiatrists in the UK, she specialises in trauma-informed care and has worked extensively with survivors of grief, abuse, and chronic anxiety. Her sessions are built on warmth, patience, and deep respect for each person's unique journey. She firmly believes that healing is not linear — and she will walk every step of it with you.",
    quote: "I believe every person holds the strength to heal within themselves. My role is simply to help you find it.",
    approaches: ["CBT","Trauma-Informed","Person-Centred","Mindfulness","Psychodynamic"],
    education: [{ degree:"MRCPsych", institute:"Royal College of Psychiatrists, UK" }, { degree:"MBBS", institute:"Tribhuvan University, Nepal" }],
    helps: ["Panic attacks and generalised anxiety disorder", "Processing grief, loss and major life changes", "Low self-worth and negative thought patterns", "Trauma recovery and PTSD", "Depression and emotional numbness"],
    stats: [{ value:"98%", label:"Client satisfaction" }, { value:"< 2h", label:"Response time" }, { value:"50 min", label:"Session duration" }],
    gradient: 'linear-gradient(135deg, #a78bfa, #7c3aed)',
    profilePhoto: "https://randomuser.me/api/portraits/women/44.jpg"
  },
  {
    username: "Dr. Priya Sharma",
    email: "priya@mindcare.com",
    role: "psychiatrist",
    password: "password123",
    credentials: "MBBS, MD Psychiatry",
    experience: 9,
    sessions: 142,
    rating: 4.9,
    languages: "English, Hindi, Nepali",
    specialties: ["Stress","Anxiety","Depression","Relationships"],
    bio: "Dr. Priya Sharma is a warm and solution-focused psychiatrist who has spent 9 years helping people break free from stress, burnout, and the weight of difficult relationships. She completed her MD in Psychiatry from AIIMS New Delhi and combines evidence-based Cognitive Behavioural Therapy with mindfulness techniques tailored to each individual. Known for her calm energy and practical approach, Dr. Sharma has a gift for turning overwhelming emotions into manageable, actionable steps. Patients often describe sessions with her as finally feeling like they can breathe again.",
    quote: "Progress does not have to be perfect. Small, consistent steps forward are what build a genuinely healthier life.",
    approaches: ["CBT","Mindfulness","Solution-Focused","Psychoeducation","Integrative"],
    education: [{ degree:"MD Psychiatry", institute:"AIIMS New Delhi, India" }, { degree:"MBBS", institute:"Kathmandu Medical College, Nepal" }],
    helps: ["Workplace stress and burnout", "Relationship conflicts and communication", "Anxiety and racing thoughts", "Depression and low motivation", "Building healthy daily habits and routines"],
    stats: [{ value:"97%", label:"Client satisfaction" }, { value:"< 3h", label:"Response time" }, { value:"50 min", label:"Session duration" }],
    gradient: 'linear-gradient(135deg, #34d399, #059669)',
    profilePhoto: "https://randomuser.me/api/portraits/women/68.jpg"
  },
  {
    username: "Dr. Arjun Mehta",
    email: "arjun@mindcare.com",
    role: "psychiatrist",
    password: "password123",
    credentials: "MBBS, MD Psychiatry",
    experience: 6,
    sessions: 89,
    rating: 4.7,
    languages: "English, Hindi, Nepali",
    specialties: ["Grief","Relationships","Sleep Issues","Stress"],
    bio: "Dr. Arjun Mehta is a dedicated and empathetic psychiatrist who brings a refreshingly honest and grounded approach to mental health. With 6 years of experience and training from B.P. Koirala Institute of Health Sciences, he specialises in helping people work through grief, relationship struggles, and sleep disorders that are quietly draining their quality of life. Dr. Mehta blends modern psychological techniques with a deep cultural understanding of his patients, creating a space where people feel genuinely understood — not just clinically assessed. His sessions are practical, real, and always centred around you.",
    quote: "Mental health is not about being fixed. It is about being understood — and from that understanding, finding your own way forward.",
    approaches: ["Solution-Focused","Integrative","Motivational Interviewing","Narrative Therapy","Supportive Therapy"],
    education: [{ degree:"MD Psychiatry", institute:"B.P. Koirala Institute of Health Sciences, Nepal" }, { degree:"MBBS", institute:"Manipal College of Medical Sciences, India" }],
    helps: ["Grief, bereavement and loss", "Relationship breakdowns and family conflict", "Insomnia and disrupted sleep patterns", "Chronic stress and emotional exhaustion", "Life transitions and identity struggles"],
    stats: [{ value:"95%", label:"Client satisfaction" }, { value:"< 4h", label:"Response time" }, { value:"50 min", label:"Session duration" }],
    gradient: 'linear-gradient(135deg, #60a5fa, #2563eb)',
    profilePhoto: "https://randomuser.me/api/portraits/men/32.jpg"
  }
];

const seedPsychiatrists = async () => {
    try {
        await mongoose.connect(process.env.MONGODB_URI || 'mongodb://127.0.0.1:27017/mindcare');
        console.log('MongoDB connected');

        // Delete existing ones to avoid confusion, or update them
        for (const doc of DOCTOR_PROFILES) {
            const user = await User.findOneAndUpdate(
                { email: doc.email },
                doc,
                { upsert: true, new: true, runValidators: true }
            );
            console.log(`Physician updated/created: ${user.username}`);
        }

        console.log('Seeding complete');
        process.exit();
    } catch (err) {
        console.error(err);
        process.exit(1);
    }
};

seedPsychiatrists();
