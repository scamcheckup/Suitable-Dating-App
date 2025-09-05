import { supabase } from './supabase';

export interface LoveMeterQuestion {
  id: number;
  question: string;
  options: {
    text: string;
    score: number;
  }[];
}

export interface LoveMeterResult {
  id: string;
  user_id: string;
  score: number;
  category: string;
  answers: Record<number, number>;
  created_at: string;
}

export interface LoveMeterCategory {
  title: string;
  description: string;
  color: string;
  gradient: string[];
  minScore: number;
  advice: string[];
  nextSteps: string[];
}

// Get love meter questions
export const getLoveMeterQuestions = async (): Promise<{ questions: LoveMeterQuestion[]; error: any }> => {
  try {
    const { data, error } = await supabase
      .from('love_meter_questions')
      .select('id, question, options')
      .eq('active', true)
      .order('id', { ascending: true });

    if (error) throw error;
    return { questions: data || [], error: null };
  } catch (error) {
    return { questions: [], error };
  }
};

// Submit love meter quiz
export const submitLoveMeterQuiz = async (
  userId: string,
  answers: Record<number, number>
): Promise<{ result: LoveMeterResult | null; error: any }> => {
  try {
    // Calculate score
    const totalScore = Object.values(answers).reduce((sum, score) => sum + score, 0);
    const averageScore = Math.round(totalScore / Object.keys(answers).length);
    
    // Save result using database function
    const { data, error } = await supabase.rpc('save_love_meter_result', {
      p_user_id: userId,
      p_score: averageScore,
      p_answers: answers
    });

    if (error) throw error;
    
    // Get the saved result
    const { data: result, error: resultError } = await supabase
      .from('love_meter_results')
      .select('*')
      .eq('id', data)
      .single();
      
    if (resultError) throw resultError;

    return { result, error: null };
  } catch (error) {
    return { result: null, error };
  }
};

// Get user's love meter results
export const getUserLoveMeterResults = async (
  userId: string
): Promise<{ results: LoveMeterResult[]; error: any }> => {
  try {
    const { data, error } = await supabase
      .from('love_meter_results')
      .select('*')
      .eq('user_id', userId)
      .order('created_at', { ascending: false });

    if (error) throw error;
    return { results: data || [], error: null };
  } catch (error) {
    return { results: [], error };
  }
};

// Get love meter result by ID
export const getLoveMeterResult = async (
  resultId: string
): Promise<{ result: LoveMeterResult | null; error: any }> => {
  try {
    const { data, error } = await supabase
      .from('love_meter_results')
      .select('*')
      .eq('id', resultId)
      .single();

    if (error) throw error;
    return { result: data, error: null };
  } catch (error) {
    return { result: null, error };
  }
};

// Get category details based on score
export const getLoveMeterCategory = (score: number): LoveMeterCategory => {
  const categories: LoveMeterCategory[] = [
    {
      title: "Deeply In Love",
      description: "They have strong romantic feelings for you and are likely in love. Their actions consistently show deep interest, care, and commitment.",
      color: "#10B981",
      gradient: ["#10B981", "#34D399"],
      minScore: 85,
      advice: [
        "They're showing clear signs of being in love with you",
        "Their actions consistently demonstrate deep interest",
        "They prioritize you in their life and future plans",
        "They're emotionally invested and vulnerable with you",
        "They make consistent effort to connect with you"
      ],
      nextSteps: [
        "Have an open conversation about your feelings",
        "If you feel the same way, consider moving the relationship forward",
        "Continue building emotional intimacy and trust",
        "Discuss your relationship goals and timeline"
      ]
    },
    {
      title: "Strongly Interested",
      description: "They have significant interest in you that goes beyond friendship. They're likely developing deeper feelings but may not be fully in love yet.",
      color: "#F59E0B",
      gradient: ["#F59E0B", "#FBBF24"],
      minScore: 70,
      advice: [
        "They show clear signs of romantic interest in you",
        "They're making consistent effort to connect with you",
        "They're likely thinking about you often",
        "They enjoy spending time with you and want more",
        "They may be developing deeper feelings"
      ],
      nextSteps: [
        "Continue spending quality time together",
        "Gradually increase emotional intimacy",
        "Look for opportunities to deepen your connection",
        "Consider expressing your interest if you feel the same"
      ]
    },
    {
      title: "Curious & Friendly",
      description: "They enjoy your company and may be open to exploring a deeper connection, but their feelings aren't clearly romantic yet.",
      color: "#8B5CF6",
      gradient: ["#8B5CF6", "#A78BFA"],
      minScore: 50,
      advice: [
        "They enjoy your company and conversation",
        "They're open to spending time with you",
        "They may be curious about you romantically",
        "Their feelings are still developing or unclear",
        "They're friendly but not showing strong romantic signals"
      ],
      nextSteps: [
        "Focus on building a stronger friendship first",
        "Create opportunities for deeper conversations",
        "Be patient and don't rush romantic expectations",
        "Look for gradual increases in their interest level"
      ]
    },
    {
      title: "Just Friends",
      description: "They value you as a friend and enjoy your company, but they're likely not seeing you in a romantic light at this time.",
      color: "#3B82F6",
      gradient: ["#3B82F6", "#60A5FA"],
      minScore: 30,
      advice: [
        "They see you primarily as a friend",
        "They enjoy your company but aren't showing romantic interest",
        "They may not be thinking about you romantically",
        "Their behavior is consistent with how they treat other friends",
        "They're comfortable but not flirtatious with you"
      ],
      nextSteps: [
        "Value the friendship you have",
        "Don't pressure them with romantic expectations",
        "Consider whether you're content with friendship",
        "If you have strong feelings, prepare for the possibility they may not reciprocate"
      ]
    },
    {
      title: "Not Interested",
      description: "They don't currently show signs of romantic interest. Their behavior suggests they see you as an acquaintance or casual friend at most.",
      color: "#6B7280",
      gradient: ["#6B7280", "#9CA3AF"],
      minScore: 0,
      advice: [
        "They're showing minimal investment in connecting with you",
        "Their responses and availability are inconsistent",
        "They don't prioritize communication with you",
        "They keep conversations surface-level",
        "They don't show curiosity about your personal life"
      ],
      nextSteps: [
        "Focus your emotional energy elsewhere",
        "Maintain friendly but casual interactions",
        "Avoid reading too much into small gestures",
        "Consider exploring connections with others who show clear interest"
      ]
    }
  ];

  return categories.find(category => score >= category.minScore) || categories[categories.length - 1];
};