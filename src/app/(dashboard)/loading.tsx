export default function DashboardLoading() {
    return (
        <div className="max-w-6xl mx-auto space-y-6 animate-pulse">
            {/* Banner skeleton */}
            <div className="bg-gray-50 border border-gray-200 rounded-2xl p-6 flex gap-4 items-start">
                <div className="w-12 h-12 bg-gray-200 rounded-xl shrink-0" />
                <div className="flex-1 space-y-3">
                    <div className="h-5 bg-gray-200 rounded w-1/3" />
                    <div className="h-4 bg-gray-100 rounded w-2/3" />
                    <div className="h-9 bg-gray-200 rounded w-40 mt-2" />
                </div>
            </div>

            {/* Header */}
            <div className="space-y-2">
                <div className="h-7 bg-gray-200 rounded w-1/2" />
                <div className="h-4 bg-gray-100 rounded w-1/3" />
            </div>

            {/* Grid de vacantes */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {Array.from({ length: 4 }).map((_, i) => (
                    <div key={i} className="bg-white border border-gray-100 rounded-2xl p-5 space-y-3">
                        <div className="flex items-start gap-3">
                            <div className="w-12 h-12 bg-gray-100 rounded-xl shrink-0" />
                            <div className="flex-1 space-y-2">
                                <div className="h-4 bg-gray-200 rounded w-3/4" />
                                <div className="h-3 bg-gray-100 rounded w-1/2" />
                            </div>
                        </div>
                        <div className="flex gap-2">
                            <div className="h-6 w-20 bg-gray-100 rounded-full" />
                            <div className="h-6 w-24 bg-gray-100 rounded-full" />
                        </div>
                    </div>
                ))}
            </div>
        </div>
    )
}
