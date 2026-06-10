export default function AdminDashboardLoading() {
    return (
        <div className="p-6 lg:p-10 space-y-8 animate-pulse">
            {/* Header */}
            <div className="space-y-2">
                <div className="h-8 bg-gray-200 rounded w-1/3" />
                <div className="h-4 bg-gray-100 rounded w-1/2" />
            </div>

            {/* Stats grid */}
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
                {Array.from({ length: 6 }).map((_, i) => (
                    <div key={i} className="bg-white border border-gray-100 rounded-2xl p-5 space-y-3 shadow-sm">
                        <div className="flex items-center gap-3">
                            <div className="w-10 h-10 bg-gray-100 rounded-xl" />
                            <div className="flex-1 space-y-2">
                                <div className="h-3 bg-gray-100 rounded w-2/3" />
                                <div className="h-6 bg-gray-200 rounded w-1/3" />
                            </div>
                        </div>
                        <div className="h-3 bg-gray-100 rounded w-3/4" />
                    </div>
                ))}
            </div>
        </div>
    )
}
