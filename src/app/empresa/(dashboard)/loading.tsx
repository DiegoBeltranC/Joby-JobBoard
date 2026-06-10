export default function EmpresaDashboardLoading() {
    return (
        <div className="space-y-8 animate-pulse">
            {/* Banner skeleton */}
            <div className="bg-violet-50/50 border border-violet-100 rounded-2xl p-6 flex gap-4 items-start">
                <div className="w-12 h-12 bg-violet-100 rounded-xl shrink-0" />
                <div className="flex-1 space-y-3">
                    <div className="h-5 bg-violet-100 rounded w-1/3" />
                    <div className="h-4 bg-violet-50 rounded w-3/4" />
                </div>
            </div>

            {/* Stats cards */}
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
                {Array.from({ length: 4 }).map((_, i) => (
                    <div key={i} className="bg-white border border-gray-100 rounded-2xl p-5 space-y-3">
                        <div className="w-10 h-10 bg-gray-100 rounded-xl" />
                        <div className="h-7 bg-gray-200 rounded w-1/2" />
                        <div className="h-3 bg-gray-100 rounded w-2/3" />
                    </div>
                ))}
            </div>

            {/* Content blocks */}
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
                {Array.from({ length: 2 }).map((_, i) => (
                    <div key={i} className="bg-white border border-gray-100 rounded-2xl p-6 space-y-3">
                        <div className="h-5 bg-gray-200 rounded w-1/3" />
                        <div className="h-4 bg-gray-100 rounded w-full" />
                        <div className="h-4 bg-gray-100 rounded w-5/6" />
                        <div className="h-4 bg-gray-100 rounded w-4/6" />
                    </div>
                ))}
            </div>
        </div>
    )
}
