import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { IntakeQuestionnaire, MoodType } from '@/types'
import { getMoodEmoji } from '@/utils/helpers'

const Intake = () => {
  const navigate = useNavigate()
  const [step, setStep] = useState(1)
  const [formData, setFormData] = useState<Partial<IntakeQuestionnaire>>({
    currentMood: undefined,
    concerns: [],
    goals: [],
    preferredSupportType: undefined,
    stressLevel: undefined,
    sleepQuality: undefined,
    socialSupport: undefined,
  })

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    // TODO: Save intake data to API
    // For now, just navigate to home
    navigate('/')
  }

  const handleSkip = () => {
    // Allow users to skip intake questionnaire
    navigate('/')
  }

  const moods: MoodType[] = ['happy', 'sad', 'anxious', 'stressed', 'neutral', 'calm', 'angry', 'tired']
  const concerns = ['Anxiety', 'Depression', 'Stress', 'Relationships', 'Work/School', 'Sleep', 'Self-esteem', 'Grief']
  const goals = ['Feel better', 'Reduce stress', 'Improve sleep', 'Build confidence', 'Process emotions', 'Find support']
  const supportTypes: Array<'chat' | 'listener' | 'community' | 'all'> = ['chat', 'listener', 'community', 'all']

  return (
    <div className="max-w-2xl mx-auto py-12 px-4">
      <div className="bg-white rounded-lg shadow-lg p-8">
        <div className="mb-6">
          <h1 className="text-3xl font-bold text-gray-800 mb-2">Welcome to Mind Care!</h1>
          <p className="text-gray-600">
            Help us personalize your experience by answering a few questions. This is optional and you can skip it.
          </p>
        </div>

        <form onSubmit={handleSubmit} className="space-y-6">
          {/* Step 1: Current Mood */}
          {step === 1 && (
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-3">
                How are you feeling today?
              </label>
              <div className="grid grid-cols-4 gap-3">
                {moods.map((mood) => (
                  <button
                    key={mood}
                    type="button"
                    onClick={() => setFormData({ ...formData, currentMood: mood })}
                    className={`p-4 rounded-lg border-2 transition-colors ${
                      formData.currentMood === mood
                        ? 'border-primary-500 bg-primary-50'
                        : 'border-gray-200 hover:border-primary-300'
                    }`}
                  >
                    <div className="text-2xl mb-1">{getMoodEmoji(mood)}</div>
                    <div className="text-sm capitalize">{mood}</div>
                  </button>
                ))}
              </div>
            </div>
          )}

          {/* Step 2: Concerns */}
          {step === 2 && (
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-3">
                What are you looking for support with? (Select all that apply)
              </label>
              <div className="space-y-2">
                {concerns.map((concern) => (
                  <label key={concern} className="flex items-center p-3 border rounded-lg cursor-pointer hover:bg-gray-50">
                    <input
                      type="checkbox"
                      checked={formData.concerns?.includes(concern)}
                      onChange={(e) => {
                        const current = formData.concerns || []
                        if (e.target.checked) {
                          setFormData({ ...formData, concerns: [...current, concern] })
                        } else {
                          setFormData({ ...formData, concerns: current.filter((c) => c !== concern) })
                        }
                      }}
                      className="h-4 w-4 text-primary-600 focus:ring-primary-500 border-gray-300 rounded"
                    />
                    <span className="ml-3 text-gray-700">{concern}</span>
                  </label>
                ))}
              </div>
            </div>
          )}

          {/* Step 3: Goals */}
          {step === 3 && (
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-3">
                What are your goals? (Select all that apply)
              </label>
              <div className="space-y-2">
                {goals.map((goal) => (
                  <label key={goal} className="flex items-center p-3 border rounded-lg cursor-pointer hover:bg-gray-50">
                    <input
                      type="checkbox"
                      checked={formData.goals?.includes(goal)}
                      onChange={(e) => {
                        const current = formData.goals || []
                        if (e.target.checked) {
                          setFormData({ ...formData, goals: [...current, goal] })
                        } else {
                          setFormData({ ...formData, goals: current.filter((g) => g !== goal) })
                        }
                      }}
                      className="h-4 w-4 text-primary-600 focus:ring-primary-500 border-gray-300 rounded"
                    />
                    <span className="ml-3 text-gray-700">{goal}</span>
                  </label>
                ))}
              </div>
            </div>
          )}

          {/* Step 4: Support Type */}
          {step === 4 && (
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-3">
                What type of support are you most interested in?
              </label>
              <div className="space-y-3">
                {supportTypes.map((type) => (
                  <label
                    key={type}
                    className="flex items-center p-4 border-2 rounded-lg cursor-pointer hover:border-primary-300"
                  >
                    <input
                      type="radio"
                      name="supportType"
                      checked={formData.preferredSupportType === type}
                      onChange={() => setFormData({ ...formData, preferredSupportType: type })}
                      className="h-4 w-4 text-primary-600 focus:ring-primary-500 border-gray-300"
                    />
                    <span className="ml-3 text-gray-700 capitalize">{type === 'all' ? 'All of the above' : type}</span>
                  </label>
                ))}
              </div>
            </div>
          )}

          {/* Navigation Buttons */}
          <div className="flex justify-between pt-6">
            <div>
              {step > 1 && (
                <button
                  type="button"
                  onClick={() => setStep(step - 1)}
                  className="px-4 py-2 text-gray-700 border border-gray-300 rounded-md hover:bg-gray-50"
                >
                  Previous
                </button>
              )}
            </div>
            <div className="flex space-x-3">
              <button
                type="button"
                onClick={handleSkip}
                className="px-4 py-2 text-gray-600 hover:text-gray-800"
              >
                Skip
              </button>
              {step < 4 ? (
                <button
                  type="button"
                  onClick={() => setStep(step + 1)}
                  className="px-4 py-2 bg-primary-600 text-white rounded-md hover:bg-primary-700"
                >
                  Next
                </button>
              ) : (
                <button
                  type="submit"
                  className="px-4 py-2 bg-primary-600 text-white rounded-md hover:bg-primary-700"
                >
                  Complete
                </button>
              )}
            </div>
          </div>
        </form>
      </div>
    </div>
  )
}

export default Intake

