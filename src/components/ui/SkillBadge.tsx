import type { Skill } from '@/types/database'

interface SkillBadgeProps {
  skill: Skill
  showProficiency?: boolean
}

export function SkillBadge({ skill, showProficiency = false }: SkillBadgeProps) {
  return (
    <div className="inline-flex items-center gap-2 rounded-lg border border-gray-200 bg-white px-3 py-2 shadow-sm">
      {skill.icon && (
        <span className="text-lg" role="img" aria-hidden="true">
          {skill.icon}
        </span>
      )}
      <span className="text-sm font-medium text-gray-900">{skill.name}</span>
      {showProficiency && (
        <div className="flex gap-0.5">
          {[1, 2, 3, 4, 5].map((level) => (
            <div
              key={level}
              className={`h-1.5 w-1.5 rounded-full ${
                level <= skill.proficiency ? 'bg-primary-500' : 'bg-gray-200'
              }`}
            />
          ))}
        </div>
      )}
    </div>
  )
}
