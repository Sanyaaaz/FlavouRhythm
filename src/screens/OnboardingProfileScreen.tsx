import { useEffect, useMemo, useState } from 'react'
import { PixelButton, PixelCard, PixelShell } from '../components/PixelPrimitives'
import { createProfile, getProfile, updateProfile, type UserProfilePayload } from '../lib/profileApi'

type OnboardingProfileScreenProps = {
  token: string
  onContinue: (profile: UserProfilePayload) => void
}

const activityLevels = ['low', 'moderate', 'high']
const pcosConcerns = [
  'insulin resistance',
  'inflammation',
  'weight management',
  'irregular periods',
  'acne/hair issues',
  'fatigue',
]
const goals = ['reduce cravings', 'improve energy', 'weight balance', 'hormone-friendly eating', 'maintain healthy lifestyle']
const allergyOptions = ['dairy', 'gluten', 'nuts', 'soy', 'eggs', 'seafood', 'none']
const deficiencyOptions = ['iron deficiency', 'vitamin D deficiency', 'B12 deficiency', 'protein deficiency', 'none']
const dietaryPreferences = ['vegetarian', 'vegan', 'eggetarian', 'non-vegetarian']
const cuisineOptions = [
  'South Indian',
  'North Indian',
  'Mediterranean',
  'Middle Eastern',
  'Mexican',
  'East Asian',
  'Southeast Asian',
  'Global Fusion',
]
const carbSensitivityLevels = ['low', 'medium', 'high']
const mealStyles = ['small frequent meals', '3 main meals', 'flexible']

const emptyProfile: UserProfilePayload = {
  age: 22,
  height: null,
  weight: null,
  activity_level: 'moderate',
  pcos_concerns: [],
  goal: '',
  allergies: [],
  custom_allergy: '',
  deficiencies: [],
  custom_deficiency: '',
  dietary_preferences: '',
  preferred_cuisines: [],
  disliked_ingredients: '',
  protein_focus: false,
  carb_sensitivity: '',
  meal_style: '',
}

function toggleMulti(list: string[], value: string) {
  return list.includes(value) ? list.filter((item) => item !== value) : [...list, value]
}

function toggleNone(list: string[], value: string) {
  if (value === 'none') {
    return list.includes('none') ? [] : ['none']
  }
  const withoutNone = list.filter((item) => item !== 'none')
  return toggleMulti(withoutNone, value)
}

export default function OnboardingProfileScreen({ token, onContinue }: OnboardingProfileScreenProps) {
  const [form, setForm] = useState<UserProfilePayload>(emptyProfile)
  const [isLoading, setIsLoading] = useState(true)
  const [isEditing, setIsEditing] = useState(false)
  const [error, setError] = useState('')
  const [isSaving, setIsSaving] = useState(false)

  useEffect(() => {
    let isMounted = true

    const loadProfile = async () => {
      try {
        const profile = await getProfile(token)
        if (!isMounted) return
        setForm({
          age: profile.age,
          height: profile.height,
          weight: profile.weight,
          activity_level: profile.activity_level,
          pcos_concerns: profile.pcos_concerns,
          goal: profile.goal,
          allergies: profile.allergies,
          custom_allergy: profile.custom_allergy ?? '',
          deficiencies: profile.deficiencies,
          custom_deficiency: profile.custom_deficiency ?? '',
          dietary_preferences: profile.dietary_preferences,
          preferred_cuisines: profile.preferred_cuisines,
          disliked_ingredients: profile.disliked_ingredients ?? '',
          protein_focus: profile.protein_focus,
          carb_sensitivity: profile.carb_sensitivity,
          meal_style: profile.meal_style,
        })
        setIsEditing(true)
      } catch (caught) {
        const message = caught instanceof Error ? caught.message : 'Unable to load profile.'
        if (message.toLowerCase().includes('profile not found')) {
          setIsEditing(false)
        } else {
          setError(message)
        }
      } finally {
        if (isMounted) {
          setIsLoading(false)
        }
      }
    }

    void loadProfile()

    return () => {
      isMounted = false
    }
  }, [token])

  const requiredReady = useMemo(() => {
    return (
      form.age > 0 &&
      form.activity_level &&
      form.pcos_concerns.length > 0 &&
      form.goal &&
      form.allergies.length > 0 &&
      form.deficiencies.length > 0 &&
      form.dietary_preferences &&
      form.preferred_cuisines.length > 0 &&
      form.carb_sensitivity &&
      form.meal_style
    )
  }, [form])

  const handleSubmit = async () => {
    if (!requiredReady || isSaving) return
    setError('')
    setIsSaving(true)

    const payload: UserProfilePayload = {
      ...form,
      custom_allergy: form.custom_allergy?.trim() || null,
      custom_deficiency: form.custom_deficiency?.trim() || null,
      disliked_ingredients: form.disliked_ingredients?.trim() || null,
      height: form.height ? Number(form.height) : null,
      weight: form.weight ? Number(form.weight) : null,
    }

    try {
      if (isEditing) {
        const saved = await updateProfile(token, payload)
        onContinue(payload)
        setForm({
          ...payload,
          custom_allergy: saved.custom_allergy ?? '',
          custom_deficiency: saved.custom_deficiency ?? '',
          disliked_ingredients: saved.disliked_ingredients ?? '',
        })
      } else {
        await createProfile(token, payload)
        onContinue(payload)
        setIsEditing(true)
      }
    } catch (caught) {
      setError(caught instanceof Error ? caught.message : 'Unable to save profile.')
    } finally {
      setIsSaving(false)
    }
  }

  if (isLoading) {
    return (
      <PixelShell title="Loading profile" subtitle="Preparing your onboarding form.">
        <PixelCard className="text-center">
          <p className="text-sm font-bold uppercase tracking-[0.2em]">Loading...</p>
        </PixelCard>
      </PixelShell>
    )
  }

  return (
    <PixelShell
      title={isEditing ? 'Edit your health profile' : 'Build your health profile'}
      subtitle="Share your eating and PCOS context so we can personalize your food recommendations."
    >
      <PixelCard className="space-y-6">
        <section className="space-y-3">
          <p className="text-xs font-bold uppercase tracking-[0.2em]">[1] Basic Information</p>
          <div className="grid gap-4 sm:grid-cols-3">
            <label className="space-y-2 text-sm">
              <span className="text-xs font-semibold uppercase tracking-wide text-[#7e3f55]">Age</span>
              <input
                type="number"
                min={12}
                max={90}
                value={form.age}
                onChange={(event) => setForm((prev) => ({ ...prev, age: Number(event.target.value) }))}
                className="w-full rounded-lg border-[3px] border-[#b46a83] bg-white px-3 py-2 text-sm outline-none"
              />
            </label>
            <label className="space-y-2 text-sm">
              <span className="text-xs font-semibold uppercase tracking-wide text-[#7e3f55]">Height (optional)</span>
              <input
                type="number"
                value={form.height ?? ''}
                onChange={(event) =>
                  setForm((prev) => ({ ...prev, height: event.target.value ? Number(event.target.value) : null }))
                }
                className="w-full rounded-lg border-[3px] border-[#b46a83] bg-white px-3 py-2 text-sm outline-none"
              />
            </label>
            <label className="space-y-2 text-sm">
              <span className="text-xs font-semibold uppercase tracking-wide text-[#7e3f55]">Weight (optional)</span>
              <input
                type="number"
                value={form.weight ?? ''}
                onChange={(event) =>
                  setForm((prev) => ({ ...prev, weight: event.target.value ? Number(event.target.value) : null }))
                }
                className="w-full rounded-lg border-[3px] border-[#b46a83] bg-white px-3 py-2 text-sm outline-none"
              />
            </label>
          </div>
          <label className="space-y-2 text-sm">
            <span className="text-xs font-semibold uppercase tracking-wide text-[#7e3f55]">Activity level</span>
            <select
              value={form.activity_level}
              onChange={(event) => setForm((prev) => ({ ...prev, activity_level: event.target.value }))}
              className="w-full rounded-lg border-[3px] border-[#b46a83] bg-white px-3 py-2 text-sm outline-none"
            >
              <option value="">Select activity level</option>
              {activityLevels.map((item) => (
                <option key={item} value={item}>
                  {item}
                </option>
              ))}
            </select>
          </label>
        </section>

        <section className="space-y-3">
          <p className="text-xs font-bold uppercase tracking-[0.2em]">[2] PCOS-related Information</p>
          <div className="space-y-2">
            <p className="text-xs font-semibold uppercase tracking-wide text-[#7e3f55]">PCOS type or concerns</p>
            <div className="flex flex-wrap gap-2">
              {pcosConcerns.map((item) => (
                <button
                  key={item}
                  onClick={() => setForm((prev) => ({ ...prev, pcos_concerns: toggleMulti(prev.pcos_concerns, item) }))}
                  className={`rounded-md border-2 px-3 py-2 text-xs font-semibold uppercase tracking-wide ${
                    form.pcos_concerns.includes(item)
                      ? 'border-[#7e3f55] bg-[#ff9fbc] text-[#3f1725]'
                      : 'border-[#c8849c] bg-[#ffeef3] text-[#7e3f55]'
                  }`}
                >
                  {item}
                </button>
              ))}
            </div>
          </div>
          <label className="space-y-2 text-sm">
            <span className="text-xs font-semibold uppercase tracking-wide text-[#7e3f55]">Goal focus</span>
            <select
              value={form.goal}
              onChange={(event) => setForm((prev) => ({ ...prev, goal: event.target.value }))}
              className="w-full rounded-lg border-[3px] border-[#b46a83] bg-white px-3 py-2 text-sm outline-none"
            >
              <option value="">Select a goal</option>
              {goals.map((item) => (
                <option key={item} value={item}>
                  {item}
                </option>
              ))}
            </select>
          </label>
        </section>

        <section className="space-y-3">
          <p className="text-xs font-bold uppercase tracking-[0.2em]">[3] Allergies & Restrictions</p>
          <div className="flex flex-wrap gap-2">
            {allergyOptions.map((item) => (
              <button
                key={item}
                onClick={() => setForm((prev) => ({ ...prev, allergies: toggleNone(prev.allergies, item) }))}
                className={`rounded-md border-2 px-3 py-2 text-xs font-semibold uppercase tracking-wide ${
                  form.allergies.includes(item)
                    ? 'border-[#7e3f55] bg-[#ff9fbc] text-[#3f1725]'
                    : 'border-[#c8849c] bg-[#ffeef3] text-[#7e3f55]'
                }`}
              >
                {item}
              </button>
            ))}
          </div>
          <label className="space-y-2 text-sm">
            <span className="text-xs font-semibold uppercase tracking-wide text-[#7e3f55]">Custom allergy notes</span>
            <input
              type="text"
              value={form.custom_allergy ?? ''}
              onChange={(event) => setForm((prev) => ({ ...prev, custom_allergy: event.target.value }))}
              placeholder="e.g., sesame, shellfish"
              className="w-full rounded-lg border-[3px] border-[#b46a83] bg-white px-3 py-2 text-sm outline-none"
            />
          </label>
        </section>

        <section className="space-y-3">
          <p className="text-xs font-bold uppercase tracking-[0.2em]">[4] Deficiencies / Nutritional Needs</p>
          <div className="flex flex-wrap gap-2">
            {deficiencyOptions.map((item) => (
              <button
                key={item}
                onClick={() => setForm((prev) => ({ ...prev, deficiencies: toggleNone(prev.deficiencies, item) }))}
                className={`rounded-md border-2 px-3 py-2 text-xs font-semibold uppercase tracking-wide ${
                  form.deficiencies.includes(item)
                    ? 'border-[#7e3f55] bg-[#ff9fbc] text-[#3f1725]'
                    : 'border-[#c8849c] bg-[#ffeef3] text-[#7e3f55]'
                }`}
              >
                {item}
              </button>
            ))}
          </div>
          <label className="space-y-2 text-sm">
            <span className="text-xs font-semibold uppercase tracking-wide text-[#7e3f55]">Custom deficiency notes</span>
            <input
              type="text"
              value={form.custom_deficiency ?? ''}
              onChange={(event) => setForm((prev) => ({ ...prev, custom_deficiency: event.target.value }))}
              placeholder="e.g., magnesium, folate"
              className="w-full rounded-lg border-[3px] border-[#b46a83] bg-white px-3 py-2 text-sm outline-none"
            />
          </label>
        </section>

        <section className="space-y-3">
          <p className="text-xs font-bold uppercase tracking-[0.2em]">[5] Dietary Preferences</p>
          <label className="space-y-2 text-sm">
            <span className="text-xs font-semibold uppercase tracking-wide text-[#7e3f55]">Diet type</span>
            <select
              value={form.dietary_preferences}
              onChange={(event) => setForm((prev) => ({ ...prev, dietary_preferences: event.target.value }))}
              className="w-full rounded-lg border-[3px] border-[#b46a83] bg-white px-3 py-2 text-sm outline-none"
            >
              <option value="">Select diet</option>
              {dietaryPreferences.map((item) => (
                <option key={item} value={item}>
                  {item}
                </option>
              ))}
            </select>
          </label>
          <div className="space-y-2">
            <p className="text-xs font-semibold uppercase tracking-wide text-[#7e3f55]">Preferred cuisines</p>
            <div className="flex flex-wrap gap-2">
              {cuisineOptions.map((item) => (
                <button
                  key={item}
                  onClick={() => setForm((prev) => ({ ...prev, preferred_cuisines: toggleMulti(prev.preferred_cuisines, item) }))}
                  className={`rounded-md border-2 px-3 py-2 text-xs font-semibold uppercase tracking-wide ${
                    form.preferred_cuisines.includes(item)
                      ? 'border-[#7e3f55] bg-[#ff9fbc] text-[#3f1725]'
                      : 'border-[#c8849c] bg-[#ffeef3] text-[#7e3f55]'
                  }`}
                >
                  {item}
                </button>
              ))}
            </div>
          </div>
          <label className="space-y-2 text-sm">
            <span className="text-xs font-semibold uppercase tracking-wide text-[#7e3f55]">Disliked ingredients</span>
            <input
              type="text"
              value={form.disliked_ingredients ?? ''}
              onChange={(event) => setForm((prev) => ({ ...prev, disliked_ingredients: event.target.value }))}
              placeholder="e.g., mushrooms, okra"
              className="w-full rounded-lg border-[3px] border-[#b46a83] bg-white px-3 py-2 text-sm outline-none"
            />
          </label>
        </section>

        <section className="space-y-3">
          <p className="text-xs font-bold uppercase tracking-[0.2em]">[6] Protein & Nutrition Preferences</p>
          <div className="flex flex-wrap gap-2">
            <button
              onClick={() => setForm((prev) => ({ ...prev, protein_focus: true }))}
              className={`rounded-md border-2 px-3 py-2 text-xs font-semibold uppercase tracking-wide ${
                form.protein_focus
                  ? 'border-[#7e3f55] bg-[#ff9fbc] text-[#3f1725]'
                  : 'border-[#c8849c] bg-[#ffeef3] text-[#7e3f55]'
              }`}
            >
              Protein focus: yes
            </button>
            <button
              onClick={() => setForm((prev) => ({ ...prev, protein_focus: false }))}
              className={`rounded-md border-2 px-3 py-2 text-xs font-semibold uppercase tracking-wide ${
                !form.protein_focus
                  ? 'border-[#7e3f55] bg-[#ff9fbc] text-[#3f1725]'
                  : 'border-[#c8849c] bg-[#ffeef3] text-[#7e3f55]'
              }`}
            >
              Protein focus: no
            </button>
          </div>
          <label className="space-y-2 text-sm">
            <span className="text-xs font-semibold uppercase tracking-wide text-[#7e3f55]">Carb sensitivity</span>
            <select
              value={form.carb_sensitivity}
              onChange={(event) => setForm((prev) => ({ ...prev, carb_sensitivity: event.target.value }))}
              className="w-full rounded-lg border-[3px] border-[#b46a83] bg-white px-3 py-2 text-sm outline-none"
            >
              <option value="">Select sensitivity</option>
              {carbSensitivityLevels.map((item) => (
                <option key={item} value={item}>
                  {item}
                </option>
              ))}
            </select>
          </label>
          <label className="space-y-2 text-sm">
            <span className="text-xs font-semibold uppercase tracking-wide text-[#7e3f55]">Meal style</span>
            <select
              value={form.meal_style}
              onChange={(event) => setForm((prev) => ({ ...prev, meal_style: event.target.value }))}
              className="w-full rounded-lg border-[3px] border-[#b46a83] bg-white px-3 py-2 text-sm outline-none"
            >
              <option value="">Select meal style</option>
              {mealStyles.map((item) => (
                <option key={item} value={item}>
                  {item}
                </option>
              ))}
            </select>
          </label>
        </section>

        {error ? <p className="text-sm font-semibold text-[#8c1d40]">{error}</p> : null}

        <PixelButton
          className={`w-full py-4 text-base ${requiredReady ? '' : 'cursor-not-allowed opacity-60'}`}
          onClick={handleSubmit}
        >
          {isSaving ? 'Saving...' : isEditing ? 'Update profile' : 'Save profile'}
        </PixelButton>
      </PixelCard>
    </PixelShell>
  )
}
