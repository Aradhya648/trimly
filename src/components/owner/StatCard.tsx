interface Props {
  title: string
  value: string | number
  description?: string
  icon?: React.ReactNode
}

export default function StatCard({ title, value, description, icon }: Props) {
  return (
    <div className="bg-slate-900 border border-slate-800 rounded-2xl p-5">
      <div className="flex items-start justify-between gap-3">
        <div>
          <p className="text-slate-400 text-sm font-medium">{title}</p>
          <p className="text-3xl font-bold text-white mt-1">{value}</p>
          {description && <p className="text-slate-500 text-xs mt-1">{description}</p>}
        </div>
        {icon && (
          <div className="bg-emerald-500/10 rounded-xl p-2.5 text-emerald-400">
            {icon}
          </div>
        )}
      </div>
    </div>
  )
}
