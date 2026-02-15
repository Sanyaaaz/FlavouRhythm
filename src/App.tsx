import { useEffect, useMemo, useState } from 'react'
import { Navigate, Route, Routes, useNavigate, useParams } from 'react-router-dom'
import { PixelCard } from './components/PixelPrimitives'
import CravingAssistantWidget from './components/CravingAssistantWidget'
import LandingScreen from './screens/LandingScreen'
import LoginScreen from './screens/LoginScreen'
import OnboardingProfileScreen from './screens/OnboardingProfileScreen'
import HomeInputScreen from './screens/HomeInputScreen'
import ResultScreen from './screens/ResultScreen'
import WhatChangedScreen from './screens/WhatChangedScreen'
import RefinementChatScreen from './screens/RefinementChatScreen'
import CravingAwareMealsScreen from './screens/CravingAwareMealsScreen'
import { me } from './lib/authApi'
import type { UserProfilePayload } from './lib/profileApi'
import {
  adaptRecipeForPcos,
  fetchMicroMealPlan,
  type AdaptedRecipe,
  type MicroMealPlanDay,
  type RecipeChanges,
} from './lib/recipePlannerApi'

type FlowStepId = 'onboarding' | 'input' | 'result' | 'changes' | 'refine' | 'meals'

type StepDef = {
  id: FlowStepId
  label: string
}

const flowSteps: StepDef[] = [
  { id: 'onboarding', label: 'Profile' },
  { id: 'input', label: 'Food Input' },
  { id: 'result', label: 'Result' },
  { id: 'changes', label: 'What Changed' },
  { id: 'refine', label: 'Refinement' },
  { id: 'meals', label: 'Micro Meals' },
]

const SESSION_STORAGE_KEY = 'flavour_rhythm_session'

type SessionState = {
  email: string
  token: string
}

const isFlowStep = (value: string | undefined): value is FlowStepId =>
  !!value && flowSteps.some((step) => step.id === value)

function FlowShell({
  session,
  setSession,
  isRestoringSession,
  profile,
  setProfile,
}: {
  session: SessionState | null
  setSession: (value: SessionState | null) => void
  isRestoringSession: boolean
  profile: UserProfilePayload
  setProfile: (value: UserProfilePayload) => void
}) {
  const navigate = useNavigate()
  const { step } = useParams()
  const [activeStep, setActiveStep] = useState<FlowStepId>('onboarding')
  const [maxUnlockedStepIndex, setMaxUnlockedStepIndex] = useState(0)
  const [, setFoodInput] = useState({
    desire: '',
    selectedIntent: '',
    useHomeIngredients: false,
    homeIngredients: [] as string[],
    minCalories: null as number | null,
    maxCalories: null as number | null,
    minProtein: null as number | null,
    maxProtein: null as number | null,
    symptomFocus: null as string | null,
  })
  const [isAdaptingRecipe, setIsAdaptingRecipe] = useState(false)
  const [adaptError, setAdaptError] = useState('')
  const [adaptedRecipe, setAdaptedRecipe] = useState<AdaptedRecipe | null>(null)
  const [recipeChanges, setRecipeChanges] = useState<RecipeChanges | null>(null)
  const [microMealPlan, setMicroMealPlan] = useState<MicroMealPlanDay[]>([])

  useEffect(() => {
    if (!session && !isRestoringSession) {
      navigate('/login')
    }
  }, [session, isRestoringSession, navigate])

  useEffect(() => {
    if (isFlowStep(step)) {
      setActiveStep(step)
      const stepIndex = flowSteps.findIndex((entry) => entry.id === step)
      setMaxUnlockedStepIndex((current) => Math.max(current, stepIndex))
      return
    }

    if (step) {
      navigate('/app/onboarding', { replace: true })
    }
  }, [step, navigate])

  const unlockAndGoTo = (nextStep: FlowStepId) => {
    const nextIndex = flowSteps.findIndex((entry) => entry.id === nextStep)
    if (nextIndex === -1) return

    setMaxUnlockedStepIndex((current) => Math.max(current, nextIndex))
    setActiveStep(nextStep)
    navigate(`/app/${nextStep}`)
  }

  const goToStep = (targetStep: FlowStepId) => {
    const stepIndex = flowSteps.findIndex((entry) => entry.id === targetStep)
    if (stepIndex === -1) return

    setMaxUnlockedStepIndex((current) => Math.max(current, stepIndex))
    setActiveStep(targetStep)
    navigate(`/app/${targetStep}`)
  }

  const goToUnlockedStep = (targetStep: FlowStepId) => {
    const stepIndex = flowSteps.findIndex((entry) => entry.id === targetStep)
    if (stepIndex <= maxUnlockedStepIndex) {
      setActiveStep(targetStep)
      navigate(`/app/${targetStep}`)
    }
  }

  const isFoodFlowActive = ['input', 'result', 'changes', 'refine', 'meals'].includes(activeStep)

  const renderActiveStep = () => {
    if (isRestoringSession) {
      return (
        <div className="mx-auto w-full max-w-3xl">
          <PixelCard className="text-center">
            <p className="text-sm font-bold uppercase tracking-[0.2em]">Restoring session...</p>
          </PixelCard>
        </div>
      )
    }

    if (!session) {
      return (
        <div className="mx-auto w-full max-w-3xl">
          <PixelCard className="text-center">
            <p className="text-sm font-bold uppercase tracking-[0.2em]">Please login to continue.</p>
          </PixelCard>
        </div>
      )
    }

    switch (activeStep) {
      case 'onboarding':
        return (
          <OnboardingProfileScreen
            token={session.token}
            onContinue={(nextProfile) => {
              setProfile(nextProfile)
              unlockAndGoTo('input')
            }}
          />
        )
      case 'input':
        return (
          <HomeInputScreen
            isLoading={isAdaptingRecipe}
            error={adaptError}
            onAdapt={async (payload) => {
              setAdaptError('')
              setFoodInput(payload)
              setIsAdaptingRecipe(true)
              try {
                const plannerProfile = {
                  region: profile.preferred_cuisines[0] || profile.dietary_preferences || 'Global',
                  focus: profile.goal || profile.carb_sensitivity || 'General management',
                  dietaryRestrictions: [profile.dietary_preferences].filter(Boolean),
                  allergyNotes: [profile.allergies.join(', '), profile.custom_allergy || ''].filter(Boolean).join(', '),
                  deficiencies: [profile.deficiencies.join(', '), profile.custom_deficiency || '']
                    .filter(Boolean)
                    .join(', ')
                    .split(',')
                    .map((item) => item.trim())
                    .filter(Boolean),
                }
                const result = await adaptRecipeForPcos(payload, plannerProfile)
                setAdaptedRecipe(result.recipe)
                setRecipeChanges(result.changes)
                const plan = await fetchMicroMealPlan(payload, plannerProfile).catch(() => [])
                setMicroMealPlan(plan)
                unlockAndGoTo('result')
              } catch (error) {
                setAdaptError(error instanceof Error ? error.message : 'Unable to adapt recipe right now.')
              } finally {
                setIsAdaptingRecipe(false)
              }
            }}
          />
        )
      case 'result':
        return (
          <ResultScreen
            recipe={adaptedRecipe}
            onWhatChanged={() => unlockAndGoTo('changes')}
            onRefine={() => unlockAndGoTo('refine')}
          />
        )
      case 'changes':
        return <WhatChangedScreen changes={recipeChanges} onContinue={() => unlockAndGoTo('refine')} />
      case 'refine':
        return (
          <RefinementChatScreen
            recipe={adaptedRecipe}
            onContinue={() => unlockAndGoTo('meals')}
          />
        )
      case 'meals':
        return <CravingAwareMealsScreen mealPlan={microMealPlan} />
      default:
        return null
    }
  }

  return (
    <div>
      <div className="mx-auto w-full max-w-3xl">
        {session ? (
          <>
            <div className="mx-auto mb-6 flex w-fit flex-wrap justify-center gap-2 rounded-lg border-2 border-[#a95f77] bg-[#ffe5ed] p-2 shadow-[4px_4px_0px_#a95f77]">
              <button
                onClick={() => goToStep('input')}
                className={`rounded-md border-2 px-3 py-1 text-xs font-semibold ${
                  isFoodFlowActive
                    ? 'border-[#7e3f55] bg-[#ff9fbc] text-[#3f1725]'
                    : 'border-[#c8849c] bg-[#fff1f6] text-[#7e3f55]'
                }`}
              >
                Food Input
              </button>
              <button
                onClick={() => goToStep('onboarding')}
                className={`rounded-md border-2 px-3 py-1 text-xs font-semibold ${
                  activeStep === 'onboarding'
                    ? 'border-[#7e3f55] bg-[#ff9fbc] text-[#3f1725]'
                    : 'border-[#c8849c] bg-[#fff1f6] text-[#7e3f55]'
                }`}
              >
                Profile
              </button>
              <button
                onClick={() => {
                  setSession(null)
                  localStorage.removeItem(SESSION_STORAGE_KEY)
                  navigate('/')
                }}
                className="rounded-md border-2 border-[#7e3f55] bg-[#ffeef3] px-3 py-1 text-xs font-semibold text-[#7e3f55]"
              >
                Logout
              </button>
            </div>
            {activeStep === 'onboarding' ? (
              <PixelCard className="mb-6 bg-[#fff1f6] p-3 text-sm">
                <p className="font-bold">Session</p>
                <p className="mt-1 text-[#6b374b]">[USER] {session.email}</p>

                <p className="mt-3 font-bold">Profile Context</p>
                <p className="mt-1 text-[#6b374b]">
                  [GOAL] {profile.goal || 'Not set'} | [ACTIVITY] {profile.activity_level || 'Not set'}
                </p>
                <p className="mt-1 text-[#6b374b]">
                  [DIET] {profile.dietary_preferences || 'Not set'} | [CARB] {profile.carb_sensitivity || 'Not set'}
                </p>
                <p className="mt-1 text-[#6b374b]">
                  [PCOS] {profile.pcos_concerns.length ? profile.pcos_concerns.join(', ') : 'Not set'}
                </p>
                <p className="mt-1 text-[#6b374b]">
                  [ALLERGIES] {profile.allergies.length ? profile.allergies.join(', ') : 'Not set'}
                </p>
              </PixelCard>
            ) : null}

            {isFoodFlowActive ? (
              <div className="mx-auto mb-6 flex w-fit flex-wrap justify-center gap-2 rounded-lg border-2 border-[#c8849c] bg-[#fff1f6] p-2 shadow-[3px_3px_0px_#c8849c]">
                {flowSteps
                  .filter((step) => step.id !== 'onboarding')
                  .map((stepEntry) => {
                    const stepIndex = flowSteps.findIndex((entry) => entry.id === stepEntry.id)
                    return (
                      <button
                        key={stepEntry.id}
                        onClick={() => goToUnlockedStep(stepEntry.id)}
                        disabled={stepIndex > maxUnlockedStepIndex}
                        className={`rounded-md border-2 px-3 py-1 text-xs font-semibold ${
                          activeStep === stepEntry.id
                            ? 'border-[#7e3f55] bg-[#ff9fbc] text-[#3f1725]'
                            : 'border-[#c8849c] bg-[#fff7fa] text-[#7e3f55]'
                        }`}
                      >
                        {stepEntry.label}
                      </button>
                    )
                  })}
              </div>
            ) : null}
          </>
        ) : null}
      </div>
      {renderActiveStep()}
    </div>
  )
}

function LoginRoute({
  mode,
  session,
  onAuthenticated,
}: {
  mode: 'login' | 'signup'
  session: SessionState | null
  onAuthenticated: (payload: { email: string; token: string }) => void
}) {
  if (session) {
    return <Navigate to="/app/onboarding" replace />
  }

  return <LoginScreen onAuthenticated={onAuthenticated} initialMode={mode} />
}

function App() {
  const navigate = useNavigate()
  const [session, setSession] = useState<SessionState | null>(null)
  const [isRestoringSession, setIsRestoringSession] = useState(true)
  const [profile, setProfile] = useState<UserProfilePayload>({
    age: 22,
    height: null,
    weight: null,
    activity_level: '',
    pcos_concerns: [],
    goal: '',
    allergies: [],
    custom_allergy: null,
    deficiencies: [],
    custom_deficiency: null,
    dietary_preferences: '',
    preferred_cuisines: [],
    disliked_ingredients: null,
    protein_focus: false,
    carb_sensitivity: '',
    meal_style: '',
  })

  useEffect(() => {
    const restoreSession = async () => {
      const rawSession = localStorage.getItem(SESSION_STORAGE_KEY)
      if (!rawSession) {
        setIsRestoringSession(false)
        return
      }

      try {
        const parsedSession = JSON.parse(rawSession) as SessionState
        if (!parsedSession.token || !parsedSession.email) {
          throw new Error('Invalid saved session')
        }

        const user = await me(parsedSession.token)
        const restoredSession = { email: user.email, token: parsedSession.token }
        setSession(restoredSession)
        localStorage.setItem(SESSION_STORAGE_KEY, JSON.stringify(restoredSession))
      } catch {
        localStorage.removeItem(SESSION_STORAGE_KEY)
        setSession(null)
      } finally {
        setIsRestoringSession(false)
      }
    }

    void restoreSession()
  }, [])

  const handleAuthenticated = ({ email, token }: { email: string; token: string }) => {
    const nextSession = { email, token }
    setSession(nextSession)
    localStorage.setItem(SESSION_STORAGE_KEY, JSON.stringify(nextSession))
    navigate('/app/onboarding')
  }

  const landingRoutes = useMemo(
    () => ({
      login: '/login',
      signup: '/signup',
      onboarding: '/app/onboarding',
      input: '/app/input',
      result: '/app/result',
      changes: '/app/changes',
      refine: '/app/refine',
      meals: '/app/meals',
    }),
    []
  )

  return (
    <div className="min-h-screen bg-[#FFC0CB] bg-[linear-gradient(0deg,#ffc9d2_25%,#ffd8df_25%,#ffd8df_50%,#ffc9d2_50%,#ffc9d2_75%,#ffd8df_75%,#ffd8df_100%)] bg-[length:24px_24px] p-4 text-[#5d2b3a] sm:p-8">
      <Routes>
        <Route
          path="/"
          element={<LandingScreen onNavigate={(path) => navigate(path)} routes={landingRoutes} />}
        />
        <Route path="/login" element={<LoginRoute mode="login" session={session} onAuthenticated={handleAuthenticated} />} />
        <Route path="/signup" element={<LoginRoute mode="signup" session={session} onAuthenticated={handleAuthenticated} />} />
        <Route path="/app" element={<Navigate to="/app/onboarding" replace />} />
        <Route
          path="/app/:step"
          element={
            <FlowShell
              session={session}
              setSession={setSession}
              isRestoringSession={isRestoringSession}
              profile={profile}
              setProfile={setProfile}
            />
          }
        />
        <Route path="*" element={<Navigate to="/" replace />} />
      </Routes>
      <CravingAssistantWidget profile={profile} />
    </div>
  )
}

export default App
